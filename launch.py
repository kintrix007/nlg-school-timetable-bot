import os, sys
from datetime import datetime
import json
import time

root = os.path.dirname(os.path.realpath(__file__))

CRASH_LOG_DIR = f"{root}/crash_logs"

def main():
    os.system("./node_modules/typescript/bin/tsc")

    iter = 0

    with open("package.json", "r") as f:
        entry_point = json.loads(f.read())["main"]
    
    if not os.path.exists(CRASH_LOG_DIR):
        os.mkdir(CRASH_LOG_DIR)

    while True:
        exit_code = os.system(f"node {entry_point}")
        current_time = datetime.now().strftime("%Y-%m-%d - %H:%M:%S")
        crash_log = f"stopped at:{current_time}\nexit code: {exit_code}\n"
        print("\n---\n\n" + crash_log + "\n\n---\n")
        with open(f"{CRASH_LOG_DIR}/crash{iter}.log", "w") as f:
            f.write(crash_log)
        print("-- waiting to restart bot... --")
        time.sleep(5) # wait 5 seconds before restarting
        print("-- restarting bot... --")
        iter += 1


if __name__ == "__main__":
    main()
