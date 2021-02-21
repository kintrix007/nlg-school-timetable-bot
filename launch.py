#!/usr/bin/python3
import os, sys
from datetime import datetime
import json
import time

root = os.path.dirname(os.path.realpath(__file__))
CRASH_LOG_DIR = os.path.join(root, "crash_logs")
PACKAGE = "package.json"

def main():
    test_token()
    compile()

    iter = 0
    entry_point = find_entry_point()

    if not os.path.exists(CRASH_LOG_DIR):
        os.mkdir(CRASH_LOG_DIR)

    print("-- launching bot --")
    while True:
        exit_code = os.system(f"node {entry_point}")
        current_time = datetime.now().strftime("%Y-%m-%d - %H:%M:%S")
        crash_log = f"stopped at: {current_time}\nexit code: {exit_code}\n"
        
        print("\n---\n\n" + crash_log + "\n---\n")
        with open(f"{CRASH_LOG_DIR}/crash{iter}.log", "w") as f:
            f.write(crash_log)
        
        print("-- waiting to restart bot... --")
        time.sleep(5)       # wait 5 seconds before restarting
        print("-- restarting bot... --")
        iter += 1

def test_token():
    token_path = os.path.join(root, "source", "token.token")
    if not os.path.exists(token_path):
        with open(token_path, "w") as f:
            f.write("")
        print("-- TOKEN MISSING --")
        print("Plese put your bot's token into the file 'token.token'")
        exit(1)
    else:
        with open(token_path, "r") as f:
            if not f.read():
                print("-- TOKEN MISSING --")
                print("Plese put your bot's token into the file 'token.token'")
                exit(1)

def compile():
    print("-- compiling... --")
    tsc_exit_code = os.system("./node_modules/typescript/bin/tsc")
    if tsc_exit_code != 0:
        print(f"tsc stopped with a non-zero exit code ({tsc_exit_code})")
        exit(1)
    print("-- compile successful --")

def find_entry_point():
    print("-- finding entry point... --")
    with open(os.path.join(root, PACKAGE), "r") as f:
        entry_point = json.loads(f.read())["main"]
    print(f"-- found entry point ('{entry_point}') --")
    return entry_point

if __name__ == "__main__":
    main()
