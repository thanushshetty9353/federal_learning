import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fl_core.server.flower_server import start_server

if __name__ == "__main__":
    job_id = None
    if len(sys.argv) > 1:
        job_id = int(sys.argv[1])
    
    start_server(job_id=job_id)