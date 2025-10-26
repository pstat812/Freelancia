export const supabaseConfig = {
  url: import.meta.env.SUPABASE_URL,
  anonKey: import.meta.env.SUPABASE_ANON_KEY,
};

export const networkConfig = {
  chainId: 11155111,
  chainName: 'Sepolia', 
  rpcUrl: import.meta.env.SEPOLIA_RPC_URL,
  pyusdContractAddress: import.meta.env.PYUSD_ADDRESS,
};

