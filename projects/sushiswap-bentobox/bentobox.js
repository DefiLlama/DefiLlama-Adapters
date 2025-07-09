const { CONFIG, getTokens } = require("./helper");

const abi = "function toAmount(address token, uint256 share, bool roundUp) view returns (uint256 amount)";

const bentobox = async (api) => {
  const chain = api.chain
  const block = await api.getBlock()
  if (chain === 'moonriver') return {}

  const [bentoTokens = [], tridentTokens = [], kashiTokens = [], furoTokens = []] = await Promise.all([
    getTokens(api, block, 'bento'),
    CONFIG[api.chain]?.trident ? getTokens(api, block, 'trident') : Promise.resolve([]),
    CONFIG[api.chain]?.kashi ? getTokens(api, block, 'kashi') : Promise.resolve([]),
    CONFIG[api.chain]?.furo ? getTokens(api, block, 'furo') : Promise.resolve([]),
]);

  const shareBalances = {};
  kashiTokens.forEach((pair) => {
    const assetId = pair.asset.id.toLowerCase();
    const collateralId = pair.collateral.id.toLowerCase();
    const assetShares = Number(pair.totalAsset.elastic);
    const collateralShares = Number(pair.totalCollateralShare);
    if (assetShares > 0) shareBalances[assetId] = (shareBalances[assetId] || 0) + assetShares;
    if (collateralShares > 0) shareBalances[collateralId] = (shareBalances[collateralId] || 0) + collateralShares;
  });

  furoTokens.forEach((token) => {
    const id = token.id.toLowerCase();
    const shares = Number(token.liquidityShares);
    if (shares > 0) shareBalances[id] = (shareBalances[id] || 0) + shares;
  });

  const shareBalancesMap = {};
  const calls  = Object.entries(shareBalances).map(([token, shares]) => ({ token, call: { target: CONFIG[api.chain].bentobox, params: [token, BigInt(shares), false] } }))
  const balances = await api.multiCall({ abi, calls: calls.map(c => c.call) });
  calls.forEach(({ token }, i) => { shareBalancesMap[token] = balances[i] });
  
  bentoTokens.forEach(({ id, symbol, rebase}) => {
    const tokenId = id.toLowerCase();
    if (symbol === 'MIM') return;
    api.add(id, rebase.elastic)
    const tridentToken = tridentTokens.find(t => t.id.toLowerCase() === tokenId);
    if (tridentToken) api.add(tokenId, -tridentToken.liquidity)
    const shareBalance = shareBalancesMap[tokenId];
    if (shareBalance) api.add(id, -shareBalance)
  });
}

module.exports = {
  bentobox,
  methodology: `TVL of BentoBox consist of tokens deposited into it minus Trident, Furo and Kashi TVL since they are built on it and already listed on DefiLlama.`,
};
