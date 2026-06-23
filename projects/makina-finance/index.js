// https://docs.makina.finance/
// https://app.makina.finance/

// Makina TVL Adapter - External Pricing Version
const DUSD_TOKEN = '0x1e33e98af620f1d563fcd3cfd3c75ace841204ef';
const DETH_TOKEN = '0x871ab8e36cae9af35c6a3488b049965233deb7ed';
const DBIT_TOKEN = '0x972966bcc17f7d818de4f27dc146ef539c231bdf';
const usdSHFmk_TOKEN = '0xac499adf00a54044b988a59b19016655c3494b06';

async function tvl(api) {
  const [dusdSupply, dethSupply, dbitSupply, usdSHFmkSupply] = await Promise.all([
    api.call({ abi: 'erc20:totalSupply', target: DUSD_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: DETH_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: DBIT_TOKEN }),
    api.call({ abi: 'erc20:totalSupply', target: usdSHFmk_TOKEN }),
  ]);

  return {
    [DUSD_TOKEN]: dusdSupply,
    [DETH_TOKEN]: dethSupply,
    [DBIT_TOKEN]: dbitSupply,
    [usdSHFmk_TOKEN]: usdSHFmkSupply,
  };
}

module.exports = {
  methodology: "TVL counts the total supply of share tokens of the protocol",
  misrepresentedTokens: true,
  start: 23428036,
  ethereum: { tvl },
};