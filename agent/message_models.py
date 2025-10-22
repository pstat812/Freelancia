"""Message models for agent-to-agent communication"""
from uagents import Model
from typing import List, Optional

class EvaluationRequest(Model):
    """Client Agent initiates evaluation"""
    job_title: str
    job_description: str
    requirements: List[str]
    profile_data: dict  # Contains user profile information
    interaction_id: str  # To track conversation

class EvaluationIntroduction(Model):
    """Client Agent introduces itself to Freelancer Agent"""
    job_title: str
    message: str
    interaction_id: str

class IntroductionAcknowledgment(Model):
    """Freelancer Agent acknowledges introduction"""
    message: str
    ready: bool
    interaction_id: str

class ConversationUpdate(Model):
    """Update conversation state"""
    interaction_id: str
    sender: str
    message: str
    is_thinking: bool
    timestamp: str

