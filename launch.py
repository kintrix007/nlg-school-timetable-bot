import os, sys
from datetime import datetime
import json
from typing import Callable

class Logger():
    original_stdout = sys.stdout
    log = []

    def start(self):
        sys.stdout = self
    
    def stop(self):
        sys.stdout = self.original_stdout
    
    def write(self, log_msg):
        self.log.append(log_msg)
        self.original_stdout.write(log_msg)

    def clear_log(self):
        self.log = []
    
    def write_to_file(self, filename):
        with open(filename, "w") as f:
            f.write("\n".join(self.log))

CRASH_LOG_DIR = "crash_logs"

def main():
    os.system(f"tsc")

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
        iter += 1

if __name__ == "__main__":
    main()
