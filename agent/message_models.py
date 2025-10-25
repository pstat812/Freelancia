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

class ProfileDataMessage(Model):
    """ profile data"""
    profile_data: dict
    interaction_id: str

class QuestionMessage(Model):
    """Client Agent asks question to Freelancer Agent"""
    question: str
    interaction_id: str

class QuestionResponse(Model):
    """Freelancer Agent responds to question"""
    answer: str
    interaction_id: str

class VerificationRequest(Model):
    """Request to verify submitted work"""
    task_description: str
    task_requirements: list
    submission_data: dict
    interaction_id: str

class VerificationResponse(Model):
    """Response after work verification"""
    decision: str
    feedback: str
    interaction_id: str

