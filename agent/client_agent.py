"""Client Agent - Evaluates freelancer applications"""
from uagents import Agent, Context, Protocol
from openai import OpenAI
import os
from datetime import datetime
from uuid import uuid4
from message_models import (
    EvaluationIntroduction,
    IntroductionAcknowledgment,
    ProfileDataMessage,
    QuestionMessage,
    QuestionResponse,
    VerificationRequest,
    VerificationResponse
)
from queue import Queue
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Client Agent
client_agent = Agent(
    name="client_evaluator",
    port=8001,
    seed="client_agent_seed_phrase_12345",
    endpoint=["http://localhost:8001/submit"]
)

# ASI-1 LLM client for AI-generated messages
asi_client = OpenAI(
    base_url='https://api.asi1.ai/v1',
    api_key=os.getenv('ASI_API_KEY'),
)

# Storage for ongoing evaluations
evaluations = {}

# Queue for new evaluation requests
evaluation_queue = Queue()

verification_queue = Queue()
verifications = {}

def generate_introduction_message(job_title: str) -> str:
    """Use ASI-1 LLM to generate introduction message"""
    try:
        prompt = f"""
        You are a Client Agent evaluating a freelancer for a position: {job_title}
        
        Write a brief introduction to the Freelancer Agent explaining:
        1. You're going to evaluate if their freelancer can do the task
        2. You will ask questions
        3. They need to respond with their analysis of the user profile  
        
        Be professional and conversational. Keep it 2-3 sentences.
        """
        
        response = asi_client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {"role": "system", "content": "You are a Client Agent. Write a professional introduction."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=100,
        )
        
        return str(response.choices[0].message.content)
    except Exception as e:
        return f"Hello, I am going to evaluate if your freelancer has the ability to do this task. I will ask you questions, and you need to respond with your analysis of the user profile."

async def verify_submission(ctx: Context, task_data: dict, submission_data: dict, interaction_id: str):
    """Verify submitted work against task requirements"""
    try:
        submission_text = ""
        for field in submission_data.get('fields', []):
            submission_text += f"\n{field['label']}:\n{field['content']}\n"
        
        prompt = f"""
        Task Description: {task_data['description']}
        
        Task Requirements:
        {chr(10).join(f"- {req}" for req in task_data['requirements'])}
        
        Submitted Work:
        {submission_text}
        
        You are evaluating a freelancer's work submission. Be LENIENT and SUPPORTIVE in your evaluation.
        
        IMPORTANT Guidelines:
        - If the freelancer has made a REASONABLE ATTEMPT at the task, APPROVE it
        - If they addressed MOST of the requirements, APPROVE it
        - If the work shows EFFORT and UNDERSTANDING, APPROVE it
        - Only REJECT if the work is clearly OFF-TOPIC or shows NO EFFORT
        
        Respond with:
        1. "APPROVED" if the work shows reasonable effort and addresses the task (be generous!)
        2. "REJECTED" only if completely off-topic or no effort shown
        
        Then provide brief, ENCOURAGING feedback.
        """
        
        verifications[interaction_id]['conversation'].append({
            'id': str(uuid4()),
            'sender': 'client_agent',
            'message': 'Analyzing submitted work against task requirements...',
            'timestamp': datetime.now().isoformat(),
            'isThinking': True
        })
        
        await asyncio.sleep(1)
        
        response = asi_client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {"role": "system", "content": "You are a supportive reviewer evaluating freelancer work. Be lenient and encouraging. Approve if reasonable effort is shown. Only reject if completely off-topic."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=200,
        )
        
        result_text = str(response.choices[0].message.content)
        
        # Default to APPROVED unless explicitly rejected
        if 'REJECTED' in result_text.upper() and 'NOT REJECTED' not in result_text.upper():
            decision = 'REJECTED'
            feedback = result_text.replace('REJECTED', '').strip()
            if not feedback:
                feedback = "The submitted work needs improvement to meet the task requirements."
        else:
            decision = 'APPROVED'
            feedback = result_text.replace('APPROVED', '').strip()
            if not feedback:
                feedback = "Great work! The submission meets the task requirements."
        
        verifications[interaction_id]['conversation'][-1] = {
            'id': str(uuid4()),
            'sender': 'client_agent',
            'message': f"{decision}: {feedback}",
            'timestamp': datetime.now().isoformat(),
            'isThinking': False
        }
        
        verifications[interaction_id]['status'] = 'completed'
        verifications[interaction_id]['decision'] = decision
        verifications[interaction_id]['feedback'] = feedback
        
        ctx.logger.info(f"Verification decision: {decision}")
        
    except Exception as e:
        ctx.logger.error(f"Verification error: {e}")
        verifications[interaction_id]['status'] = 'error'
        verifications[interaction_id]['conversation'].append({
            'id': str(uuid4()),
            'sender': 'system',
            'message': 'Error during verification. Please try again.',
            'timestamp': datetime.now().isoformat(),
            'isThinking': False
        })

