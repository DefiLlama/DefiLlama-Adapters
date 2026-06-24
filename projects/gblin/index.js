const ADDRESSES = require('../helper/coreAssets.json')
const GBLIN_VAULT = "0x36C81d7E1966310F305eA637e761Cf77F90852f0";

async function tvl(api) {
  return api.sumTokens({
    owner: GBLIN_VAULT,
    tokens: [ADDRESSES.optimism.WETH_1, ADDRESSES.ethereum.cbBTC, ADDRESSES.base.USDC]
  });
}

module.exports = {
  methodology: "TVL is calculated by summing the balances of WETH, cbBTC, and USDC strictly locked as backing collateral inside the GBLIN V6 Vault contract on Base.",
  base: {
    tvl
  }
};
