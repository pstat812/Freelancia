import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const WalletNotConnected: React.FC = () => {
  const navigate = useNavigate();
  const { connectWallet, isConnecting } = useWallet();

  const handleConnect = async () => {
    await connectWallet();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-orange-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">Wallet Not Connected</h1>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access the platform and start posting or finding tasks.
          </p>

          <motion.button
            onClick={handleConnect}
            disabled={isConnecting}
            whileHover={{ scale: isConnecting ? 1 : 1.05 }}
            whileTap={{ scale: isConnecting ? 1 : 0.95 }}
            className="bg-orange-500 text-white px-8 py-3 rounded-md text-base font-semibold hover:bg-orange-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            <Wallet className="w-5 h-5" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </motion.button>

          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="flex items-start space-x-3 text-sm text-gray-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-left">
                Make sure you have MetaMask or another Web3 wallet installed in your browser to continue.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Landing Page
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletNotConnected;

