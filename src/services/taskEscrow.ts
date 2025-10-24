import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';

const TASK_ESCROW_ABI = [
  "function depositForTask(string taskId, uint256 amount, uint256 deadline) external",
  "function getTask(string taskId) external view returns (tuple(string taskId, address client, uint256 amount, uint256 deadline, bool fundsDeposited, uint256 createdAt))",
  "function hasFundsDeposited(string taskId) external view returns (bool)",
  "function getContractBalance() external view returns (uint256)",
  "function pyusdToken() external view returns (address)",
  "function assignFreelancer(string taskId, address freelancer) external",
  "function releasePayment(string taskId) external",
  "function taskFreelancers(string taskId) external view returns (address)",
  "event FundsReleased(string indexed taskId, address indexed freelancer, uint256 amount)"
];

// ERC20 ABI for PYUSD token (approval)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

// Contract addresses from environment variables
const TASK_ESCROW_ADDRESS = import.meta.env.VITE_TASK_ESCROW_ADDRESS;
const PYUSD_TOKEN_ADDRESS = import.meta.env.PYUSD_ADDRESS || '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9';

export class TaskEscrowService {
  private provider: BrowserProvider | null = null;
  private taskEscrowContract: Contract | null = null;
  private pyusdContract: Contract | null = null;


  async initialize(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    if (!TASK_ESCROW_ADDRESS) {
      throw new Error('TaskEscrow contract address not configured. Please add VITE_TASK_ESCROW_ADDRESS to your .env file');
    }

    this.provider = new BrowserProvider(window.ethereum);
    const signer = await this.provider.getSigner();

    // Initialize contracts
    this.taskEscrowContract = new Contract(TASK_ESCROW_ADDRESS, TASK_ESCROW_ABI, signer);
    this.pyusdContract = new Contract(PYUSD_TOKEN_ADDRESS, ERC20_ABI, signer);
  }

  async getPyusdBalance(address: string): Promise<string> {
    if (!this.pyusdContract) await this.initialize();
    
    const balance = await this.pyusdContract!.balanceOf(address);
    return formatUnits(balance, 6); // PYUSD has 6 decimals
  }

  async checkAllowance(ownerAddress: string): Promise<string> {
    if (!this.pyusdContract) await this.initialize();
    
    const allowance = await this.pyusdContract!.allowance(ownerAddress, TASK_ESCROW_ADDRESS);
    return formatUnits(allowance, 6);
  }


  async approvePyusd(amount: number): Promise<void> {
    if (!this.pyusdContract) await this.initialize();
    
    const amountInSmallestUnit = parseUnits(amount.toString(), 6);
    
    console.log('Approving PYUSD spend...', {
      amount,
      amountInSmallestUnit: amountInSmallestUnit.toString(),
      spender: TASK_ESCROW_ADDRESS
    });

    const tx = await this.pyusdContract!.approve(TASK_ESCROW_ADDRESS, amountInSmallestUnit);
    console.log('Approval transaction sent:', tx.hash);
    
    await tx.wait();
    console.log('Approval confirmed');
  }

  async depositForTask(
    taskId: string,
    amount: number,
    deadline: Date
  ): Promise<string> {
    if (!this.taskEscrowContract) await this.initialize();

    const amountInSmallestUnit = parseUnits(amount.toString(), 6);
    const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

    console.log('Depositing PYUSD for task...', {
      taskId,
      amount,
      amountInSmallestUnit: amountInSmallestUnit.toString(),
      deadline: deadline.toISOString(),
      deadlineTimestamp
    });

    const tx = await this.taskEscrowContract!.depositForTask(
      taskId,
      amountInSmallestUnit,
      deadlineTimestamp
    );

    console.log('Deposit transaction sent:', tx.hash);
    
    await tx.wait();
    console.log('Deposit confirmed');

    return tx.hash;
  }


  async hasFundsDeposited(taskId: string): Promise<boolean> {
    if (!this.taskEscrowContract) await this.initialize();
    
    return await this.taskEscrowContract!.hasFundsDeposited(taskId);
  }


  async getTask(taskId: string): Promise<{
    taskId: string;
    client: string;
    amount: string;
    deadline: Date;
    fundsDeposited: boolean;
    createdAt: Date;
  }> {
    if (!this.taskEscrowContract) await this.initialize();
    
    const task = await this.taskEscrowContract!.getTask(taskId);
    
    return {
      taskId: task.taskId,
      client: task.client,
      amount: formatUnits(task.amount, 6),
      deadline: new Date(Number(task.deadline) * 1000),
      fundsDeposited: task.fundsDeposited,
      createdAt: new Date(Number(task.createdAt) * 1000)
    };
  }

  async getContractBalance(): Promise<string> {
    if (!this.taskEscrowContract) await this.initialize();
    
    const balance = await this.taskEscrowContract!.getContractBalance();
    return formatUnits(balance, 6);
  }

  async assignFreelancer(taskId: string, freelancerAddress: string): Promise<string> {
    if (!this.taskEscrowContract) await this.initialize();

    const tx = await this.taskEscrowContract!.assignFreelancer(taskId, freelancerAddress);
    await tx.wait();

    return tx.hash;
  }

  async releasePayment(taskId: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.taskEscrowContract) await this.initialize();

      const tx = await this.taskEscrowContract!.releasePayment(taskId);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error releasing payment:', error);
      return {
        success: false,
        error: error.message || 'Payment release failed'
      };
    }
  }

  async getTaskFreelancer(taskId: string): Promise<string> {
    if (!this.taskEscrowContract) await this.initialize();
    
    return await this.taskEscrowContract!.taskFreelancers(taskId);
  }
}

export const taskEscrowService = new TaskEscrowService();

export const releasePayment = async (taskId: string): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  return await taskEscrowService.releasePayment(taskId);
};

