const { sumTokens2 } = require('../helper/solana');

const INF_VAULT = '7MBk8DXFnZCpKDiSwEMFwtyDNqxXMdUSgm52fQ3Chit4';
const USDC_VAULT = 'HVpnjWTJCDvHL2pL2LeE5Y3mLEE4hP4MwpZpBvBLHQuA';

async function tvl() {
  return sumTokens2({
    tokenAccounts: [INF_VAULT, USDC_VAULT],
  });
}

module.exports = {
  methodology: 'TVL represents all user-deposited SOL plus unclaimed USDC rewards. Calculated by reading vault token balances directly on-chain.',
  solana: {
    tvl,
  },
};
