import os
import tempfile
import json
import traceback
import base64
from typing import List, Dict, Any, Optional
import io
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import texttospeech
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import sys
import shutil
import re
import asyncio
from contextlib import asynccontextmanager
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

def resolve_and_verify_command(raw_command: str) -> str:
    """
    Resolves a command or script path to an absolute executable path and verifies its existence.
    Enforces Verification, Logging, Path Handling, and Debug requirements.
    """
    # 3. Path Handling: If it's a relative path, contains path separators, or is a local script/file
    is_path = (
        os.path.sep in raw_command 
        or (sys.platform == "win32" and "/" in raw_command) 
        or raw_command.startswith(".") 
        or os.path.exists(raw_command)
    )
    
    if is_path:
        if not os.path.isabs(raw_command):
            resolved_path = os.path.abspath(os.path.join(os.getcwd(), raw_command))
        else:
            resolved_path = raw_command
            
        # 1 & 2. Verification & Logging for script paths / files
        if not os.path.exists(resolved_path):
            error_msg = f"MCP tool command not found: {raw_command} (resolved path: {resolved_path})"
            print(f"❌ [MCP ERROR] {error_msg}")
            raise FileNotFoundError(error_msg)
    else:
        # 1 & 2. Verification & Logging for commands in system PATH
        resolved_path = shutil.which(raw_command)
        if not resolved_path:
            warning_msg = "MCP tool executable (npx) not found. Ensure Node.js is installed."
            print(f"⚠️ [WARNING] {warning_msg}")
            raise FileNotFoundError(warning_msg)
            
    return resolved_path

def get_verified_mcp_params() -> StdioServerParameters:
    """
    Resolves and verifies the npx executable path across production (Railway) and local environments.
    """
    raw_cmd = os.getenv("MCP_NPX_PATH") or ("npx.cmd" if sys.platform == "win32" else "npx")
    resolved_cmd = resolve_and_verify_command(raw_cmd)
        
    return StdioServerParameters(
        command=resolved_cmd,
        args=["-y", "mcp-remote", "https://mcp.kapruka.com/mcp"]
    )

@asynccontextmanager
async def safe_stdio_client(server_params: StdioServerParameters):
    """
    Wraps stdio_client with explicit verification, debug logging, and clear error reporting.
    """
    # Ensure command is verified and resolved to absolute path
    try:
        resolved_command = resolve_and_verify_command(server_params.command)
        server_params.command = resolved_command
    except FileNotFoundError as e:
        print("⚠️ [WARNING] MCP tool executable (npx) not found. Ensure Node.js is installed.")
        raise e

    # 4. Debug Logging: Log the absolute path just before initializing the client
    print(f"🔍 [MCP DEBUG] Initializing stdio_client executing command at absolute path: {server_params.command} | Args: {server_params.args}")
    
    try:
        async with stdio_client(server_params) as (read_stream, write_stream):
            yield read_stream, write_stream
    except FileNotFoundError as fnf:
        print("⚠️ [WARNING] MCP tool executable (npx) not found. Ensure Node.js is installed.")
        raise FileNotFoundError("MCP tool executable (npx) not found. Ensure Node.js is installed.") from fnf


# Load environment variables
load_dotenv()

# Handle Google Cloud service account JSON credentials safely in production (Railway)
gcp_creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
if gcp_creds_json:
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as temp_creds_file:
            temp_creds_file.write(gcp_creds_json)
            temp_creds_path = temp_creds_file.name
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_creds_path
        print(f"🔒 [GCP CREDENTIALS] Successfully loaded GOOGLE_CREDENTIALS_JSON into temp file: {temp_creds_path}")
    except Exception as e:
        print(f"⚠️ [WARNING] Failed to write GOOGLE_CREDENTIALS_JSON to temp file: {e}")

# Configure Gemini
api_keys_env = os.getenv("GEMINI_API_KEYS")
api_key_single = os.getenv("GEMINI_API_KEY")

API_KEYS = []
if api_keys_env:
    API_KEYS = [k.strip() for k in api_keys_env.split(",") if k.strip()]
elif api_key_single and api_key_single != "your_key_here":
    API_KEYS = [api_key_single]

current_key_index = 0

if API_KEYS:
    genai.configure(api_key=API_KEYS[current_key_index])

def rotate_api_key():
    global current_key_index
    if not API_KEYS:
        return
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    genai.configure(api_key=API_KEYS[current_key_index])
    print(f"[WARNING] API Limit reached! Rotating to Key Index: {current_key_index}")

