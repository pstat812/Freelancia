import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Loader, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'client_agent' | 'freelancer_agent';
  message: string;
  timestamp: string;
  isThinking?: boolean;
}

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  interactionId: string | null;
  agentType?: 'client' | 'freelancer';
  title?: string;
  taskId?: string;
  isVerification?: boolean;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  isOpen,
  onClose,
  interactionId,
  agentType,
  title,
  taskId,
  isVerification = false
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string>('processing');
  const [error, setError] = useState<string>('');
  const [decision, setDecision] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const paymentInitiatedRef = useRef<boolean>(false);

  useEffect(() => {
    if (interactionId && isOpen) {
      paymentInitiatedRef.current = false;
      pollReasoningStatus();
    }
  }, [interactionId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSmartContractAssignment = async (freelancerWallet: string) => {
    try {
      const { taskEscrowService } = await import('../services/taskEscrow');
      
      const evalData = localStorage.getItem('currentEvaluation');
      const taskId = evalData ? JSON.parse(evalData).taskId : null;
      
      if (!taskId || !freelancerWallet) {
        return;
      }

      await taskEscrowService.assignFreelancer(taskId, freelancerWallet);
    } catch (error: any) {
      console.error('Error assigning freelancer to smart contract:', error);
    }
  };

  const handlePayment = async () => {
    if (paymentStatus !== 'pending' || paymentInitiatedRef.current) return;
    
    paymentInitiatedRef.current = true;
    setPaymentStatus('processing');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'system' as any,
      message: 'Preparing payment release...',
      timestamp: new Date().toISOString(),
      isThinking: true
    }]);

    try {
      const { taskEscrowService, releasePayment } = await import('../services/taskEscrow');
      
      const verifyData = localStorage.getItem('currentVerification');
      const taskId = verifyData ? JSON.parse(verifyData).taskId : null;
      
      if (!taskId) {
        throw new Error('Task ID not found');
      }

      // Step 1: Check if freelancer is assigned, if not assign them first
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: Date.now().toString(),
          sender: 'system' as any,
          message: 'Assigning freelancer to smart contract...',
          timestamp: new Date().toISOString(),
          isThinking: true
        };
        return updated;
      });

      try {
        const currentFreelancer = await taskEscrowService.getTaskFreelancer(taskId);
        
        if (currentFreelancer === '0x0000000000000000000000000000000000000000') {
          const walletAddress = verifyData ? JSON.parse(verifyData).wallet : localStorage.getItem('walletAddress');
          if (walletAddress) {
            await taskEscrowService.assignFreelancer(taskId, walletAddress);
          } else {
            throw new Error('Wallet address not found');
          }
        }
      } catch (assignError) {
        throw assignError;
      }

      // Step 2: Release payment
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: Date.now().toString(),
          sender: 'system' as any,
          message: 'Releasing PYUSD payment...',
          timestamp: new Date().toISOString(),
          isThinking: true
        };
        return updated;
      });

      const result = await releasePayment(taskId);
      
      if (result.success) {
        setPaymentStatus('completed');
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            id: Date.now().toString(),
            sender: 'system' as any,
            message: `✅ PYUSD transferred successfully!`,
            timestamp: new Date().toISOString(),
            isThinking: false
          };
          return updated;
        });
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'system' as any,
            message: `🎉 Task completed! You can now close this window and check your wallet.`,
            timestamp: new Date().toISOString(),
            isThinking: false
          }]);
        }, 500);

        await fetch(`http://localhost:5000/complete-payment/${interactionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: taskId,
            tx_hash: result.txHash
          })
        });
      } else {
        setPaymentStatus('failed');
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            id: Date.now().toString(),
            sender: 'system' as any,
            message: `Payment failed: ${result.error}`,
            timestamp: new Date().toISOString(),
            isThinking: false
          };
          return updated;
        });
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: Date.now().toString(),
          sender: 'system' as any,
          message: `Payment error: ${error.message}`,
          timestamp: new Date().toISOString(),
          isThinking: false
        };
        return updated;
      });
    }
  };

  const pollReasoningStatus = async () => {
    if (!interactionId) return;

    const pollInterval = setInterval(async () => {
      try {
        let url = '';
        
        if (isVerification) {
          const verifyData = localStorage.getItem('currentVerification');
          let currentTaskId = taskId || '';
          
          if (verifyData) {
            const parsed = JSON.parse(verifyData);
            currentTaskId = currentTaskId || parsed.taskId || '';
          }
          
          url = `http://localhost:5000/verification-status/${interactionId}?task_id=${currentTaskId}`;
        } else {
          const evalData = localStorage.getItem('currentEvaluation');
          let freelancerWallet = '';
          let currentTaskId = taskId || '';
          
          if (evalData) {
            const parsed = JSON.parse(evalData);
            freelancerWallet = parsed.wallet || '';
            currentTaskId = currentTaskId || parsed.taskId || '';
          }
          
          url = `http://localhost:5000/reasoning-status/${interactionId}?task_id=${currentTaskId}&freelancer_wallet=${freelancerWallet}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data.conversation || []);
          setStatus(data.status || 'processing');
          setDecision(data.decision || '');
          
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(pollInterval);
            
            if (!isVerification && data.decision === 'APPROVED' && data.needs_smart_contract_assignment) {
              handleSmartContractAssignment(data.freelancer_wallet);
              
              setTimeout(() => {
                navigate('/freelancer/your-tasks');
              }, 3000);
            }
            
            if (isVerification && data.decision === 'APPROVED' && !data.db_updated && paymentStatus === 'pending' && !paymentInitiatedRef.current) {
              handlePayment();
            }
          }
          
          if (data.error) {
            setError(data.error);
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
        setError('Failed to fetch status');
        clearInterval(pollInterval);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  };

  const getStatusIcon = () => {
    if (status === 'completed') return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (status === 'failed') return <XCircle className="w-6 h-6 text-red-400" />;
    return <Loader className="w-6 h-6 text-orange-500 animate-spin" />;
  };

  const getAgentName = (sender: string) => {
    if (sender === 'client_agent') return 'Client Agent';
    if (sender === 'freelancer_agent') return 'Freelancer Agent';
    return 'You';
  };

  const getAgentColor = (sender: string) => {
    if (sender === 'client_agent') return 'bg-blue-500/10 border-blue-500/30';
    if (sender === 'freelancer_agent') return 'bg-purple-500/10 border-purple-500/30';
    return 'bg-orange-500/10 border-orange-500/30';
  };

  const getAgentIcon = () => {
    return <Bot className="w-5 h-5" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Bot className="w-8 h-8 text-orange-500" />
                  <div>
                    <h2 className="text-xl font-bold text-white">{isVerification ? 'AI Work Verification' : (title || 'AI Agent Evaluation')}</h2>
                    <p className="text-sm text-gray-400">
                      {isVerification ? 'Verifying Submission' : (agentType === 'client' ? 'Client Agent' : 'Freelancer Agent')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-300">
                  {status === 'processing' && 'Processing...'}
                  {status === 'completed' && 'Analysis Complete'}
                  {status === 'failed' && 'Analysis Failed'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              {messages.length === 0 && status === 'processing' && (
                <div className="text-center py-8 text-gray-500">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Connecting agents...</p>
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%]">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`${msg.sender === 'client_agent' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {getAgentIcon()}
                      </div>
                      <span className="text-xs font-semibold text-gray-400">
                        {getAgentName(msg.sender)}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`border rounded-lg p-3 ${getAgentColor(msg.sender)}`}>
                      {msg.isThinking ? (
                        <div className="flex items-center space-x-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-400 italic">Thinking...</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {decision && status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border-2 rounded-lg p-6 text-center mt-6 ${
                    decision === 'APPROVED' 
                      ? 'bg-green-500/10 border-green-500' 
                      : 'bg-red-500/10 border-red-500'
                  }`}>
                  <div className="flex items-center justify-center mb-3">
                    {decision === 'APPROVED' ? (
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-400" />
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${
                    decision === 'APPROVED' 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {decision}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AgentDrawer;

