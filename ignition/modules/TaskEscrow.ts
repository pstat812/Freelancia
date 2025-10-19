import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TaskEscrowModule", (m) => {
  const PYUSD_SEPOLIA = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  
  const pyusdAddress = m.getParameter("pyusdAddress", PYUSD_SEPOLIA);
  
  const taskEscrow = m.contract("TaskEscrow", [pyusdAddress]);

  return { taskEscrow };
});