# Initialize FastAPI
app = FastAPI(title="Kapruka AI Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://kapruka-ai-eight.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Tool (Function Calling Schema)
kapruka_search_products_tool = {
    "function_declarations": [
        {
            "name": "kapruka_search_products",
            "description": "Search for products on Kapruka based on query and filters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "q": {"type": "string", "description": "The search query (e.g. 'cake', 'roses')."},
                    "category": {"type": "string", "description": "The product category to filter by."},
                    "min_price": {"type": "integer", "description": "The minimum price filter."},
                    "max_price": {"type": "integer", "description": "The maximum price filter."},
                    "in_stock_only": {"type": "boolean", "description": "Whether to return only in-stock items."},
                    "sort": {"type": "string", "description": "The sort order (e.g. 'price_asc', 'price_desc')."}
                },
                "required": ["q"]
            }
        }
    ]
}

kapruka_list_categories_tool = {
    "function_declarations": [
        {
            "name": "kapruka_list_categories",
            "description": "Get a list of Kapruka product categories and their URLs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "depth": {"type": "integer", "description": "The depth of subcategories to fetch (e.g. 1 or 2)."}
                }
            }
        }
    ]
}

# Request Models
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []
    chat_history: List[Dict[str, Any]] = []

class CheckDeliveryRequest(BaseModel):
    city: str
    delivery_date: str
    product_id: str

class CreateOrderRequest(BaseModel):
    cart: List[Dict[str, Any]]
    recipient: Dict[str, Any]
    delivery: Dict[str, Any]
    gift_message: Optional[str] = None

class AudioRequest(BaseModel):
    audio_data: str

class TTSRequest(BaseModel):
    text: str

def parse_kapruka_markdown(markdown_text: str) -> List[Dict[str, str]]:
    """
    Parses the raw Markdown text returned by the Kapruka search MCP tool 
    into a structured list of dictionaries for frontend rendering.
    
    Args:
        markdown_text (str): The raw text response from the MCP tool.
        
    Returns:
        List[Dict[str, str]]: A list containing parsed product details (id, name, price, link).
    """
    products = []
    # Split text into potential product entries
    entries = re.split(r'\n(?=[\*\-])', markdown_text)
    
    for entry in entries:
        name_match = re.search(r'\*\*(.+?)\*\*', entry)
        if not name_match:
            continue
        name = name_match.group(1).strip()
        
        price_match = re.search(r'([\d,]+(?:\.\d+)?)\s*(?:LKR|Rs\.?)', entry, re.IGNORECASE)
        if not price_match:
            price_match = re.search(r'(?:Rs\.?|LKR)\s*([\d,]+(?:\.\d+)?)', entry, re.IGNORECASE)
        price = price_match.group(1).replace(',', '').strip() if price_match else "0"
        
        link_match = re.search(r'\[.*?\]\((https?://[^\)]+)\)', entry)
        link = link_match.group(1) if link_match else ""
        
        id_match = re.search(r'ID:\s*`?([A-Za-z0-9_-]+)`?', entry, re.IGNORECASE)
        if not id_match and link:
            id_match = re.search(r'/kid/([A-Za-z0-9_-]+)', link, re.IGNORECASE)
        if not id_match:
            id_match = re.search(r'\b([A-Z0-9]+_[A-Z0-9_]+)\b', entry)
        
        prod_id = id_match.group(1).strip() if id_match else f"prod_{len(products)+1}"
        
        products.append({
            "id": prod_id,
            "name": name,
            "price": price,
            "link": link
        })
        
    return products

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Primary agentic endpoint that handles conversational AI and tool execution.
    It acts as a man-in-the-middle proxy between the React frontend and the Gemini LLM.
    
    Args:
        request (ChatRequest): The payload containing the user's message and chat history.
        
    Returns:
        dict: A JSON response containing the text reply, extracted products (if any), 
              category targets (if any), and error metadata.
    """
    # Ensure api_key is configured
    if not API_KEYS:
        return {"reply": "Error: GEMINI_API_KEYS is not configured in the backend.", "products": [], "category_target": None, "error_type": "api_key_missing"}
        
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        tools=[kapruka_search_products_tool, kapruka_list_categories_tool],
        system_instruction="""You are 'Kapruka AI', a warm Sri Lankan e-commerce concierge.

