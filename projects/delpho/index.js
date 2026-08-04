
const CONFIG_PROVIDER = '0xeC884577055e1f32f2579CAB9f348F4918Cd757f';

async function tvl(api) {
  const vault = await api.call({
    abi: 'address:delphoVault',
    target: CONFIG_PROVIDER,
  });

  const tokens = await api.call({
    abi: 'address[]:getAllSupportedTokens',
    target: CONFIG_PROVIDER,
  });

  const bals = await api.multiCall({
    abi: 'function totalCollateral(address token) view returns (uint256)',
    calls: tokens.map(token => ({ target: vault, params: [token] })),
  });

  api.addTokens(tokens, bals);
}

module.exports = {
  methodology:
    'TVL is user collateral deposited into Delpho, read via the vault\'s totalCollateral view which aggregates buffer, allocated, and executor-deployed amounts. Supported collateral tokens are enumerated from the Delpho config provider (getAllSupportedTokens). USDV (minted debt) and sUSDV (staked USDV) are excluded to avoid double-counting.',
  start: 1783010460,
  timetravel: true,
  hyperliquid: { tvl },
};