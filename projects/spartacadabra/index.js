
// CHARM token contract address
const CHARM = '0x248CB87DDA803028dfeaD98101C9465A2fbdA0d4';

// List of contracts holding tokens
const CONTRACTS = [
  '0x3e0c908de05193147e1278A3065b0784FeD80694', // Global Incentive Pool
  '0xB7396019BC1Ee7E771155D138D57Ee9aBf16F5b4', // Spartacadabra DAO
  '0xf98237Ef6c9A4990496d38a374d0C1098E26719e', // Team Vesting
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', // LBP on Beethoven X
];

async function tvl(api) {
  const balances = await api.multiCall({ 
    abi: 'erc20:balanceOf', 
    calls: CONTRACTS.map(contract => ({ target: CHARM, params: [contract] }))
  });
  const totalBalance = balances.reduce((sum, balance) => sum + Number(balance), 0);
  api.add(CHARM, totalBalance);
}

module.exports = {
  methodology: 'TVL account in Spartacadabra',
  fantom: { tvl },
};