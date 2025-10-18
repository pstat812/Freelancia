import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers';
import { networkConfig } from '../config/supabase.config';

// MetaMask Wallet Service
export class WalletService {
  private provider: BrowserProvider | null = null;
  private signer: any | null = null;

  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Connect wallet
  async connect(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      this.provider = new BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.signer = await this.provider.getSigner();
      const address = accounts[0];

      // Check if on correct network
      await this.checkNetwork();

      return address;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  // Get connected account
  async getAccount(): Promise<string | null> {
    if (!this.isMetaMaskInstalled()) return null;

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      return accounts && accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  // Check and switch network
  async checkNetwork(): Promise<void> {
    if (!this.provider) return;

    const network = await this.provider.getNetwork();
    const currentChainId = Number(network.chainId);

    if (currentChainId !== networkConfig.chainId) {
      await this.switchNetwork();
    }
  }

  // Switch to Sepolia testnet
  async switchNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${networkConfig.chainId.toString(16)}`,
            chainName: networkConfig.chainName,
            rpcUrls: [networkConfig.rpcUrl],
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        throw error;
      }
    }
  }

  // Disconnect wallet
  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  // Get wallet balance (ETH)
  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const balance = await this.provider.getBalance(address);
    return formatUnits(balance, 18);
  }

  // PYUSD Contract Methods
  async getPYUSDBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');

    // PYUSD is an ERC20 token
    const pyusdContract = new Contract(
      networkConfig.pyusdContractAddress,
      [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ],
      this.provider
    );

    const balance = await pyusdContract.balanceOf(address);
    const decimals = await pyusdContract.decimals();
    return formatUnits(balance, decimals);
  }

  // Transfer PYUSD
  async transferPYUSD(to: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');

    const pyusdContract = new Contract(
      networkConfig.pyusdContractAddress,
      [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)',
      ],
      this.signer
    );

    const decimals = await pyusdContract.decimals();
    const amountWei = parseUnits(amount, decimals);

    const tx = await pyusdContract.transfer(to, amountWei);
    await tx.wait();

    return tx.hash;
  }

  // Approve PYUSD spending (for escrow contract)
  async approvePYUSD(spender: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');

    const pyusdContract = new Contract(
      networkConfig.pyusdContractAddress,
      [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)',
      ],
      this.signer
    );

    const decimals = await pyusdContract.decimals();
    const amountWei = parseUnits(amount, decimals);

    const tx = await pyusdContract.approve(spender, amountWei);
    await tx.wait();

    return tx.hash;
  }
}

// Singleton instance
export const walletService = new WalletService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

