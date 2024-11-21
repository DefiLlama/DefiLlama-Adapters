const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const ethTokenBridgeAddress = '0x579a3bde631c3d8068cbfe3dc45b0f14ec18dd43'
const ethBridgedAlphAddress = '0x590f820444fa3638e022776752c5eef34e2f89a6'
const bscTokenBridgeAddress = '0x2971F580C34d3D584e0342741c6a622f69424dD8'
const bscBridgedAlphAddress = '0x8683BA2F8b0f69b2105f26f488bADe1d3AB4dec8'

async function tvl(ts, block) {
  const ethTotalBridgedAlphSupply = await sdk.api.erc20.totalSupply({ target: ethBridgedAlphAddress, block, chain: 'ethereum' })
  const bscTotalBridgedAlphSupply = await sdk.api.erc20.totalSupply({ target: bscBridgedAlphAddress, block, chain: 'bsc' })
  return {
    alephium: (ethTotalBridgedAlphSupply.output / 1e18) + (bscTotalBridgedAlphSupply.output / 1e18),
  }
}

module.exports = {
  methodology: "Tracks funds locked in the Alephium Bridge Token contracts on Ethereum and Binance Smart Chain",
  ethereum: {
    tvl: sumTokensExport({ owner: ethTokenBridgeAddress, tokens: [
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.DAI
    ] }),
  },
  bsc: {
    tvl: sumTokensExport({ owner: bscTokenBridgeAddress, tokens: [
      ADDRESSES.bsc.WBNB,
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT
    ] }),
  },
  alephium: {
    tvl
  }
};