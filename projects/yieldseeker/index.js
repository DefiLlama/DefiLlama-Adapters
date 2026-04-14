const { getConfig } = require('../helper/cache');
const ADDRESSES = require('../helper/coreAssets.json');

const API_URL = 'https://api.yieldseeker.xyz/v1/agent-analytics';

function normalizeToken(token) {
  if (token.toLowerCase() === ADDRESSES.GAS_TOKEN_2) return ADDRESSES.null;
  return token.toLowerCase();
}

async function tvl(api) {
  const { agentAnalytics = [] } = await getConfig('yieldseeker/yield-agents/', API_URL);

  // Build ownerTokens for on-chain balance queries (Giza-style)
  const ownerTokens = [];
  for (const agent of agentAnalytics) {
    if (!agent?.snapshot?.tokenBalances || typeof agent.snapshot.tokenBalances !== 'object') continue;
    const tokens = Object.keys(agent.snapshot.tokenBalances).map(normalizeToken);
    if (tokens.length > 0) {
      ownerTokens.push([tokens, agent.agentWalletAddress]);
    }
  }
  await api.sumTokens({ ownerTokens, permitFailure: true });

  // Unwrap ERC4626 vault shares to their underlying USDC.
  // Derive the share->underlying ratio from the API's tokenBalances (raw shares)
  // and tokenBalancesBase (USDC value), then replace vault balances with USDC.
  const USDC = ADDRESSES.base.USDC.toLowerCase();
  const WETH = (ADDRESSES.base.WETH_2 || ADDRESSES.base.WETH || '').toLowerCase();

  // Aggregate per-vault totals to compute a global share->underlying ratio
  const vaultTotals = {}; // vault -> { totalRawShares: bigint, totalBaseValue: bigint }
  for (const agent of agentAnalytics) {
    const snapshot = agent?.snapshot;
    if (!snapshot) continue;
    const raw = snapshot.tokenBalances || {};
    const base = snapshot.tokenBalancesBase || {};
    for (const [token, rawBalance] of Object.entries(raw)) {
      const baseValue = base[token];
      if (!baseValue || +baseValue === 0 || !rawBalance || +rawBalance === 0) continue;
      const key = normalizeToken(token);
      // Skip tokens DefiLlama can already price natively
      if (key === USDC || key === ADDRESSES.null || key === WETH) continue;
      if (!vaultTotals[key]) vaultTotals[key] = { totalRawShares: 0n, totalBaseValue: 0n };
      vaultTotals[key].totalRawShares += BigInt(rawBalance);
      vaultTotals[key].totalBaseValue += BigInt(baseValue);
    }
  }

  // For each vault, replace on-chain share balance with USDC equivalent
  for (const [vault, { totalRawShares, totalBaseValue }] of Object.entries(vaultTotals)) {
    if (totalRawShares === 0n) continue;
    const vaultKey = `base:${vault}`;
    const balances = api.getBalances();
    const shareBalance = balances[vaultKey];
    if (!shareBalance || +shareBalance === 0) continue;

    // Use the API ratio: underlying = shares * totalBaseValue / totalRawShares
    // shareBalance may be a float string from sumTokens, convert via string manipulation
    const shareBalanceBigInt = BigInt(Math.round(+shareBalance));
    const underlyingAmount = shareBalanceBigInt * totalBaseValue / totalRawShares;
    api.removeTokenBalance(vaultKey);
    api.add(USDC, underlyingAmount.toString());
  }
}

module.exports = {
  methodology: 'Counts the tokens held across all YieldSeeker agent wallets. Wallet addresses are obtained from the YieldSeeker API, and token balances are read on-chain.',
  timetravel: false,
  doublecounted: true,
  base: { tvl },
};
