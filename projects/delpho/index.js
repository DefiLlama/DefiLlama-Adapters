
const STABLE_CONFIG_PROVIDER = '0xeC884577055e1f32f2579CAB9f348F4918Cd757f';
const HYPE_CONFIG_PROVIDER = '0x5663bC41DfF50d1b25b94C0Cba6fA5Bbd750D93C';
const PSM = '0x4f5Cdd08eFdcF0e9a09e0eD10849f1102B17882d';
const HYPE_CONFIG_START_BLOCK = 47188561;
const PSM_START_BLOCK = 47185389;

async function addMarketCollateral(api, configProvider) {
  const vault = await api.call({
    abi: 'address:delphoVault',
    target: configProvider,
  });

  const tokens = await api.call({
    abi: 'address[]:getAllSupportedTokens',
    target: configProvider,
  });

  const bals = await api.multiCall({
    abi: 'function totalCollateral(address token) view returns (uint256)',
    calls: tokens.map(token => ({ target: vault, params: [token] })),
  });

  api.addTokens(tokens, bals);
  return tokens;
}

async function tvl(api) {
  const block = await api.getBlock();
  const stableTokens = await addMarketCollateral(api, STABLE_CONFIG_PROVIDER);


  if (block >= HYPE_CONFIG_START_BLOCK)
    await addMarketCollateral(api, HYPE_CONFIG_PROVIDER);

  if (block >= PSM_START_BLOCK) {
    const liquid = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: stableTokens.map(token => ({ target: token, params: [PSM] })),
    });
    const deployed = await api.multiCall({
      abi: 'function totalDeployedByExecutors(address collateral) view returns (uint256)',
      calls: stableTokens.map(token => ({ target: PSM, params: [token] })),
    });

    // Liquid reserves already include the buffer and undeployed executor funds.
    // PSM deployment accounting is separate from each vault's totalCollateral.
    api.addTokens(stableTokens, liquid);
    api.addTokens(stableTokens, deployed);
  }
}

module.exports = {
  methodology:
    'TVL includes collateral in the stable and HYPE market vaults, read via totalCollateral, and PSM stablecoin reserves, measured as token balances held by the PSM plus totalDeployedByExecutors. Supported collateral tokens are enumerated from each market config provider (getAllSupportedTokens). Vault totals already include buffer, allocated, and executor-deployed collateral. USDV (minted debt) and sUSDV (staked USDV) are excluded to avoid double-counting.',
  start: '2026-07-06',
  timetravel: true,
  hyperliquid: { tvl },
};