# Create protocol for evaluation
evaluation_protocol = Protocol("Evaluation")

@client_agent.on_interval(period=2.0)
async def check_queues(ctx: Context):
    """Check for new evaluation and verification requests periodically"""
    # Check evaluation queue
    if not evaluation_queue.empty():
        eval_data = evaluation_queue.get()
        
        ctx.logger.info(f"Processing evaluation for: {eval_data['job_title']}")
        
        interaction_id = eval_data['interaction_id']
        
        # Store evaluation data
        evaluations[interaction_id] = {
            'job_title': eval_data['job_title'],
            'job_description': eval_data['job_description'],
            'requirements': eval_data['requirements'],
            'profile_data': eval_data['profile_data'],
            'conversation': [],
            'status': 'processing'
        }
        
        ctx.logger.info("Generating introduction message...")
        intro_message = generate_introduction_message(eval_data['job_title'])
        
        # Add thinking state
        evaluations[interaction_id]['conversation'].append({
            'id': str(uuid4()),
            'sender': 'client_agent',
            'message': '',
            'timestamp': datetime.now().isoformat(),
            'isThinking': True
        })
        
        # Small delay to show thinking
        await asyncio.sleep(1)
        
        # Replace with actual message
        evaluations[interaction_id]['conversation'][-1] = {
            'id': str(uuid4()),
            'sender': 'client_agent',
            'message': intro_message,
            'timestamp': datetime.now().isoformat(),
            'isThinking': False
        }
        
        ctx.logger.info(f"Sending introduction to Freelancer Agent: {intro_message}")
        
        # Send introduction to Freelancer Agent
        await ctx.send(
            eval_data['freelancer_address'],
            EvaluationIntroduction(
                job_title=eval_data['job_title'],
                message=intro_message,
                interaction_id=interaction_id
            )
        )
    
    # Check verification queue
    if not verification_queue.empty():
        request = verification_queue.get()
        interaction_id = request['interaction_id']
        
        ctx.logger.info(f"Processing verification request: {interaction_id}")
        
        await verify_submission(ctx, request['task_data'], request['submission_data'], interaction_id)

def generate_questions(job_description: str, requirements: list) -> list:
    """Generate questions based on job description and requirements using ASI-1"""
    try:
        prompt = f"""
        Job Description: {job_description}
        Requirements: {', '.join(requirements)}
        
        Generate YES/NO questions ONLY about the specific skills, technologies, and qualifications listed in the requirements above.
        
        DO NOT ask about:
        - General abilities
        - Soft skills
        - Anything not explicitly mentioned in the requirements
        
        ONLY ask about:
        - Specific technical skills listed
        - Specific tools/technologies mentioned
        - Specific education requirements if listed
        - Specific experience requirements if listed
        
        Format: "Do you have experience in [exact skill from requirement]?"
        
        Return ONLY the questions, one per line, numbered.
        """
        
        response = asi_client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {"role": "system", "content": "You are a Client Agent. Generate questions ONLY about the specific requirements listed. Do not add extra questions."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=200,
        )
        
        questions_text = str(response.choices[0].message.content)
        questions = [q.strip() for q in questions_text.split('\n') if q.strip() and any(c.isalpha() for c in q)]
        return questions
    except Exception as e:
        return [f"Do you have experience with {req}?" for req in requirements[:3]]

