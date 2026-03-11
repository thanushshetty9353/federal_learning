import subprocess
import time

def start_client():

    subprocess.run(["python", "scripts/start_client.py"])


while True:

    print("Hospital node waiting for training...")

    time.sleep(10)

    start_client()