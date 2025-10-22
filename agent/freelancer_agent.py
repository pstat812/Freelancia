"""Freelancer Agent - Represents freelancer in evaluations"""
from uagents import Agent, Context, Protocol
from openai import OpenAI
import os
from datetime import datetime
from uuid import uuid4
from message_models import (
    EvaluationIntroduction,
    IntroductionAcknowledgment
)
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Freelancer Agent
freelancer_agent = Agent(
    name="freelancer_representative",
    port=8002,
    seed="freelancer_agent_seed_phrase_67890",
    endpoint=["http://localhost:8002/submit"]
)

# ASI-1 LLM client for AI-generated messages
asi_client = OpenAI(
    base_url='https://api.asi1.ai/v1',
    api_key=os.getenv('ASI_API_KEY'),
)

def generate_acknowledgment(client_message: str) -> str:
    """Use ASI-1 LLM to generate acknowledgment"""
    try:
        prompt = f"""
        The Client Agent just said to you:
        "{client_message}"
        
        Respond briefly and professionally, acknowledging that you understand and are ready to help.
        Keep it short (1-2 sentences).
        """
        
        response = asi_client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {"role": "system", "content": "You are a Freelancer Agent. Respond professionally and briefly to acknowledge the Client Agent's message."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=50,
        )
        
        return str(response.choices[0].message.content)
    except Exception as e:
        return "Understood. I'm ready to provide information about the freelancer."

# Create protocol for evaluation responses
response_protocol = Protocol("EvaluationResponse")

@response_protocol.on_message(model=EvaluationIntroduction, replies={IntroductionAcknowledgment})
async def handle_introduction(ctx: Context, sender: str, msg: EvaluationIntroduction):
    """Handle introduction from Client Agent - respond autonomously"""
    ctx.logger.info(f"Received introduction from Client Agent: {msg.message}")
    
    # Generate AI response
    ctx.logger.info("Generating acknowledgment...")
    acknowledgment = generate_acknowledgment(msg.message)
    
    ctx.logger.info(f"Sending acknowledgment: {acknowledgment}")
    
    # Send acknowledgment back to Client Agent
    await ctx.send(
        sender,
        IntroductionAcknowledgment(
            message=acknowledgment,
            ready=True,
            interaction_id=msg.interaction_id
        )
    )

# Include protocol in agent
freelancer_agent.include(response_protocol)

@freelancer_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Freelancer Agent started with address: {freelancer_agent.address}")
