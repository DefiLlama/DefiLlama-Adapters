const { getChainTransform, stripTokenHeader, getFixBalances, transformBalances, } = require('../helper/portedTokens')
const { getTokenPrices } = require("../helper/unknownTokens")

const { requery, } = require('../helper/getUsdUniTvl')
const { getCoreAssets } = require('../helper/tokenMapping')
const { sumTokens, sumTokens2, nullAddress, } = require('../helper/unwrapLPs')
const { isLP, getUniqueAddresses, DEBUG_MODE, sliceIntoChunks, sleep, log } = require('../helper/utils')
const token = ["0x96b451770772e64a582685d5EDCdfe53A5CD8718","0x2963DAfc960310b400Ed4D4539a9afD40dA1C949"]
const rewardPool = ["0x69F451a527484159F27F34f6A5bd21727434027e"]
const lps = Object.values({
    'LION-USDC-LP': '0xDcDc159cA74c727a8a34e311Ce6Fbd1274B6CBe9',
    'TIGER-USDC-LP': '0x3cDA4fE281230B58935b24fB74B4177668b74F18',
    'BEAR-WBTC-LP': '0x59F6b8e4FcB4089b8b9C9A1a42104B7c6C77B8A4',
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
    '0x398046624dF74d5038F2Fae49fDFC8d6bedC74f3', //Tiger
  ],
  rewardPool,
  masonry: [
    '0x1810F07671fFF4D03110Ec3bA9B3C8E88D88Ed89',
  ],
  chain: 'kava',
  useDefaultCoreAssets: true,
  misrepresentedTokens: true
})
