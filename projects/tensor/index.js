const { getConnection } = require('../helper/solana');
const { PublicKey } = require("@solana/web3.js");

const TENSOR_SWAP_PROGRAM_ID = 'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN';

async function tvl(api) {
  const connection = getConnection();
  const programId = new PublicKey(TENSOR_SWAP_PROGRAM_ID);
  
  // Fetch all accounts owned by Tensor Swap to get the locked SOL
  const accounts = await connection.getProgramAccounts(programId, {
    dataSlice: { offset: 0, length: 0 } // Optimization: we only care about the lamports, not the data
  });
  
  const totalLamports = accounts.reduce((acc, { account }) => acc + account.lamports, 0);
  
  api.add('So11111111111111111111111111111111111111112', totalLamports);
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: 'TVL includes native SOL held in Tensor Swap bidding pools and escrow accounts. It is calculated by efficiently fetching all Program Derived Addresses (PDAs) owned by the Tensor Swap program and summing their lamports. The Tensor cNFT program is currently excluded due to RPC limits on account enumeration'
};
