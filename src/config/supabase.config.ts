export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const networkConfig = {
  chainId: 11155111,
  chainName: 'Sepolia', 
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
  pyusdContractAddress: import.meta.env.VITE_PYUSD_TOKEN_ADDRESS,
};

