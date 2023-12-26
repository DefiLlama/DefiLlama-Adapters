const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { eulerTokens } = require('../helper/tokenMapping')
const { getLogs } = require('../helper/cache/getLogs')
const BigNumber = require("bignumber.js");

const contracts = {
  ethereum: {
    v1: [
      '0xC8E6CA6E96a326dC448307A5fDE90a0b21fd7f80', // idleWETHYield
      '0x5C960a3DCC01BE8a0f49c02A8ceBCAcf5D07fABe', // idleRAIYield
      '0xb2d5CB72A621493fe83C6885E4A776279be595bC', // idleFEIYield
      '0x3fe7940616e5bc47b0775a0dccf6237893353bb4', // idleDAIYield
      '0x5274891bEC421B39D23760c04A6755eCB444797C', // idleUSDCYield
      '0xF34842d05A1c888Ca02769A633DF37177415C2f8', // idleUSDTYield
      '0xf52cdcd458bf455aed77751743180ec4a595fd3f', // idleSUSDYield
      '0xc278041fDD8249FE4c1Aad1193876857EEa3D68c', // idleTUSDYield
      '0x8C81121B15197fA0eEaEE1DC75533419DcfD3151', // idleWBTCYield
      '0xDc7777C771a6e4B3A82830781bDDe4DBC78f320e', // idleUSDCBB
      '0xfa3AfC9a194BaBD56e743fA3b7aA2CcbED3eAaad' // idleUSDTBB
    ],
    v3: [
      '0x78751b12da02728f467a44eac40f5cbc16bd7934', // idleDAIYieldV3
      '0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6', // idleUSDCYieldV3
      '0x63D27B3DA94A9E871222CB0A32232674B02D2f2D', // idleUSDTYieldV3
      '0xe79e177d2a5c7085027d7c64c8f271c81430fc9b', // idleSUSDYieldV3
      '0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1', // idleTUSDYieldV3
      '0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55', // idleWBTCYieldV3
      '0x1846bdfDB6A0f5c473dEc610144513bd071999fB', // idleDAISafeV3
      '0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C', // idleUSDCSafeV3
      '0x42740698959761baf1b06baa51efbd88cb1d862b', // idleUSDTSafeV3
    ],
    safe: [
      '0x28fAc5334C9f7262b3A3Fe707e250E01053e07b5', // idleUSDTSafe
      '0x3391bc034f2935ef0e1e41619445f998b2680d35', // idleUSDCSafe
      '0xa14ea0e11121e6e951e87c66afe460a00bcd6a16', // idleDAISafe
    ],
    cdos: [
      "0xF87ec7e1Ee467d7d78862089B92dd40497cBa5B8", // MATIC
      "0xDcE26B2c78609b983cF91cCcD43E238353653b0E", // IdleCDO_clearpool_DAI
      // "0xd0DbcD556cA22d3f3c142e9a3220053FD7a247BC",
      // "0x1f5A97fB665e295303D2F7215bA2160cc5313c8E", // 
      "0x8E0A8A5c1e5B3ac0670Ea5a613bB15724D51Fc37" // Instadapp stETH
    ]
  },
  polygon: {
    v1: [
      "0x8a999F5A3546F8243205b2c0eCb0627cC10003ab", // idleDAIYield
      "0x1ee6470CD75D5686d0b2b90C0305Fa46fb0C89A1", // idleUSDCYield
      "0xfdA25D931258Df948ffecb66b5518299Df6527C4" // idleWETHYield
    ]
  },
  polygon_zkevm: {
    cdos: [
      "0x6b8A1e78Ac707F9b0b5eB4f34B02D9af84D2b689" // IdleCDO_clearpool_portofino_USDT
    ]
  },
  optimism: {
    
  }
}

const trancheConfig = {
  ethereum: {
    factory: '0x3c9916bb9498f637e2fa86c2028e26275dc9a631',
    fromBlock: 13244388,
  },
  polygon_zkevm: {
    factory: '0xba43DE746840eD16eE53D26af0675d8E6c24FE38',
    fromBlock: 2812767,
  },
  optimism: {
    factory: '0x8aA1379e46A8C1e9B7BB2160254813316b5F35B8',
    fromBlock: 110449062,
  }
}
const getCurrentAllocationsABI = 'function getCurrentAllocations() returns (address[] tokenAddresses,  uint256[] amounts,  uint256 total)'

