const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvlAvalanche(api) {
  return sumTokens2({
    api,
    owners: [
      '0xBC7C0b1b9C61f35068561077FbaA163707128597', // Owner of reserves backing SIERRA, see https://debank.com/profile/0xBC7C0b1b9C61f35068561077FbaA163707128597 or https://docs.sierra.money/reserves-management/reserve-strategy
    ],
    tokens: [
      '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC on Avalanche
      '0x09Ca60Ca323a6313aE144778c3EbDfCCFBB5e5D2', // OpenTrade XMMF Vault
      '0x3458F1Cab06cdf7C9323d8FffB04093F9D8380b6', // OpenTrade xMorphoGPUSDC-Base Vault
      '0x4a8094F20906a453a4A74769aa74c4012B0d5Df6', // OpenTrade xAaveUSDC-ETH Vault
      '0x4c8eaBA17c3b30295f442A6415d495e8410a5693' // OpenTrade xWildcatWMTUSDC-ETH Vault
    ],
  });
}

module.exports = {
  timetravel: false,
  avax: {
    tvl: tvlAvalanche,
  },
};
