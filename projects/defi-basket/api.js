const { sumTokens2 } = require('../helper/unwrapLPs')

const factory = '0xee13c86ee4eb1ec3a05e2cc3ab70576f31666b3b'
const blacklistedTokens = [
  '0x0b91b07beb67333225a5ba0259d55aee10e3a578', // MNEP
]

async function tvl(api) {
  const wallets = await api.multiCall({
    itemAbi: abis.walletOf,
    lengthAbi: abis.tokenCounter,
    target: factory,
  })
  return sumTokens2({ owners: wallets, fetchCoValentTokens: true, api, blacklistedTokens, });
}

module.exports = {
  timetravel: false,
  methodology: "The TVL is calculated by summing the value of all assets that are in the wallets deployed by the DeFiBasket contract.",
  polygon: {
    tvl
  },
}

const abis = {
  tokenCounter: "uint256:tokenCounter",
  walletOf: "function walletOf(uint256 nftId) view returns (address)",
}
