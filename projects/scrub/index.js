const { getChainTransform, stripTokenHeader, getFixBalances, transformBalances, } = require('../helper/portedTokens')
const { getTokenPrices } = require("../helper/unknownTokens")

const { requery, } = require('../helper/getUsdUniTvl')
const { getCoreAssets } = require('../helper/tokenMapping')
const { sumTokens, sumTokens2, nullAddress, } = require('../helper/unwrapLPs')
const { isLP, getUniqueAddresses, DEBUG_MODE, sliceIntoChunks, sleep, log } = require('../helper/utils')
const token = ["0x49fB98F9b4a3183Cd88e7a115144fdf00fa6fB95","0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0","0xAA22aEBd60c9Eb653A0aE0Cb8b7367087a9B5Dba"]
const rewardPool = ["0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800","0x14103f4Fc36daCeaCDE4c5313a2b1a462e00B1e8"]
const lps = Object.values({
    'LION-USDC-LP': '0xf2059ed015ec4ecc80f902d9fdbcd2a227bfe037',
    'TIGER-USDC-LP': '0xf6464c80448d6ec4deb7e8e5ec95b8eb768fbf69',
    'BEAR-WBTC-LP': '0x3d9e539fa44b970605658e25d18f816ce78c4007',
})

function scrubTomb({ token = [], shares = [], rewardPool = [], masonry = [], lps, chain = "ethereum", coreAssets = [],
  useDefaultCoreAssets = false, }) {
  let getPrices
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)

  if (!Array.isArray(shares) && typeof shares === 'string')
    shares = [shares]
  if (!Array.isArray(masonry) && typeof masonry === 'string')
    masonry = [masonry]
  if (!Array.isArray(rewardPool) && typeof rewardPool === 'string')
    rewardPool = [rewardPool]
  if (!Array.isArray(token) && typeof token === 'string')
    token = [token]

  const pool2 = async (timestamp, _block, chainBlocks) => {
    let balances = {};
    const block = chainBlocks[chain]
    if (!getPrices)
      getPrices = getTokenPrices({ block, chain, lps, coreAssets, allLps: true })

    const { updateBalances } = await getPrices

    const tao = []
    lps.forEach(token => rewardPool.forEach(owner => tao.push([token, owner])))

    await sumTokens(balances, tao, block, chain, undefined, { resolveLP: true, skipFixBalances: true })
    const fixBalances = await getFixBalances(chain)
    await updateBalances(balances)
    fixBalances(balances)
    return balances
  }
  
  const staking = async (timestamp, _block, chainBlocks) => {
    let balances = {};
    const block = chainBlocks[chain]
    if (!getPrices)
      getPrices = getTokenPrices({ block, chain, lps, coreAssets, allLps: true })

    const { updateBalances } = await getPrices

    const tao = []
    shares.forEach(token => masonry.forEach(owner => tao.push([token, owner])))
    token.forEach(token => rewardPool.forEach(owner => tao.push([token, owner])))

    await sumTokens(balances, tao, block, chain, undefined, { skipFixBalances: true })
    const fixBalances = await getFixBalances(chain)
    await updateBalances(balances)
    fixBalances(balances)
    return balances
  }

  return {
    [chain === "avax" ? "avalanche" : chain]: {
      staking,
      pool2,
      tvl: async () => ({}),

    }
  }

}

module.exports = scrubTomb({
  lps,
  token,
  shares: [
    '0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0', //Tiger
  ],
  rewardPool,
  masonry: [
    '0x05CaB739FDc0A4CE0642604c78F307C6c543cD6d',
  ],
  chain: 'cronos',
  useDefaultCoreAssets: true,
  misrepresentedTokens: true
})