async function tvl(time, ethBlock, chainBlocks, { api }) {
  const { v1 = [], v3 = [], safe = [], cdos = [] } = contracts[api.chain]
  const balances = {}
  const ownerTokens = []

  const [tokenAllocations, allTokens, token, tokenV3, tokenSafe, allocations] = await Promise.all([
    api.multiCall({ abi: getCurrentAllocationsABI, calls: v3 }),
    api.multiCall({ abi: 'address[]:getAllAvailableTokens', calls: v1 }),
    api.multiCall({ abi: 'address:token', calls: v1 }),
    api.multiCall({ abi: 'address:token', calls: v3 }),
    api.multiCall({ abi: 'address:token', calls: safe }),
    api.multiCall({ abi: 'uint256[]:getAllocations', calls: safe }),
  ])

  const calls = allocations.map((allo, i) => allo.map((_, j) => ({ target: safe[i], params: [j] }))).flat()
  const aSafeTokens = await api.multiCall({ abi: 'function allAvailableTokens(uint256) view returns (address)', calls })
  aSafeTokens.forEach((v, i) => ownerTokens.push([[v], calls[i].target]))
  tokenSafe.forEach((v, i) => ownerTokens.push([[v], safe[i]]))

  // Load tokens decimals
  const callsDecimals = token.map( t => ({ target: t, params: [] }) )
  const decimalsResults = await api.multiCall({abi: 'erc20:decimals', calls: callsDecimals})
  const tokensDecimals = decimalsResults.reduce( (tokensDecimals, decimals, i) => {
    const call = callsDecimals[i]
    tokensDecimals[call.target] = decimals
    return tokensDecimals
  }, {})

  const trancheTokensMapping = {}
  const blacklistedTokens = [...eulerTokens]

  const { factory, fromBlock } = trancheConfig[api.chain] ?? {}
  if (factory) {
    const logs = await getLogs({
      api,
      target: factory,
      topics: ['0xcfed305fd6d1aebca7d8ef4978868c2fe10910ee8dd94c3be048a9591f37429f'],
      eventAbi: 'event CDODeployed(address proxy)',
      onlyArgs: true,
      fromBlock,
    })
    cdos.push(...logs.map(i => i.proxy))

    const [strategyToken, token, aatrances, bbtrances, aaprices, bbprices] = await Promise.all(['address:strategyToken', "address:token", "address:AATranche", "address:BBTranche", "uint256:priceAA", "uint256:priceBB"].map(abi => api.multiCall({ abi, calls: cdos })))
    blacklistedTokens.push(...cdos)
    blacklistedTokens.push(...aatrances)
    blacklistedTokens.push(...bbtrances)

    // Get CDOs contract values
    const contractValue = await api.multiCall({ abi: 'uint256:getContractValue', calls: cdos })
    cdos.forEach((cdo, i) => {
      const tokenDecimals = tokensDecimals[token[i]] || 18
      trancheTokensMapping[aatrances[i]] = {
        token: token[i],
        decimals: tokenDecimals,
        price: BigNumber(aaprices[i]).div(`1e${tokenDecimals}`).toFixed()
      }
      trancheTokensMapping[bbtrances[i]] = {
        token: token[i],
        decimals: tokenDecimals,
        price: BigNumber(bbprices[i]).div(`1e${tokenDecimals}`).toFixed()
      }

      // Get CDOs underlying tokens balances
      sdk.util.sumSingleBalance(balances, token[i], contractValue[i], api.chain)
    })
  }

  const trancheTokensBalancesCalls = []

  allTokens.forEach((tokens, i) => {
    tokens.push(token[i])
    const blackListedTrancheTokens = tokens.filter( blacklistedToken => blacklistedTokens.includes(blacklistedToken) && trancheTokensMapping[blacklistedToken] ).forEach( trancheToken => {
      trancheTokensBalancesCalls.push({ target: trancheToken, params: [v1[i]] })
    })
    ownerTokens.push([tokens, v1[i]])
  })

  tokenAllocations.forEach((tokens, i) => {
    tokens.tokenAddresses.push(tokenV3[i])
    ownerTokens.push([tokens.tokenAddresses, v3[i]])
  })

  // Process tranche tokens BY balances
  if (trancheTokensBalancesCalls.length){
    const trancheTokensBalancesResults = await api.multiCall({ abi: 'erc20:balanceOf', calls: trancheTokensBalancesCalls })
    trancheTokensBalancesResults.forEach( (trancheTokenBalance, i) => {
      const trancheToken = trancheTokensBalancesCalls[i].target
      const decimals = trancheTokensMapping[trancheToken].decimals
      const trancheTokenPrice = trancheTokensMapping[trancheToken].price || 1
      const underlyingToken = trancheTokensMapping[trancheToken].token
      const underlyingTokenBalance = BigNumber(trancheTokenBalance || 0).times(trancheTokenPrice).div(`1e18`).times(`1e${decimals}`).toFixed(0)
      balances[underlyingToken] = BigNumber(balances[underlyingToken] || 0).plus(underlyingTokenBalance)
    })
  }

  return sumTokens2({ api, balances, ownerTokens, blacklistedTokens, })
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-03-13') / 1e3), 'Euler was hacked'],
  ],
};

Object.keys(contracts).forEach(chain => {
  module.exports[chain] = { tvl }
})