CRITICAL RULE 1: STRICT LANGUAGE MIRRORING & NATURAL CONVERSATION
- DETECT the user's language first.
- GREETING RULE: ONLY use greetings like "Ayubowan!" (for English) or "Ela machan!" (for Sinhala/Singlish) AT THE VERY BEGINNING of the conversation (the first user message). DO NOT repeat these greetings in subsequent messages. Maintain a natural, ongoing conversational flow.
- IF ENGLISH: Reply ONLY in flawless, high-end English. Act as a premium concierge. DO NOT use Singlish.
- IF SINHALA/SINGLISH: Reply in a friendly, local conversational tone.

CRITICAL RULE 2: TOOL USAGE
- BROAD QUERIES (NO TOOLS): If the user asks for general ideas (e.g., "gift for GF", "monada denna hoda"), DO NOT call search tools. Suggest 2-3 categories from your knowledge matching the USER'S LANGUAGE.
- SPECIFIC QUERIES (USE SEARCH): ONLY invoke `kapruka_search_products` when a specific item is named (e.g., "red frock", "chocolate cake", "malak"). Keep your text reply to 1 short sentence.
- ENGLISH TRANSLATION FOR SEARCH: When invoking `kapruka_search_products`, you MUST translate any Sinhala or Singlish query keywords into English first! E.g., if the user says "malak" or "mal ganna oni", invoke `kapruka_search_products(q="flowers")`. If "keek ekak", invoke `kapruka_search_products(q="cake")`. Never pass Sinhala/Singlish words directly to `q` because the product catalog is strictly indexed in English.

CRITICAL RULE 3: CATEGORY LINKS
- If suggesting a category, NEVER use standard markdown links. Secretly append this tag at the end of your text: `[CATEGORY: Name|https://url...]`. Our backend will extract it.

CRITICAL RULE 4: ORDER TRACKING & CUSTOMER SUPPORT
- If the user asks to track an order, find a package, or check order status (e.g., "track order", "mage order eka ko", "where is my delivery"), DO NOT say you cannot help.
- Instead, politely explain that they can check the live status via the Kapruka tracking portal, and MUST append this exact hidden tag: `[CATEGORY: Track Order|https://www.kapruka.com/track_order.jsp]`.
- IF ENGLISH: "Ayubowan! I can certainly guide you to our tracking portal. Please click the button below to track your package securely. [CATEGORY: Track Order|https://www.kapruka.com/track_order.jsp]"
- IF SINHALA/SINGLISH: "Ela machan! Oyage order eka track karanna palleha button eka click karanna. [CATEGORY: Track Order|https://www.kapruka.com/track_order.jsp]"

CRITICAL RULE 5: UI CONTEXT & CONCISENESS
When you use the tool to search and display products, DO NOT manually list the product names, prices, or details in your text response. The frontend UI will automatically display beautiful product cards for the user. Keep your text response extremely short, elegant, and conversational (e.g., "Here are some excellent laptop bags I found for you:"). If you ever need to present a list for non-product reasons, ALWAYS use proper markdown bullet points and line breaks. Never output a dense wall of text.

