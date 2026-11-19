const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const abi = {
  currentPriceDAI: 'uint256:currentPriceDAI',
}

const DAI = ADDRESSES.ethereum.DAI
const Gfuse = '0x495d133B938596C9984d462F007B676bDc57eCEC' // GoodDollar on Fuse
const FUSE_STAKING = '0xA199F0C353E25AdF022378B0c208D600f39a6505'
const RESERVE_ADDRESS = '0xa150a825d425B36329D8294eeF8bD0fE68f8F6E0'
const COMMUNITY_SAFE = '0x5Eb5f5fE13d1D5e6440DbD5913412299Bc5B5564'
const GOODDOLLAR_DECIMALS = 2

// GoodDollar isn't listed on CoinGecko, so we value the GD held in the treasury
// in DAI using the reserve's on-chain price.
async function ownTokens(api) {
  const [inSafe, inStaking] = await api.multiCall({
    target: Gfuse,
    abi: 'erc20:balanceOf',
    calls: [COMMUNITY_SAFE, FUSE_STAKING],
  })
  const gdTotal = BigInt(inSafe) + BigInt(inStaking)

  const ethApi = new sdk.ChainApi({ chain: 'ethereum', timestamp: api.timestamp })
  const gdPriceInDAI = await ethApi.call({ target: RESERVE_ADDRESS, abi: abi.currentPriceDAI })

  const gdInDAI = (gdTotal * BigInt(gdPriceInDAI)) / (10n ** BigInt(GOODDOLLAR_DECIMALS))
  api.add(DAI, gdInDAI)
}

module.exports = {
  fuse: {
    tvl: () => ({}),
    ownTokens,
  },
}
