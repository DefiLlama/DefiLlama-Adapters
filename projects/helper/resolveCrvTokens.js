
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')

const curvePoolsPartial = require('../convex/pools-crv')
const abi = require('../concentrator/abis/abi.json')
const AladdinCRVABI = require('../concentrator/abis/AladdinCRV.json')
const crvPools = require('./curvePools')

const replacements = [
  '0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc',
  '0x9777d7E2b60bB01759D0E2f8be2095df444cb07E',
  '0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59',
  '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01',
  '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e',
  '0x83f798e925BcD4017Eb265844FDDAbb448f1707D',
  '0x73a052500105205d34Daf004eAb301916DA8190f'
]

const curvePools = [
  {
    assets: 'Curve.fi Factory USD Metapool: moUSD',
    isLendingPool: true,
    coins: ['0x60d55f02a771d515e077c9c2403a1ef324885cec', '0x27f8d03b3a2196956ed754badc28d73be8830a6e', '0x1a13f4ca1d028320a707d99520abfefca3998b7f'],
    addresses: {
      swap: '0x445fe580ef8d70ff569ab36e80c647af338db351',
      lpToken: '0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171',
      gauge: '0x19793b454d3afc7b454f206ffe95ade26ca6912c',
    },
  }
]

const gaugeLPMapping = {}

Object.keys(crvPools).forEach(key => crvPools[key.toLowerCase()] = crvPools[key])

const curveLPMapping = [...curvePoolsPartial, ...curvePools].reduce((accum, poolData) => {
  accum[poolData.addresses.lpToken.toLowerCase()] = poolData
  if (poolData.addresses.gauge) {
    const gaugeToken = poolData.addresses.gauge.toLowerCase()
    gaugeLPMapping[gaugeToken] = poolData.addresses.lpToken
    accum[gaugeToken] = poolData
  }
  return accum
}, {})


async function unwrapCrvKnown(balances, crvToken, lpBalance, block, chain = 'ethereum', transformAddress = (addr) => addr, excludeTokensRaw = []) {
  crvToken = stripChainHeader(crvToken).toLowerCase()
  const excludeTokens = excludeTokensRaw.map(addr => addr.toLowerCase())
  if (crvPools[crvToken] === undefined)
    return;

  const crvSwapContract = crvPools[crvToken].swapContract
  const underlyingTokens = crvPools[crvToken].underlyingTokens
  const crvTotalSupply = sdk.api.erc20.totalSupply({
    target: crvToken,
    block,
    chain
  })
  const underlyingSwapTokens = (await sdk.api.abi.multiCall({
    calls: underlyingTokens.map(token => ({
      target: token,
      params: [crvSwapContract]
    })),
    block,
    chain,
    abi: 'erc20:balanceOf'
  })).output

  // steth and seth case where balanceOf not applicable on ETH balance
  if (crvToken.toLowerCase() === '0x06325440d014e39736583c165c2963ba99faf14e' || crvToken.toLowerCase() === '0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c') {
    underlyingSwapTokens[0].output = underlyingSwapTokens[0].output * 2
  }

  const resolvedCrvTotalSupply = (await crvTotalSupply).output
  underlyingSwapTokens.forEach(call => {
    if (excludeTokens.includes(call.input.target.toLowerCase())) return;
    const underlyingBalance = BigNumber(call.output).times(lpBalance).div(resolvedCrvTotalSupply)
    sdk.util.sumSingleBalance(balances, transformAddress(call.input.target), underlyingBalance.toFixed(0))
  })
}

const cGaugeMapping = {
  avax: {
    '0x5b5cfe992adac0c9d48e05854b2d91c73a003858': '0x1337BedC9D22ecbe766dF105c9623922A27963EC',
  },
  polygon: {
    '0x19793b454d3afc7b454f206ffe95ade26ca6912c': '0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171',
  }
}
Object.values(cGaugeMapping).forEach(mapping => Object.keys(mapping).forEach(key => mapping[key.toLowerCase()] = mapping[key]))

async function unwrapCrv(balances, crvToken, lpBalance, block, chain = 'ethereum', transformAddress = (addr) => addr) {
  crvToken = stripChainHeader(crvToken).toLowerCase()
  const gaugeMap = cGaugeMapping[chain] || {}
  if (gaugeMap[crvToken]) crvToken = gaugeMap[crvToken]

  if (crvPools[crvToken]) return unwrapCrvKnown(...arguments)

  const poolData = curveLPMapping[crvToken]

  if (!poolData) return balances
  const swapAddress = poolData.addresses.swap

  const coinCalls = [...Array(Number(poolData.coins.length)).keys()].map(num => {
    return {
      target: swapAddress,
      params: [num]
    }
  })

  const coinsUint = sdk.api.abi.multiCall({
    abi: abi.coinsUint,
    calls: coinCalls,
    block, chain,
  })

  const coinsInt = sdk.api.abi.multiCall({
    abi: abi.coinsInt,
    calls: coinCalls,
    block, chain,
  })

  let coins = await coinsUint
  if (!coins.output[0].success) {
    coins = await coinsInt
  }
  const coinBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: coins.output.map(coin => ({
      target: coin.output,
      params: [swapAddress]
    })),
    block, chain,
  })
  const totalSupply = (await sdk.api.abi.call({
    target: gaugeLPMapping[crvToken] ? gaugeLPMapping[crvToken] : crvToken,
    block,
    chain,
    abi: AladdinCRVABI.totalSupply,
    params: []
  })).output

  await Promise.all(coinBalances.output.map(async (coinBalance, index) => {
    let coinAddress = coins.output[index].output
    if (replacements.includes(coinAddress)) {
      coinAddress = '0x6b175474e89094c44da98b954eedeac495271d0f' // dai
    }
    if (coinBalance.input.target === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      coinBalance = await sdk.api.eth.getBalance({
        target: coinBalance.input.params[0],
        block, chain,
      })
      coinAddress = '0x0000000000000000000000000000000000000000'
    }

    const balance = BigNumber(lpBalance).times(coinBalance.output).div(totalSupply)
    if (!balance.isZero()) {
      sdk.util.sumSingleBalance(balances, transformAddress(coinAddress), balance.toFixed(0))
    }
  }))

  return balances
}

function stripChainHeader(token) {
  return token.indexOf(':') > -1 ? token.split(':')[1] : token
}


function getCrvTokens(balances) {
  return Object.keys(balances)
    .filter(isCrvToken)
    .map(token => ({ token, balance: balances[token] }))

  function isCrvToken(token) {
    token = stripChainHeader(token).toLowerCase()
    return crvPools[token] || curveLPMapping[token]
  }
}

async function resolveCrvTokens(balances, block, chain = 'ethereum', transformAddress = (addr) => addr) {
  let crvTokens = getCrvTokens(balances)
  let count = 0
  while (crvTokens.length && count < 6) {
    crvTokens.forEach(({ token }) => delete balances[token])
    await Promise.all(crvTokens.map(({ token, balance }) =>
      unwrapCrv(balances, token, balance, block, chain, transformAddress)))
    crvTokens = getCrvTokens(balances)
    count++
  }

  if (crvTokens.length)
    console.log('unresolved crv tokens:', crvTokens)
  return balances
}

module.exports = {
  unwrapCrv,
  resolveCrvTokens,
}