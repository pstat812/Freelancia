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
from supabase import create_client, Client

# Import agents
from client_agent import client_agent, get_evaluation_status, trigger_evaluation
from freelancer_agent import freelancer_agent

load_dotenv()

app = Flask(__name__)
CORS(app)

supabase_url = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY')

print(f"\n[Supabase Config]")
print(f"URL: {supabase_url[:30] + '...' if supabase_url else 'NOT SET'}")
print(f"Key: {'SET' if supabase_key else 'NOT SET'}\n")

supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

if not supabase:
    print("[WARNING] Supabase not configured! Database updates will not work.")

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

@app.route('/evaluate-freelancer', methods=['POST'])
def evaluate_freelancer():
    """Endpoint to trigger evaluation"""
    try:
        data = request.json
        task_id = data.get('task_id')
        profile = data.get('profile')
        job_requirements = data.get('job_requirements')
        
        if not all([task_id, profile, job_requirements]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        interaction_id = str(uuid.uuid4())
        
        trigger_evaluation(
            interaction_id=interaction_id,
            job_title=job_requirements.get('title', 'Unknown position'),
            job_description=job_requirements.get('description', ''),
            requirements=job_requirements.get('requirements', []),
            profile_data=profile,
            freelancer_address=str(freelancer_agent.address)
        )
        
        return jsonify({
            'interaction_id': interaction_id,
            'status': 'processing',
            'message': 'Evaluation initiated'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reasoning-status/<interaction_id>', methods=['GET'])
def get_reasoning_status(interaction_id):
    """Get evaluation status from Client Agent's storage"""
    try:
        evaluation = get_evaluation_status(interaction_id)
        
        if not evaluation:
            return jsonify({'error': 'Interaction not found'}), 404
        
        decision = evaluation.get('decision', 'PENDING')
        status = evaluation.get('status')
        
        # If approved and completed, update database
        if decision == 'APPROVED' and status == 'completed':
            if not evaluation.get('db_updated'):
                if supabase:
                    try:
                        task_id = request.args.get('task_id')
                        freelancer_wallet = request.args.get('freelancer_wallet')
                        
                        if task_id and freelancer_wallet:
                            supabase.table('tasks').update({
                                'freelancer_wallet': freelancer_wallet,
                                'status': 'in-progress'
                            }).eq('id', task_id).execute()
                            
                            evaluation['db_updated'] = True
                    except Exception as e:
                        print(f"Database update error: {e}")
        
        return jsonify({
            'status': status,
            'conversation': evaluation.get('conversation', []),
            'decision': decision,
            'waiting_for_user': False
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/agent-addresses', methods=['GET'])
def agent_addresses():
    return jsonify({
        'client_agent': str(client_agent.address),
        'freelancer_agent': str(freelancer_agent.address)
    })

if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
