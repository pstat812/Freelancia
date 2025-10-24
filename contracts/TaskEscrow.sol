// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TaskEscrow is ReentrancyGuard {
    IERC20 public pyusdToken;
    
    struct Task {
        string taskId;
        address client;
        uint256 amount;
        uint256 deadline;
        bool fundsDeposited;
        uint256 createdAt;
    }
    
    mapping(string => Task) public tasks;
    mapping(string => address) public taskFreelancers;
    
    event TaskCreated(string indexed taskId, address indexed client, uint256 amount);
    event FundsDeposited(string indexed taskId, address indexed client, uint256 amount);
    event FundsReleased(string indexed taskId, address indexed freelancer, uint256 amount);
    
    constructor(address _pyusdToken) {
        require(_pyusdToken != address(0), "Invalid PYUSD token address");
        pyusdToken = IERC20(_pyusdToken);
    }
    

    function depositForTask(
        string memory taskId,
        uint256 amount,
        uint256 deadline
    ) external nonReentrant {
        require(bytes(taskId).length > 0, "Task ID cannot be empty");
        require(amount > 0, "Amount must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(tasks[taskId].client == address(0), "Task already exists");
        
        // Transfer PYUSD from client to this contract
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "PYUSD transfer failed"
        );
        
        // Store task info
        tasks[taskId] = Task({
            taskId: taskId,
            client: msg.sender,
            amount: amount,
            deadline: deadline,
            fundsDeposited: true,
            createdAt: block.timestamp
        });
        
        emit TaskCreated(taskId, msg.sender, amount);
        emit FundsDeposited(taskId, msg.sender, amount);
    }
    

    function getTask(string memory taskId) external view returns (Task memory) {
        return tasks[taskId];
    }
    

    function hasFundsDeposited(string memory taskId) external view returns (bool) {
        return tasks[taskId].fundsDeposited;
    }
    
    function getContractBalance() external view returns (uint256) {
        return pyusdToken.balanceOf(address(this));
    }
    
    function assignFreelancer(string memory taskId, address freelancer) external {
        require(tasks[taskId].fundsDeposited, "Funds not deposited");
        require(freelancer != address(0), "Invalid freelancer address");
        require(taskFreelancers[taskId] == address(0), "Freelancer already assigned");
        
        taskFreelancers[taskId] = freelancer;
    }
    
    function releasePayment(string memory taskId) external nonReentrant {
        Task memory task = tasks[taskId];
        require(task.fundsDeposited, "No funds deposited for this task");
        
        address freelancer = taskFreelancers[taskId];
        require(freelancer != address(0), "No freelancer assigned");
        
        require(
            msg.sender == task.client || msg.sender == freelancer,
            "Only client or assigned freelancer can release payment"
        );
        
        uint256 amount = task.amount;
        
        tasks[taskId].fundsDeposited = false;
        
        require(
            pyusdToken.transfer(freelancer, amount),
            "PYUSD transfer failed"
        );
        
        emit FundsReleased(taskId, freelancer, amount);
    }
}

