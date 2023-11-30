const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokenBridgeAddress = '0x579a3bde631c3d8068cbfe3dc45b0f14ec18dd43'
const bridgedAlphAddress = '0x590f820444fa3638e022776752c5eef34e2f89a6'

async function tvl(ts, block) {
  const totalBridgedAlphSupply = await sdk.api.erc20.totalSupply({ target: bridgedAlphAddress, block })
  return {
    alephium: totalBridgedAlphSupply.output / 1e18,
  }
}

module.exports = {
  methodology: "Tracks funds locked in the Alephium Bridge Token contracts on Ethereum",
  ethereum: {
    tvl: sumTokensExport({ owner: tokenBridgeAddress, tokens: [
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.DAI
    ] }),
  },
  alephium: {
    tvl
  }
};