FORMATTING RULE: DO NOT use markdown asterisks (*) or hashes (#) for lists or headers. If you need to make a list, use clean unicode bullets (•) or relevant emojis (🌸, 🎁, 💎) followed by a space. Keep paragraphs short, clean, and visually elegant.

CRITICAL FATAL RULE: GENDER, RELATIONSHIPS, AND SINHALA SUFFIXES
Users will frequently use Singlish/English root words attached to Sinhala suffixes (e.g., "bfta" = bf + ta, "kolleta" = kolla + ta, "bfge" = bf + ge). You MUST extract the base root word and ABSOLUTELY RESTRICT your suggestions based on gender:

1. MALE ROOT WORDS: bf, boy, boyfriend, husband, hubby, thaththa, ayya, malli, kolla, aiyya.
   -> ACTION: If the user input contains ANY of these roots (even hidden in words like 'bfta', 'kolleta'), you MUST EXCLUSIVELY suggest items like: Watches, Wallets, Men's Perfumes, Men's Clothing, Electronics, or "Gifts for Him".
   -> FATAL VIOLATION: YOU MUST NEVER, UNDER ANY CIRCUMSTANCES, suggest Jewellery, Ladies Bags, Soft Toys, Flowers, or "Gifts for Her" for a male root word. This breaks the application.

2. FEMALE ROOT WORDS: gf, girl, girlfriend, wife, wifey, amma, akka, nangi, kella.
   -> ACTION: Suggest Flowers, Jewellery, Ladies Bags, Soft Toys, Cakes, or "Gifts for Her".

EASTER EGG RULE (OWNER INQUIRY):
If the user asks "who is the owner", "owner kauda", "kapruka aithikaraya kauda", or anything asking about the founder of Kapruka, you must respond in a funny, friendly Singlish/Sinhala way acknowledging his baldness humorously. 
Respond EXACTLY with something like: "Kapruka eke owner thamai Dulith Herath. Ape boss thama! Pora tikak thattaya unata eya supiri wadda machan! 😎 Oya mona hari ganna balanawada?" (Keep it lighthearted, respectful but funny).

CRITICAL RULE: MOOD & SENTIMENT ANALYSIS
You must analyze the emotional tone of the user's prompt. 
- Apologetic/Sad/Relationship Issues (e.g., "taraha wela", "sorry", "samawa", "dukai", "my girlfriend is mad"): 
  -> ACTION: Respond with high empathy. Act as a supportive best friend. Provide comforting words AND strictly suggest "Apology Gifts" such as Chocolate Boxes, Red Roses, Soft Toys, or Custom Cakes. Example response vibe: "Ayyoo machan, ganan ganna epa. Kello ohoma thama. Me chocolate box ekai, lassan rose bouquet ekai yawamu, sathiye tharaha nathi wei! ❤️"
- Celebratory/Happy (e.g., "pass wuna", "wedding", "anniversary", "birthday"): 
  -> ACTION: Match their high energy with excitement and emojis. Suggest premium gifts, cakes, and party items.
Always mirror the user's emotional state appropriately while maintaining your Singlish/Sinhala persona.

CRITICAL RULE: STRICT LANGUAGE CONSISTENCY & NO CODE-SWITCHING
1. You MUST keep the ENTIRE response in the exact same language the user initiated the conversation in. 
2. NO HALF-AND-HALF: If you start responding in Singlish (Romanized Sinhala), you MUST NOT switch to English halfway through.
   - WRONG: "Ayyoo machan, ganan ganna epa. Sometimes a thoughtful gift can help to win her over."
   - CORRECT: "Ayyoo machan, ganan ganna epa. Podi lassan gift ekak dunnama godak welawata hitha hadenawa. Api balamuda eyawa shape karaganna hoda deyak?"
3. When outputting product categories (like Chocolate Boxes, Red Roses), weave them naturally into the Sinhala/Singlish sentence (e.g., "Pangiri wage chocolate box ekakui, lassan red roses bouquet ekakui yawamu"). Keep the Sri Lankan best-friend vibe 100% intact throughout the entire message.
"""
    )
    
    # 🧠 DYNAMIC SESSION REBUILDING STRATEGY
    
    # Use chat_history if provided, otherwise fallback to history
    raw_history = request.chat_history if request.chat_history else request.history
    
    reconstructed_history = []
    if raw_history:
        # Exclude the very last newly edited user prompt if it matches the current request message
        history_to_build = raw_history
        if raw_history[-1].get("role") == "user" and raw_history[-1].get("content") == request.message:
            history_to_build = raw_history[:-1]
            
        # 2. Iterate through the provided history and rebuild the session's internal memory
        for h in history_to_build:
            r = h.get("role")
            role = "user" if r == "user" else "model"
            reconstructed_history.append(
                {"role": role, "parts": [h.get("content", "")]}
            )

    chat = model.start_chat(history=reconstructed_history)
    
    extracted_products = []
    
    for _ in range(max(1, len(API_KEYS))):
        try:
            response = await chat.send_message_async(request.message)
            
            # ⚙️ Gemini Tool Interception Loop
            parts = []
            if response.candidates and response.candidates[0].content.parts:
                parts = response.candidates[0].content.parts
                
            for part in parts:
                if part.function_call:
                    fn = part.function_call
                    if fn.name in ["kapruka_search_products", "kapruka_list_categories"]:
                        print(f"Intercepted function call: {fn.name}")

                        raw_args = fn.args
                        mcp_arguments = {key: raw_args[key] for key in raw_args}

                        if "min_price" in mcp_arguments and mcp_arguments["min_price"] is not None:
                            mcp_arguments["min_price"] = int(mcp_arguments["min_price"])
                        if "max_price" in mcp_arguments and mcp_arguments["max_price"] is not None:
                            mcp_arguments["max_price"] = int(mcp_arguments["max_price"])

                        print(f"\n🚀 [DEBUG] ESTABLISHING MCP BRIDGE | TOOL: {fn.name} | ARGS: {mcp_arguments}")

                        result_text = "No results found."
                        try:
                            server_params = get_verified_mcp_params()
                            async with safe_stdio_client(server_params) as (read_stream, write_stream):
                                async with ClientSession(read_stream, write_stream) as session:
                                    await session.initialize()
                                    mcp_result = await session.call_tool(fn.name, arguments={"params": mcp_arguments})
                                    result_text = mcp_result.content[0].text if mcp_result.content else ""

                                    if fn.name == "kapruka_search_products":
                                        extracted_products = parse_kapruka_markdown(result_text)
                                        
                                        async def resolve_product_image(session, prod_dict):
                                            for attempt in range(3):
                                                try:
                                                    detail_result = await session.call_tool("kapruka_get_product", arguments={"params": {"product_id": prod_dict["id"]}})
                                                    detail_text = detail_result.content[0].text if detail_result.content else ""
                                                    if "rate limit" in detail_text.lower() or "500" in detail_text.lower():
                                                        await asyncio.sleep(0.4 * (attempt + 1))
                                                        continue
                                                    img_match = re.search(r'!\[.*?\]\((.*?)\)', detail_text)
                                                    if not img_match:
                                                        img_match = re.search(r'(https?://[^\s]+(?:\.jpg|\.jpeg|\.png|\.webp|\.gif)[^\s]*)', detail_text, re.IGNORECASE)
                                                    if img_match:
                                                        prod_dict["image"] = img_match.group(1).strip().rstrip(')]}')
                                                    else:
                                                        prod_dict["image"] = None
                                                    break
                                                except Exception:
                                                    prod_dict["image"] = None
                                                    await asyncio.sleep(0.3)
                                            print(f"📷 [IMAGE TRACE] ID: {prod_dict['id']} -> URL: {prod_dict['image']}")
                                            return prod_dict

                                        for p in extracted_products[:5]:
                                            await resolve_product_image(session, p)
                                            await asyncio.sleep(0.3)
                                        for p in extracted_products[5:]:
                                            p["image"] = None
                                            
                        except FileNotFoundError as fnf_err:
                            print("⚠️ [WARNING] MCP tool executable (npx) not found. Ensure Node.js is installed.")
                            result_text = "MCP tool executable (npx) not found. Ensure Node.js is installed."
                        except Exception as e:
                            print(f"🚨 [DEBUG] Bridge Exception: {str(e)}")
                            traceback.print_exc()
                            result_text = f"Failed to connect via mcp-remote: {str(e)}"

                        response = await chat.send_message_async(
                            genai.protos.Content(
                                parts=[genai.protos.Part(
                                    function_response=genai.protos.FunctionResponse(
                                        name=fn.name,
                                        response={"result": result_text}
                                    )
                                )]
                            )
                        )
                            
                        break # Process only one function call

            try:
                final_reply = response.text
            except ValueError:
                final_reply = "I've fetched that for you right here!"

            if extracted_products:
                parts = re.split(r'\n\s*[\*\-]\s', final_reply)
                final_reply = parts[0].strip()

            category_target = None
            cat_match = re.search(r'\[CATEGORY:\s*(.*?)\|\s*(https?://[^\]]+)\]', final_reply, re.IGNORECASE)
            if cat_match:
                category_target = {"name": cat_match.group(1).strip(), "url": cat_match.group(2).strip()}
                final_reply = re.sub(r'\[CATEGORY:.*?\]', '', final_reply, flags=re.IGNORECASE).strip()

            return {
                "reply": final_reply, 
                "products": extracted_products, 
                "category_target": category_target,
                "error_type": None
            }
        
        except Exception as e:
            error_msg = str(e).lower()
            if "429" in error_msg or "quota" in error_msg or "exhausted" in error_msg or "too many requests" in error_msg:
                rotate_api_key()
                # Reconstruct the session with the new API key to ensure clean state
                reconstructed_history = []
                if raw_history:
                    history_to_build = raw_history
                    if raw_history[-1].get("role") == "user" and raw_history[-1].get("content") == request.message:
                        history_to_build = raw_history[:-1]
                    for h in history_to_build:
                        r = h.get("role")
                        role = "user" if r == "user" else "model"
                        reconstructed_history.append(
                            {"role": role, "parts": [h.get("content", "")]}
                        )
                chat = model.start_chat(history=reconstructed_history)
                continue
            else:
                error_details = traceback.format_exc()
                print(error_details)
                return {
                    "reply": f"Sorry machan, podi technical awulak: {str(e)}",
                    "products": [],
                    "category_target": None,
                    "error_type": "general_error"
                }

    # If the loop finishes without breaking/returning, all keys are exhausted
    return {
        "reply": "Machan, API limit eka panala thiyenne. Palleha timer eka iwara wuna gaman aayeth try karanna! ⏳",
        "products": [],
        "category_target": None,
        "error_type": "rate_limit",
        "retry_after": 60
    }

@app.get("/search-cities")
async def search_cities(q: str = ""):
    """
    Proxy endpoint that queries the Kapruka remote MCP server for valid delivery cities.
    Used by the frontend UI to populate the autocomplete dropdown in the checkout form.
    
    Args:
        q (str): The partial city name string to query.
        
    Returns:
        dict: A JSON list of matching city strings.
    """
    if len(q) < 2:
        return {"cities": []}
        
    try:
        server_params = get_verified_mcp_params()
        async with safe_stdio_client(server_params) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                
                # Execute Kapruka delivery cities lookup tool
                mcp_result = await session.call_tool(
                    "kapruka_list_delivery_cities", 
                    arguments={"params": {"query": q, "limit": 8}}
                )
                
                raw_text = mcp_result.content[0].text if mcp_result.content else ""
                
                # Regex parsing to extract clean city names from Markdown list rows
                import re
                cities = re.findall(r'[*-\d\.]+\s*([A-Za-z0-9\s-]+(?:,\s*[A-Za-z0-9\s-]+)*)', raw_text)
                
                # Clean up extracted strings
                cleaned_cities = [c.strip() for c in cities if "cities" not in c.lower() and len(c.strip()) > 2]
                
                return {"cities": list(set(cleaned_cities))}
    except FileNotFoundError as fnf_err:
        print("⚠️ [WARNING] MCP tool executable (npx) not found. Ensure Node.js is installed.")
        return {"cities": []}
    except Exception as e:
        print(f"🚨 Safe City Catch: {str(e)}")
        return {"cities": []}
    except BaseException as be:
        # 🚨 BaseExceptionGroup Catch
        # Asynchronous context managers (like `stdio_client` and `ClientSession` using AnyIO) 
        # can occasionally throw BaseExceptionGroups when cancelling multiple concurrent tasks.
        # We explicitly catch `BaseException` to prevent the entire ASGI worker from terminating.
        print(f"🚨 System Exception Group Catch")
        return {"cities": []}

@app.post("/check-delivery")
async def check_delivery_endpoint(request: CheckDeliveryRequest):
    """
    Calculates the exact Kapruka delivery fee for a specific city, date, and product.
    Invokes the remote kapruka_check_delivery tool via MCP and extracts the numeric LKR rate.
    
    Args:
        request (CheckDeliveryRequest): The payload containing the city, date, and product ID.
        
    Returns:
        dict: The parsed delivery fee (numeric) and the raw text payload.
    """
    try:
        server_params = get_verified_mcp_params()
        async with safe_stdio_client(server_params) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                
                wrapped_params = {
                    "params": {
                        "city": request.city,
                        "delivery_date": request.delivery_date,
                        "product_id": request.product_id
                    }
                }
                mcp_result = await session.call_tool("kapruka_check_delivery", arguments=wrapped_params)
                raw_delivery_text = mcp_result.content[0].text if mcp_result.content else ""
                
                print(f"🚚 [DEBUG] KAPRUKA DELIVERY RAW OUTPUT: {raw_delivery_text}")
                
                # Robust Regex Extraction
                rate_match = re.search(r'(?:LKR|Rs\.?|Rate:?)\s*([\d,]+(?:\.\d+)?)', raw_delivery_text, re.IGNORECASE)
                if not rate_match:
                    rate_match = re.search(r'([\d,]+(?:\.\d+)?)\s*(?:LKR|Rs\.?)', raw_delivery_text, re.IGNORECASE)
                
                if rate_match:
                    try:
                        delivery_fee = int(float(rate_match.group(1).replace(',', '')))
                    except ValueError:
                        delivery_fee = 450
                else:
                    print("⚠️ [DEBUG] Could not extract numeric rate, defaulting to 450")
                    delivery_fee = 450
                    
                return {"delivery_fee": delivery_fee, "rate": delivery_fee, "raw": raw_delivery_text}
    except FileNotFoundError as fnf_err:
        print("⚠️ [WARNING] MCP tool executable (npx) not found. Ensure Node.js is installed.")
        return {"delivery_fee": 450, "rate": 450, "raw": ""}
    except Exception as e:
        print(f"🚨 Safe Delivery Catch: {str(e)}")
        return {"delivery_fee": 450, "rate": 450, "raw": ""}
    except BaseException as be:
        print(f"🚨 System Exception Group Catch (Delivery)")
        return {"delivery_fee": 450, "rate": 450, "raw": ""}

@app.post("/create-order")
async def create_order_endpoint(request: CreateOrderRequest):
    try:
        server_params = get_verified_mcp_params()
        async with safe_stdio_client(server_params) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                wrapped_args = {"params": request.model_dump()}
                mcp_result = await session.call_tool("kapruka_create_order", arguments=wrapped_args)
                result_text = mcp_result.content[0].text if mcp_result.content else ""
                
                # Extract URL
                url_match = re.search(r'(https?://[^\s)]+)', result_text)
                payment_url = url_match.group(1) if url_match else None
                return {"payment_url": payment_url, "raw": result_text}
    except FileNotFoundError as fnf_err:
        print("⚠️ [WARNING] MCP tool executable (npx) not found. Ensure Node.js is installed.")
        return {"error": "MCP tool executable (npx) not found. Ensure Node.js is installed."}
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/reset-session")
async def reset_session():
    """
    Clears the backend Gemini LLM chat history.
    Used when the user explicitly clicks the "Restart" button on the UI 
    to wipe memory and begin a fresh conversational loop.
    """
    try:
        # Re-initialize an active empty Gemini chat loop context to wipe out memory
        if os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_key_here":
            model = genai.GenerativeModel(model_name="gemini-2.5-flash")
            chat = model.start_chat(history=[])
        return {"status": "session cleared"}
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/api/transcribe")
async def transcribe_audio(request: AudioRequest):
    try:
        base64_string = request.audio_data
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        decoded_bytes = base64.b64decode(base64_string)
        
        model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        audio_part = {"mime_type": "audio/webm", "data": decoded_bytes}
        response = await model.generate_content_async([
            audio_part, 
            "Transcribe this audio accurately. It may contain Sinhala, English, or Singlish. Return ONLY the transcribed text without any extra commentary."
        ])
        return {"text": response.text.strip()}
    except Exception as e:
        print(f"[ERROR] Audio Transcription Failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Audio transcription failed")

# ==============================================================================
# GOOGLE CLOUD TEXT-TO-SPEECH (TTS) SETUP INSTRUCTIONS
# ==============================================================================
# 1. requirements.txt update:
#    Ensure 'google-cloud-texttospeech>=2.16.0' is added to your requirements.txt.
#
# 2. GOOGLE_APPLICATION_CREDENTIALS environment variable setup:
#    Google Cloud client libraries use Application Default Credentials (ADC).
#    - Local Development: Download your service account JSON key file from GCP Console
#      and set the environment variable pointing to its absolute path:
#      export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
#    - Production (Railway / Docker):
#      Store the raw JSON contents of the key file inside a secret environment variable
#      or write it to a file on container startup, then set GOOGLE_APPLICATION_CREDENTIALS
#      to point to that file path. Alternatively, if deployed on GCP (Cloud Run/GKE),
#      ADC automatically picks up the attached IAM service account.
# ==============================================================================

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        clean_text = re.sub(r'\[CATEGORY:.*?\]', '', request.text, flags=re.IGNORECASE).strip()
        if not clean_text:
            raise HTTPException(status_code=400, detail="Text is empty")
            
        def generate_audio_stream():
            client = texttospeech.TextToSpeechClient()
            synthesis_input = texttospeech.SynthesisInput(text=clean_text)

            # Synthesize using high-quality Sinhala Wavenet voice
            voice = texttospeech.VoiceSelectionParams(
                language_code="si-LK",
                name="si-LK-Wavenet-A"
            )

            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )

            response = client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            return io.BytesIO(response.audio_content)
            
        audio_stream = await asyncio.to_thread(generate_audio_stream)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        print(f"[ERROR] Google Cloud TTS Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
