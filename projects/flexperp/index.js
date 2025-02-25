const ADDRESSES = require("../helper/coreAssets.json");

async function baseTvl(api) {
  const vaultStorageAddress = "0x1375653D8a328154327e48A203F46Aa70B6C0b92";
  const flpUnderlyings = [
    ADDRESSES.base.USDC,
    ADDRESSES.base.WETH,
    ADDRESSES.ethereum.cbBTC // cbBTC
  ];
  return api.sumTokens({ owner: vaultStorageAddress, tokens: flpUnderlyings });
}

module.exports = {
  start: '2025-02-20',
  base: {
    tvl: baseTvl,
  },
};