@evaluation_protocol.on_message(model=IntroductionAcknowledgment)
async def handle_acknowledgment(ctx: Context, sender: str, msg: IntroductionAcknowledgment):
    """Handle acknowledgment from Freelancer Agent"""
    ctx.logger.info(f"Received acknowledgment: {msg.message}")
    
    if msg.interaction_id in evaluations:
        # Add Freelancer's response to conversation
        evaluations[msg.interaction_id]['conversation'].append({
            'id': str(uuid4()),
            'sender': 'freelancer_agent',
            'message': msg.message,
            'timestamp': datetime.now().isoformat(),
            'isThinking': False
        })
        
        await asyncio.sleep(0.5)
        
        # Generate questions
        ctx.logger.info("Analyzing job requirements and generating questions...")
        job_description = evaluations[msg.interaction_id]['job_description']
        requirements = evaluations[msg.interaction_id]['requirements']
        
        questions = generate_questions(job_description, requirements)
        evaluations[msg.interaction_id]['questions'] = questions
        evaluations[msg.interaction_id]['current_question_index'] = 0
        evaluations[msg.interaction_id]['answers'] = []
        
        # Send profile data to Freelancer Agent first
        ctx.logger.info("Sending profile data to Freelancer Agent...")
        await ctx.send(
            sender,
            ProfileDataMessage(
                profile_data=evaluations[msg.interaction_id]['profile_data'],
                interaction_id=msg.interaction_id
            )
        )
        
        await asyncio.sleep(0.3)
        
        # Show thinking state for Client Agent
        evaluations[msg.interaction_id]['conversation'].append({
            'id': str(uuid4()),
            'sender': 'client_agent',
            'message': '',
            'timestamp': datetime.now().isoformat(),
            'isThinking': True
        })
        
        await asyncio.sleep(0.5)
        
        # Send first question
        first_question = questions[0]
        ctx.logger.info(f"Asking question 1/{len(questions)}: {first_question}")
        
        evaluations[msg.interaction_id]['conversation'][-1] = {
            'id': str(uuid4()),
            'sender': 'client_agent',
            'message': first_question,
            'timestamp': datetime.now().isoformat(),
            'isThinking': False
        }
        
        await ctx.send(
            sender,
            QuestionMessage(
                question=first_question,
                interaction_id=msg.interaction_id
            )
        )

