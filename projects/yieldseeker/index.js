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
    const snapshot = agent?.snapshot;
    if (!snapshot?.tokenBalances || typeof snapshot.tokenBalances !== 'object') continue;
    const tokenBalancesBase = snapshot.tokenBalancesBase || {};
    const unpricedTokens = [];
    for (const [token, rawBalance] of Object.entries(snapshot.tokenBalances)) {
      const baseValue = tokenBalancesBase[token];
      if (baseValue && +baseValue > 0) {
        // API has already converted this token to the base asset (USDC, 6 decimals)
        api.add(ADDRESSES.base.USDC, +baseValue);
      } else if (rawBalance && +rawBalance > 0) {
        unpricedTokens.push(normalizeToken(token));
      }
    }
    if (unpricedTokens.length > 0) {
      ownerTokens.push([unpricedTokens, agent.agentWalletAddress]);
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
