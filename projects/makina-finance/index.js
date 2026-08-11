// https://docs.makina.finance/
// https://makina.finance/

// Makina TVL Adapter - External Pricing Version
const DUSD_TOKEN = '0x1e33e98af620f1d563fcd3cfd3c75ace841204ef';
const DETH_TOKEN = '0x871ab8e36cae9af35c6a3488b049965233deb7ed';
const DBIT_TOKEN = '0x972966bcc17f7d818de4f27dc146ef539c231bdf';
const usdSHFmk_TOKEN = '0xac499adf00a54044b988a59b19016655c3494b06';
const intMkSrRoyUSDC_TOKEN = '0x1004D230aCA4b781d0049AFD6D0b1ee8ed3A6787';
const DQAeETH_TOKEN = '0x2b24dFcE3a6AEF36E147C692Fa32d484ec538FC1';

// intMkSrRoyUSDC is minted against deposits routed in from Royco V2's srRoyUSDC vault, and
// projects/royco-v2 already counts those deposits at the issuing vault (its stated Yearn-style
// convention: deposits count toward the issuing protocol even when forwarded elsewhere). The
// strategy-held share is therefore subtracted here so the same dollars are not counted on both
// protocols. Holders are read from the vault rather than hardcoded, so this follows along if
// Royco adds or rotates strategies.
const SR_ROY_USDC_VAULT = '0xcd9f5907f92818bc06c9ad70217f089e190d2a32';
const getStrategiesAbi = 'function getStrategies() view returns (address[])';

async function roycoHeldIntMkSrRoyUSDC(api) {
  const strategies = await api.call({ abi: getStrategiesAbi, target: SR_ROY_USDC_VAULT });
  if (!strategies.length) return 0n;

  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: strategies.map((strategy) => ({ target: intMkSrRoyUSDC_TOKEN, params: [strategy] })),
  });
  return balances.reduce((sum, balance) => sum + BigInt(balance), 0n);
}

async function tvl(api) {
  const [dusdSupply, dethSupply, dbitSupply, usdSHFmkSupply, intMkSrRoyUSDCSupply, DQAeETHSupply, roycoHeld] = await Promise.all([
    api.call({ abi: 'erc20:totalSupply', target: DUSD_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: DETH_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: DBIT_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: usdSHFmk_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: intMkSrRoyUSDC_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: DQAeETH_TOKEN }),
    roycoHeldIntMkSrRoyUSDC(api),
  ]);

  return {
    [DUSD_TOKEN]: dusdSupply,
    [DETH_TOKEN]: dethSupply,
    [DBIT_TOKEN]: dbitSupply,
    [usdSHFmk_TOKEN]: usdSHFmkSupply,
    [intMkSrRoyUSDC_TOKEN]: (BigInt(intMkSrRoyUSDCSupply) - roycoHeld).toString(),
    [DQAeETH_TOKEN]: DQAeETHSupply,
  };
}

module.exports = {
  methodology: "TVL counts the total supply of share tokens of the protocol. intMkSrRoyUSDC is counted net of the amount held by Royco V2's srRoyUSDC strategies, since projects/royco-v2 already counts those deposits at the issuing vault.",
  misrepresentedTokens: true,
  start: 23428036,
  ethereum: { tvl },
};