@evaluation_protocol.on_message(model=QuestionResponse)
async def handle_question_response(ctx: Context, sender: str, msg: QuestionResponse):
    """Handle response from Freelancer Agent"""
    ctx.logger.info(f"Received answer: {msg.answer[:50]}...")
    
    if msg.interaction_id in evaluations:
        # Add Freelancer's answer to conversation
        evaluations[msg.interaction_id]['conversation'].append({
            'id': str(uuid4()),
            'sender': 'freelancer_agent',
            'message': msg.answer,
            'timestamp': datetime.now().isoformat(),
            'isThinking': False
        })
        
        evaluations[msg.interaction_id]['answers'].append(msg.answer)
        evaluations[msg.interaction_id]['current_question_index'] += 1
        
        await asyncio.sleep(0.5)
        
        # Check if more questions to ask
        current_index = evaluations[msg.interaction_id]['current_question_index']
        questions = evaluations[msg.interaction_id]['questions']
        
        if current_index < len(questions):
            # Show thinking state
            evaluations[msg.interaction_id]['conversation'].append({
                'id': str(uuid4()),
                'sender': 'client_agent',
                'message': '',
                'timestamp': datetime.now().isoformat(),
                'isThinking': True
            })
            
            await asyncio.sleep(0.5)
            
            # Ask next question
            next_question = questions[current_index]
            ctx.logger.info(f"Asking question {current_index + 1}/{len(questions)}: {next_question}")
            
            evaluations[msg.interaction_id]['conversation'][-1] = {
                'id': str(uuid4()),
                'sender': 'client_agent',
                'message': next_question,
                'timestamp': datetime.now().isoformat(),
                'isThinking': False
            }
            
            await ctx.send(
                sender,
                QuestionMessage(
                    question=next_question,
                    interaction_id=msg.interaction_id
                )
            )
        else:
            # All questions answered - make final decision
            ctx.logger.info(f"All questions answered for {msg.interaction_id}. Making final decision...")
            
            # Show thinking state
            evaluations[msg.interaction_id]['conversation'].append({
                'id': str(uuid4()),
                'sender': 'client_agent',
                'message': '',
                'timestamp': datetime.now().isoformat(),
                'isThinking': True
            })
            
            await asyncio.sleep(1)
            
            # Analyze all answers
            questions = evaluations[msg.interaction_id]['questions']
            answers = evaluations[msg.interaction_id]['answers']
            
            # Build conversation history for analysis
            qa_history = "\n".join([f"Q: {q}\nA: {a}" for q, a in zip(questions, answers)])
            
            # Count positive vs negative answers
            positive_answers = sum(1 for a in answers if 'yes' in a.lower() and 'no' not in a.lower())
            negative_answers = sum(1 for a in answers if 'no' in a.lower() or "doesn't" in a.lower() or "don't" in a.lower())
            
            ctx.logger.info(f"Positive answers: {positive_answers}/{len(answers)}, Negative: {negative_answers}/{len(answers)}")
            
            try:
                decision_prompt = f"""
                I asked the Freelancer Agent these questions about the candidate's qualifications:
                
                {qa_history}
                
                Review each answer carefully. Count how many answers are "Yes" (candidate has the skill) vs "No" (candidate lacks the skill).
                
                Based ONLY on the answers above:
                - If ALL answers are "Yes" (or positive), respond with: "APPROVED"
                - If ANY answer is "No" (or negative), respond with: "NOT APPROVED"
                
                Then explain your decision briefly.
                """
                
                response = asi_client.chat.completions.create(
                    model="asi1-mini",
                    messages=[
                        {"role": "system", "content": "You are evaluating a candidate. Approve ONLY if all answers show the candidate has the required skills. If you see 'Yes' in all answers, approve. If you see any 'No', reject."},
                        {"role": "user", "content": decision_prompt},
                    ],
                    max_tokens=150,
                )
                
                decision_text = str(response.choices[0].message.content)
                
                # Simple logic: if all answers are positive, approve
                if positive_answers == len(answers) and negative_answers == 0:
                    decision = 'APPROVED'
                    message = f"Your freelancer fits the task well. All required skills are confirmed."
                elif 'APPROVED' in decision_text.upper() and 'NOT APPROVED' not in decision_text.upper():
                    decision = 'APPROVED'
                    message = f"Your freelancer fits the task well. {decision_text}"
                else:
                    decision = 'NOT APPROVED'
                    missing_skills = [q for q, a in zip(questions, answers) if 'no' in a.lower() or "doesn't" in a.lower() or "don't" in a.lower()]
                    if missing_skills:
                        message = f"Sorry, your freelancer doesn't match the job requirement. They don't have the ability for tasks like: {', '.join([q.replace('Do you have experience in ', '').replace('Do you know how to ', '').replace('?', '') for q in missing_skills[:3]])}."
                    else:
                        message = f"Sorry, your freelancer doesn't match the job requirement. {decision_text}"
                
            except Exception as e:
                ctx.logger.error(f"Decision error: {e}")
                # Fallback to simple logic
                if positive_answers == len(answers) and negative_answers == 0:
                    decision = 'APPROVED'
                    message = "Your freelancer fits the task well. All required skills are confirmed."
                else:
                    decision = 'NOT APPROVED'
                    message = "Unable to complete evaluation properly."
            
            # Update conversation with decision
            evaluations[msg.interaction_id]['conversation'][-1] = {
                'id': str(uuid4()),
                'sender': 'client_agent',
                'message': message,
                'timestamp': datetime.now().isoformat(),
                'isThinking': False
            }
            
            evaluations[msg.interaction_id]['status'] = 'completed'
            evaluations[msg.interaction_id]['decision'] = decision
            
            ctx.logger.info(f"Final decision: {decision}")

# Include protocol in agent
client_agent.include(evaluation_protocol)

@client_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Client Agent started with address: {client_agent.address}")

def get_evaluation_status(interaction_id: str):
    """Get evaluation status for Flask API"""
    return evaluations.get(interaction_id)

def trigger_evaluation(interaction_id: str, job_title: str, job_description: str, requirements: list, profile_data: dict, freelancer_address: str):
    """Trigger evaluation by adding to queue"""
    evaluation_queue.put({
        'interaction_id': interaction_id,
        'job_title': job_title,
        'job_description': job_description,
        'requirements': requirements,
        'profile_data': profile_data,
        'freelancer_address': freelancer_address
    })

def trigger_verification(task_data: dict, submission_data: dict, interaction_id: str):
    """Trigger work verification process"""
    verification_queue.put({
        'task_data': task_data,
        'submission_data': submission_data,
        'interaction_id': interaction_id
    })
    
    verifications[interaction_id] = {
        'status': 'processing',
        'conversation': [],
        'decision': 'PENDING'
    }

def get_verification_status(interaction_id: str) -> dict:
    """Get the current status of a verification"""
    return verifications.get(interaction_id, {})
