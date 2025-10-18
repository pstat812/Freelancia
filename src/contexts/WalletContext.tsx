import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService } from '../services/wallet';
import { userService } from '../services/userService';
import type { User } from '../services/supabase';

interface WalletContextType {
  walletAddress: string | null;
  user: User | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUser: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      const account = await walletService.getAccount();
      if (account) {
        setWalletAddress(account);
        await loadUser(account);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      disconnectWallet();
    } else if (accounts[0] !== walletAddress) {
      // User switched account
      setWalletAddress(accounts[0]);
      await loadUser(accounts[0]);
    }
  };

  const loadUser = async (address: string) => {
    try {
      const userData = await userService.getOrCreateUser(address);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await walletService.connect();
      setWalletAddress(address);
      await loadUser(address);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      alert(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    walletService.disconnect();
    setWalletAddress(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (walletAddress) {
      await loadUser(walletAddress);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        user,
        isConnecting,
        connectWallet,
        disconnectWallet,
        refreshUser,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

