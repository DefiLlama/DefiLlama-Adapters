const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const TOPCUT_VAULT = "0x3cfc3CBA1B4aAF969057F590D23efe46848F4270";
const ETH = ADDRESSES.null


async function tvl(api) {
  return sumTokens2({
    owner: TOPCUT_VAULT,
    tokens: [ETH],
    api
  })
}

module.exports = {
  methodology:
    "TVL is calculated based on the amount of ETH in the TopCut Vault.",
  arbitrum: { tvl },
};
