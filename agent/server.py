"""Flask server + uAgents Bureau"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from uagents import Bureau
import asyncio
import threading
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
from queue import Queue

# Import agents
from client_agent import client_agent, get_evaluation_status, trigger_evaluation
from freelancer_agent import freelancer_agent

load_dotenv()

app = Flask(__name__)
CORS(app)

# Bureau to run both agents
bureau = Bureau(port=8000)
bureau.add(client_agent)
bureau.add(freelancer_agent)

# Flag to check if bureau is running
bureau_running = False

def run_bureau():
    """Run the bureau in a separate thread"""
    global bureau_running
    bureau_running = True
    bureau.run()

# Start bureau in background thread
bureau_thread = threading.Thread(target=run_bureau, daemon=True)
bureau_thread.start()

# Wait for bureau to start
import time
time.sleep(2)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'bureau_running': bureau_running,
        'agents': {
            'client': str(client_agent.address),
            'freelancer': str(freelancer_agent.address)
        }
    })

if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
