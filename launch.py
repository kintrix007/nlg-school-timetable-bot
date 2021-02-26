#!/usr/bin/python3
import os
from datetime import datetime
import json
import time

root = os.path.dirname(os.path.realpath(__file__))
CRASH_LOG_DIR = os.path.join(root, "crash_logs")
PACKAGE = os.path.join(root, "package.json")

def main():
    test_token()
    update()
    remove_crash_logs()
    compile()

    iter = 0
    entry_point = find_entry_point()

    print("-- launching bot --")
    while True:
        exit_code = os.system(f"node {entry_point}")
        
        if exit_code == 0:
            print("-- bot stopped --")
            print("-- waiting to update bot... --")
            print("-- ^C to stop --")
            time.sleep(5)
            update()
            compile()
        else:
            current_time = datetime.now().strftime("%Y-%m-%d - %H:%M:%S")
            crash_log = f"stopped at: {current_time}\nexit code: {exit_code}\n"
            print("\n---\n\n" + crash_log + "\n---\n")
            with open(f"{CRASH_LOG_DIR}/crash{iter}.log", "w") as f:
                f.write(crash_log)
            
            iter += 1
        
        print("-- waiting to restart bot... --")
        print("-- ^C to stop --")
        time.sleep(5)       # wait 5 seconds before restarting
        print("-- restarting bot... --")

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

def remove_crash_logs():
    if not os.path.exists(CRASH_LOG_DIR):
        os.mkdir(CRASH_LOG_DIR)
    
    for filename in os.listdir(CRASH_LOG_DIR):
        file = os.path.join(CRASH_LOG_DIR, filename)
        os.remove(file)

def compile():
    print("-- compiling... --")
    tsc_path = os.path.join(root, "node_modules", "typescript", "bin", "tsc")
    tsc_exit_code = os.system(f"{tsc_path} -p {root}")
    if tsc_exit_code != 0:
        print(f"tsc stopped with a non-zero exit code ({tsc_exit_code})")
        exit(1)
    print("-- compile successful --")

def find_entry_point():
    print("-- finding entry point... --")
    with open(PACKAGE, "r") as f:
        entry_point = json.loads(f.read())["main"]
    print(f"-- found entry point ('{entry_point}') --")
    return entry_point

def update():
    # kinda sucks... But it works, at least
    print("-- updating... --")
    original_dir = os.getcwd()
    os.chdir(root)
    pull_exit_code = os.system("git pull")
    if pull_exit_code != 0:
        print(f"git pull stopped with a non-zero exit code ({pull_exit_code})")
        print("-- skipping update --")
        return
    os.chdir(original_dir)
    print("-- update successful --")

if __name__ == "__main__":
    main()
