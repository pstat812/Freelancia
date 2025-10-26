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
from client_agent import (
    client_agent, 
    get_evaluation_status, 
    trigger_evaluation,
    get_verification_status,
    trigger_verification
)
from freelancer_agent import freelancer_agent

load_dotenv()

app = Flask(__name__)
CORS(app)

supabase_url = os.getenv('SUPABASE_URL') or os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_ANON_KEY') or os.getenv('SUPABASE_ANON_KEY')

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
        
        # If approved and completed, update database and notify frontend
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
                            evaluation['needs_smart_contract_assignment'] = True
                            evaluation['freelancer_wallet'] = freelancer_wallet
                    except Exception as e:
                        print(f"Database update error: {e}")
        
        return jsonify({
            'status': status,
            'conversation': evaluation.get('conversation', []),
            'decision': decision,
            'waiting_for_user': False,
            'needs_smart_contract_assignment': evaluation.get('needs_smart_contract_assignment', False),
            'freelancer_wallet': evaluation.get('freelancer_wallet', '')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/verify-submission', methods=['POST'])
def verify_submission():
    """Start work verification process"""
    try:
        data = request.json
        interaction_id = str(uuid.uuid4())
        
        print(f"[Verify Submission] Starting verification: {interaction_id}")
        print(f"Task Description: {data.get('task_description', 'N/A')[:50]}...")
        print(f"Requirements: {data.get('task_requirements', [])}")
        print(f"Submission Fields: {len(data.get('submission_data', {}).get('fields', []))}")
        
        trigger_verification(
            task_data={
                'description': data['task_description'],
                'requirements': data['task_requirements']
            },
            submission_data=data['submission_data'],
            interaction_id=interaction_id
        )
        
        print(f"[Verify Submission] Verification queued successfully")
        
        return jsonify({
            'interaction_id': interaction_id,
            'status': 'processing'
        })
    except Exception as e:
        print(f"[Verify Submission] ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/verification-status/<interaction_id>', methods=['GET'])
def get_verification_result(interaction_id):
    """Get verification status and result"""
    try:
        verification = get_verification_status(interaction_id)
        
        if not verification:
            return jsonify({'error': 'Verification not found'}), 404
        
        decision = verification.get('decision', 'PENDING')
        status = verification.get('status')
        
        return jsonify({
            'status': status,
            'conversation': verification.get('conversation', []),
            'decision': decision,
            'feedback': verification.get('feedback', ''),
            'payment_status': verification.get('payment_status', 'pending'),
            'db_updated': verification.get('db_updated', False)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/complete-payment/<interaction_id>', methods=['POST'])
def complete_payment(interaction_id):
    """Mark payment as completed and update task status"""
    try:
        data = request.json
        task_id = data.get('task_id')
        tx_hash = data.get('tx_hash')
        
        verification = get_verification_status(interaction_id)
        
        if not verification:
            return jsonify({'error': 'Verification not found'}), 404
        
        print(f"[Payment] Completing payment for task {task_id}, tx: {tx_hash}")
        
        if supabase and task_id:
            try:
                supabase.table('tasks').update({
                    'status': 'completed'
                }).eq('id', task_id).execute()
                
                print(f"[Payment] ✅ Task {task_id} marked as completed")
                
                verification['payment_status'] = 'completed'
                verification['db_updated'] = True
                verification['tx_hash'] = tx_hash
                
                return jsonify({
                    'success': True,
                    'message': 'Payment completed successfully'
                })
            except Exception as e:
                print(f"[Payment] ❌ Error: {e}")
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({'error': 'Missing task_id or Supabase not configured'}), 400
        
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
