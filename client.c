#include<stdio.h>
#include <stdlib.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <unistd.h>

#define SHMSZ (10 * sizeof(float))
#define SHM_KEY 5678

Int main() {
int shmid;
float *shm_data;
float float_array[10];
int current_index = 0;


for(int i = 0; i < 10; i++){
    printf("Enter the number: ");
    scanf("%f", &float_array[i]);

  if (floar_array[i]>=0 && float_array[i]<=50){
    i++;
}else
{
    printf("error");
}

}

for (int i = 0; i < 8; i++) {
shm_data[i] = pressure_readings[i];
}

if (shmdt(shm_data) == -1) {
perror("shmdt");
}
return 0;
}




#include <stdio.h>
#include <stdlib.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <pthread.h>
#include <unistd.h>

#define SHMSZ (10 * sizeof(float))
#define SHM_KEY 5678

float mySharedA[10];
float total_sum = 0.0;
pthread_mutex_t data_mutex;

void * threadA(void *arg) {
    double sum = 0.0;
    for(int i = 0; i < 5; i++){
        sum = mySharedA[i] * mySharedA[i];
    }

    
pthread_mutex_lock(&data_mutex);
total_sum += local_sum;
pthread_mutex_unlock(&data_mutex);
}

void *threadB (void *arg) {

    

}