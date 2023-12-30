const { getLogs } = require('../helper/cache/getLogs')
const { BigNumber, constants } = require('ethers')
const { getBlock } = require('../helper/http')

const GmxkeyToken = '0xc5369c88440AB1FC842bCc60d3d087Bd459f20e4'
const EsGmxkeyToken = '0x3a924611895F8484194C9a791fceFb6fC07ddb85'
const MpkeyToken = '0x40a03B30D0c4D9e5E71164e041EC28CEe6dD9b36'
const GMXkeyGmxMarket = '0xC2e764eBEa35F079b03522D8C9cf7394De4EE15e'
const EsGMXkeyGmxMarket = '0x48dFF3e21843C2A81a4C5CE55535Ac444B55bDbf'
const MPkeyGmxMarket = '0x09861D732Af36Ee33490A09f24A0a3Cb06e035c1'
const UniswapGmxEthPool = '0x80A9ae39310abf666A87C743d6ebBD0E8C42158E'

function getMarketPrice(api, fromBlock) {
  return async (market, defaultPrice) => {
    const logs = await getLogs({
      api,
      target: market,
      topic: 'TakeOrder(address,uint256,address,address,address,uint256,uint256,uint256,bool,uint256)',
      eventAbi: 'event TakeOrder(address indexed account, uint256 indexed orderId, address indexed maker, address token, address currency, uint256 price, uint256 amount, uint256 filled, bool bidAsk, uint256 timestamp)',
      onlyArgs: true,
      skipCache: true,
      fromBlock,
    })
  
    const targetLogs = logs
      .map(({ timestamp, price }) => ({ timestamp, price }))
      .sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
      .slice(0, 5)
  
    const sum = targetLogs.reduce((prev, curr) => {
      return prev.add(curr.price)
    }, constants.Zero)
  
    if (sum.eq(constants.Zero)) {
      return defaultPrice
    }
  
    return sum.div(targetLogs.length).toNumber() / 10**4
  }
}

function getTvl(gmxPrice, tokenPrice, totalSupply){
  const tokenSupply = totalSupply / 10**18
  return gmxPrice * tokenPrice * tokenSupply
}

async function getGmxPrice(slot0) {
  const priceSqrt = BigNumber.from(slot0[0])
  const gmxPriceInEth = priceSqrt.pow(2).mul(1000).div(BigNumber.from(2).pow(192)).toNumber() / 1000

  return 1 / gmxPriceInEth
}

async function tvl(timestamp, _, chainBlocks, { api }) {
  const fromBlock = await getBlock(timestamp - (48 * 60 * 60), 'arbitrum', chainBlocks)

  const slot0 = await api.call({
    abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
    target: UniswapGmxEthPool,
  })

  const [totalSupplyOfGmxkey, totalSupplyOfEsGmxkey, totalSupplyOfMpkey] = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: [GmxkeyToken, EsGmxkeyToken, MpkeyToken],
  })

  const gmxPrice = await getGmxPrice(slot0)

  const marketPrice = getMarketPrice(api, fromBlock)

  const gmxkeyPrice = await marketPrice(GMXkeyGmxMarket, 0.95)
  const gmxkeyTvl = getTvl(gmxPrice, gmxkeyPrice, totalSupplyOfGmxkey)

  const esGmxkeyPrice = await marketPrice(EsGMXkeyGmxMarket, 0.5)
  const esGmxkeyTvl = getTvl(gmxPrice, esGmxkeyPrice, totalSupplyOfEsGmxkey)

  const mpkeyPrice = await marketPrice(MPkeyGmxMarket, 0.1)
  const mpkeyTvl = getTvl(gmxPrice, mpkeyPrice, totalSupplyOfMpkey)

  return { 
    ethereum: gmxkeyTvl + esGmxkeyTvl + mpkeyTvl,
  }
}

module.exports = {
  arbitrum: {
    tvl,
  }
}
