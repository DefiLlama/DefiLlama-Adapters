const { addCrossToken } = require('../helper/chain/cross');

const STAKING_CONTRACTS = ['0x8bD742488CdD51658cF871b737Ce24e20FDdd711'];
const CROSS_TOKEN_ADDRESS = '0x642060e8B44C8f2d6D2974a71a0ca8F995cAfBdA';

// getTotalDeposited ABI
const ABI = {
  "type": "function",
  "name": "getTotalDeposited",
  "inputs": [{"type": "address", "name": "token"}],
  "outputs": [{"type": "uint256"}],
  "stateMutability": "view"
};

async function tvl(api) {
  const balances = api.getBalances();
  
  for (const contractAddress of STAKING_CONTRACTS) {
    const deposit = await api.call({
      abi: ABI,
      target: contractAddress,
      params: [CROSS_TOKEN_ADDRESS],
    });
    
    addCrossToken(balances, CROSS_TOKEN_ADDRESS, deposit.toString());
  }
}

module.exports = {
  methodology: 'TVL is the total amount of CROSS tokens staked in the Cross Rewards contract.',
  cross: {
    tvl,
  },
};
