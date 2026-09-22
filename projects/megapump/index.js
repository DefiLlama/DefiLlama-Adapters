const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')

// MegaETH mainnet (chainId 4326)
const CURVE_FACTORY = '0xB6bC3988d62D2979b3ab7AABCcf3c9443f7dAbc4' // MegaPump, UUPS proxy: holds the ETH of every active bonding curve
const DEX_FACTORY = '0x4188aDbFfBec026EdE44F2C3A7E22beDD880a46f' // MegaPumpV2Factory, Uniswap V2 fork: pools created at graduation

const TOKEN_DATA_ABI =
  'function tokenData(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 createdBlock, uint256 createdAt, address tokenAddress, uint256 totalRaised, uint256 tokensSold, uint256 creatorFees, bool graduated, address dexPool, uint256 lpTokenId, uint256 graduationETH)'

// Liquidity held by graduated tokens, paired against WETH on the protocol's own V2 fork.
const dexTvl = getUniTVL({
  factory: DEX_FACTORY,
  useDefaultCoreAssets: true,
  fetchBalances: true,
})

async function tvl(api) {
  const count = await api.call({ target: CURVE_FACTORY, abi: 'uint256:tokenCount' })

  // Token ids start at 1.
  const ids = Array.from({ length: Number(count) }, (_, i) => i + 1)
  const tokens = ids.length
    ? await api.multiCall({ target: CURVE_FACTORY, abi: TOKEN_DATA_ABI, calls: ids })
    : []

  // `totalRaised` is the ETH net of fees still held by a curve. It is drained to
  // the DEX pool at graduation, so only pre-graduation tokens are counted here:
  // the graduated ones are already picked up by the pool sweep below.
  // Accrued platform and creator fees are deliberately excluded, which is why
  // this sums `totalRaised` instead of reading the contract's native balance.
  const locked = tokens
    .filter((t) => !t.graduated)
    .reduce((acc, t) => acc + BigInt(t.totalRaised), 0n)

  api.addGasToken(locked)

  await dexTvl(api)
  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL is the ETH locked in active bonding curves (sum of totalRaised over tokens that have not graduated, read from the MegaPump factory) plus the liquidity of the pools created on the MegaPump V2 DEX when a token graduates. Accrued platform and creator fees held by the factory are excluded.',
  start: 20898751,
  megaeth: { tvl },
}
