const { getConfig } = require('../helper/cache');

const API_URL = 'https://api.yieldseeker.xyz/v1/agent-analytics';
const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

function normalizeToken(token) {
  if (token.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) return NULL_ADDRESS;
  return token.toLowerCase();
}

async function tvl(api) {
  const { agentAnalytics = [] } = await getConfig('yieldseeker/yield-agents/' + api.chain, API_URL);
  const ownerTokens = [];
  for (const agent of agentAnalytics) {
    if (!agent?.snapshot?.tokenBalances || typeof agent.snapshot.tokenBalances !== 'object') continue;
    const tokens = Object.keys(agent.snapshot.tokenBalances).map(normalizeToken);
    if (tokens.length > 0) {
      ownerTokens.push([tokens, agent.agentWalletAddress]);
    }
  }
  await api.sumTokens({ ownerTokens, permitFailure: true });
  return api.getBalances();
}

module.exports = {
  methodology: 'Counts the tokens held across all YieldSeeker agent wallets. Wallet addresses are obtained from the YieldSeeker API, and token balances are read on-chain.',
  timetravel: false,
  doublecounted: true,
  base: { tvl },
};
