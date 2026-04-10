const { getConfig } = require('../helper/cache');
const ADDRESSES = require('../helper/coreAssets.json');

const API_URL = 'https://api.yieldseeker.xyz/v1/agent-analytics';

function normalizeToken(token) {
  if (token.toLowerCase() === ADDRESSES.GAS_TOKEN_2) return ADDRESSES.null;
  return token.toLowerCase();
}

async function tvl(api) {
  const { agentAnalytics = [] } = await getConfig('yieldseeker/yield-agents/', API_URL);
  const ownerTokens = [];
  for (const agent of agentAnalytics) {
    if (!agent?.snapshot?.tokenBalances || typeof agent.snapshot.tokenBalances !== 'object') continue;
    const tokens = Object.keys(agent.snapshot.tokenBalances).map(normalizeToken);
    if (tokens.length > 0) {
      ownerTokens.push([tokens, agent.agentWalletAddress]);
    }
  }
  await api.sumTokens({ ownerTokens, permitFailure: true });
}

module.exports = {
  methodology: 'Counts the tokens held across all YieldSeeker agent wallets. Wallet addresses are obtained from the YieldSeeker API, and token balances are read on-chain.',
  timetravel: false,
  doublecounted: true,
  base: { tvl },
};
