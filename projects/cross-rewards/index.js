const { addCrossToken } = require('../helper/chain/cross');

const DEPOSIT_CONTRACTS = ['0x8bD742488CdD51658cF871b737Ce24e20FDdd711'];
const CROSS_TOKEN_ADDRESS = '0x642060e8B44C8f2d6D2974a71a0ca8F995cAfBdA';


async function staking(api) {
  const balances = api.getBalances();
  
  for (const contractAddress of DEPOSIT_CONTRACTS) {
    const deposit = await api.call({
      abi: "function getTotalDeposited(address) external view returns (uint256)",
      target: contractAddress,
      params: [CROSS_TOKEN_ADDRESS],
    });
    
    addCrossToken(balances, CROSS_TOKEN_ADDRESS, deposit.toString());
  }
}

module.exports = {
  methodology: 'CROSS amount deposisted to CROSS Rewards contract',
  cross: {
    tvl: () => ({}),
    staking,
  },
};
