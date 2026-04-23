const ADDRESSES = require('../helper/coreAssets.json')
const GBLIN_VAULT = "0x38DcDB3A381677239BBc652aed9811F2f8496345";

async function tvl(api) {
  return api.sumTokens({
    owner: GBLIN_VAULT,
    tokens: [ADDRESSES.optimism.WETH_1, ADDRESSES.ethereum.cbBTC, ADDRESSES.base.USDC]
  });
}

module.exports = {
  methodology: "TVL is calculated by summing the balances of WETH, cbBTC, and USDC strictly locked as backing collateral inside the GBLIN V5 Vault contract on Base.",
  base: {
    tvl
  }
};
