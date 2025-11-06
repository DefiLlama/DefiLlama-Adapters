const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
async function baseTvl(api) {
  const tokensAndOwners = [
    [ADDRESSES.base.USDC, "0x395c7f20bc6f38dfc644aa1a4023dc47d6939481"], // Vault
    [ADDRESSES.base.cbBTC, "0x395c7f20bc6f38dfc644aa1a4023dc47d6939481"], // Vault
    [ADDRESSES.base.WETH, "0x395c7f20bc6f38dfc644aa1a4023dc47d6939481"], // Vault
    [ADDRESSES.base.weETH, "0x395c7f20bc6f38dfc644aa1a4023dc47d6939481"], // Vault
  ];
  return sumTokens2({ api, tokensAndOwners });
}

async function arbitrumTvl(api) {
  const tokensAndOwners = [
    [ADDRESSES.arbitrum.USDC_CIRCLE, "0x255659CaC93868AAf7AFcfB3F862AC300E3697B4"], // Vault
    [ADDRESSES.arbitrum.weETH, "0x255659CaC93868AAf7AFcfB3F862AC300E3697B4"], // Vault
  ];
  return sumTokens2({ api, tokensAndOwners });
}

async function bscTvl(api) {
  const tokensAndOwners = [
    [ADDRESSES.bsc.USDC, "0x6388E83ed0808F3bd0744bB38AA8ecf5dA4C0D8F"], // Vault
    [ADDRESSES.bsc.weETH, "0x6388E83ed0808F3bd0744bB38AA8ecf5dA4C0D8F"], // Vault
  ];
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  start: '2025-02-18',
  base: { tvl: baseTvl },
  arbitrum: { tvl: arbitrumTvl },
  bsc: { tvl: bscTvl },
};
