// https://docs.makina.finance/
// https://makina.finance/

// Makina TVL Adapter - External Pricing Version
const DUSD_TOKEN = '0x1e33e98af620f1d563fcd3cfd3c75ace841204ef';
const DETH_TOKEN = '0x871ab8e36cae9af35c6a3488b049965233deb7ed';
const DBIT_TOKEN = '0x972966bcc17f7d818de4f27dc146ef539c231bdf';
const usdSHFmk_TOKEN = '0xac499adf00a54044b988a59b19016655c3494b06';
const intMkSrRoyUSDC_TOKEN = '0x1004D230aCA4b781d0049AFD6D0b1ee8ed3A6787';
const DQAeETH_TOKEN = '0x2b24dFcE3a6AEF36E147C692Fa32d484ec538FC1';

async function tvl(api) {
  const [dusdSupply, dethSupply, dbitSupply, usdSHFmkSupply, intMkSrRoyUSDCSupply, DQAeETHSupply] = await Promise.all([
    api.call({ abi: 'erc20:totalSupply', target: DUSD_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: DETH_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: DBIT_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: usdSHFmk_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: intMkSrRoyUSDC_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: DQAeETH_TOKEN }),
  ]);

  return {
    [DUSD_TOKEN]: dusdSupply,
    [DETH_TOKEN]: dethSupply,
    [DBIT_TOKEN]: dbitSupply,
    [usdSHFmk_TOKEN]: usdSHFmkSupply,
    [intMkSrRoyUSDC_TOKEN]: intMkSrRoyUSDCSupply,
    [DQAeETH_TOKEN]: DQAeETHSupply,
  };
}

module.exports = {
  methodology: "TVL counts the total supply of share tokens of the protocol",
  misrepresentedTokens: true,
  start: 23428036,
  ethereum: { tvl },
};