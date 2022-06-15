const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const token0 = require('./abis/token0.json')
const symbol = require('./abis/symbol.json')
const { getPoolTokens, getPoolId } = require('./abis/balancer.json')
const getPricePerShare = require('./abis/getPricePerShare.json')
const { requery } = require('./requery')
const { getChainTransform, getFixBalances } = require('./portedTokens')
const creamAbi = require('./abis/cream.json')
const { unwrapCrv, resolveCrvTokens } = require('./resolveCrvTokens')
const activePoolAbi = require('./ankr/abis/activePool.json')
const wethAddressAbi = require('./ankr/abis/wethAddress.json');
const { isLP, DEBUG_MODE, getUniqueAddresses, } = require('./utils')
const wildCreditABI = require('../wildcredit/abi.json')

const yearnVaults = {
  // yvToken: underlying, eg yvYFI:YFI
  // ycDAI
  "0x99d1fa417f94dcd62bfe781a1213c092a47041bc": "0x6b175474e89094c44da98b954eedeac495271d0f",
  // ycUSDC
  "0x9777d7e2b60bb01759d0e2f8be2095df444cb07e": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // ycUSDT
  "0x1be5d71f2da660bfdee8012ddc58d024448a0a59": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // yDAI 
  "0xc2cb1040220768554cf699b0d863a3cd4324ce32": "0x6b175474e89094c44da98b954eedeac495271d0f",
  // yUSDT
  "0xe6354ed5bc4b393a5aad09f21c46e101e692d447": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // yUSDC
  "0xd6ad7a6750a7593e092a9b218d66c0a814a3436e": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // yUSDT
  "0x83f798e925bcd4017eb265844fddabb448f1707d": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // yvYFI v2
  "0xe14d13d8b3b85af791b2aadd661cdbd5e6097db1": "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
  // yvWETH v2
  "0xa258c4606ca8206d8aa700ce2143d7db854d168c": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  // yvWETH v1
  "0xa9fe4601811213c340e850ea305481aff02f5b28": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  // yvUSDT v2
  "0x7da96a3891add058ada2e826306d812c638d87a7": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // yvUSDC v2
  "0x5f18c75abdae578b483e5f43f12a39cf75b973a9": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // yvUSDC
  "0xa354f35829ae975e850e23e9615b11da1b3dc4de": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // yvWBTC
  "0xa696a63cc78dffa1a63e9e50587c197387ff6c7e": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  // yv1INCH
  "0xb8c3b7a2a618c552c23b1e4701109a9e756bab67": "0x111111111117dc0aa78b770fa6a738034120c302",
  // yvDAI
  "0x19d3364a399d251e894ac732651be8b0e4e85001": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  // yvDAI
  "0xacd43e627e64355f1861cec6d3a6688b31a6f952": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  // yvDAI
  "0xda816459f1ab5631232fe5e97a05bbbb94970c95": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  // yvDAI
  "0x16de59092dae5ccf4a1e6439d611fd0653f0bd01": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  // yvSNX
  "0xf29ae508698bdef169b89834f76704c3b205aedf": "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
  // yvUNI
  "0xfbeb78a723b8087fd2ea7ef1afec93d35e8bed42": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  // yvLINK
  "0x671a912c10bba0cfa74cfc2d6fba9ba1ed9530b2": "0x514910771af9ca656af840dff83e8264ecf986ca",
  // yvCurve Aave 3pool
  "0x39caf13a104ff567f71fd2a4c68c026fdb6e740b": "0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900",
  // yvcrvSTETH
  "0xdcd90c7f6324cfa40d7169ef80b12031770b4325": "0x06325440d014e39736583c165c2963ba99faf14e",
  // yvcrvIB
  "0x27b7b1ad7288079a66d12350c828d3c00a6f07d7": "0x5282a4ef67d9c33135340fb3289cc1711c13638c",
  // yvYFI FTM
  "0x2c850cced00ce2b14aa9d658b7cad5df659493db": "0x29b0Da86e484E1C0029B56e817912d778aC0EC69",
  // yvDAI FTM
  "0x637ec617c86d24e421328e6caea1d92114892439": "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
  // yvETH FTM
  "0xce2fc0bdc18bd6a4d9a725791a3dee33f3a23bb7": "0x74b23882a30290451A17c44f4F05243b6b58C76d",
  // yvWBTC FTM
  "0xd817a100ab8a29fe3dbd925c2eb489d67f758da9": "0x321162Cd933E2Be498Cd2267a90534A804051b11",
  // yvMIM FTM
  "0x0a0b23d9786963de69cb2447dc125c49929419d8": "0x82f0b8b456c1a451378467398982d4834b6829c1",
  // yvUSDC FTM
  "0xef0210eb96c7eb36af8ed1c20306462764935607": "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
  // yvWFTM FTM
  "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
  // yvUSDT FTM
  "0x148c05caf1bb09b5670f00d511718f733c54bc4c": "0x049d68029688eAbF473097a2fC38ef61633A3C7A"
}
async function unwrapYearn(balances, yToken, block, chain = "ethereum", transformAddress = (addr) => addr) {
  const underlying = yearnVaults[yToken.toLowerCase()];
  if (!underlying) return;

  const tokenKey = chain == 'ethereum' ? yToken : `${chain}:${yToken}`
  if (!balances[tokenKey]) return;

  let pricePerShare
  let decimals
  try {
    pricePerShare = await sdk.api.abi.call({
      target: yToken,
      abi: getPricePerShare[1],
      block: block,
      chain: chain
    });
    decimals = (await sdk.api.erc20.decimals(underlying, chain)).output
  } catch (e) {
    console.log('Failing to get price per share for %s, trying getPricePerFullShare', yToken)
  }
  if (pricePerShare == undefined) {
    pricePerShare = await sdk.api.abi.call({
      target: yToken,
      abi: getPricePerShare[0],
      block: block,
      chain: chain
    });
    decimals = 18
  };

  const newBalance = BigNumber(balances[tokenKey]).times(pricePerShare.output).div(10 ** decimals)
  const oldBalance = BigNumber(balances[transformAddress(underlying)] || 0)
  balances[transformAddress(underlying)] = oldBalance.plus(newBalance).toFixed(0)
  delete balances[tokenKey];
};

const lpReservesAbi = { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }
const lpSuppliesAbi = { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }
const token0Abi = { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }
const token1Abi = { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }

/* lpPositions:{
    balance,
    token
}[]
*/
async function unwrapUniswapLPs(balances, lpPositions, block, chain = 'ethereum', transformAddress = (addr) => addr, excludeTokensRaw = [], retry = false, uni_type = 'standard',) {
  const excludeTokens = excludeTokensRaw.map(addr => addr.toLowerCase())
  const lpTokenCalls = lpPositions.map(lpPosition => ({
    target: lpPosition.token
  }))
  const lpReserves = sdk.api.abi.multiCall({
    block,
    abi: lpReservesAbi,
    calls: lpTokenCalls,
    chain
  })
  const lpSupplies = sdk.api.abi.multiCall({
    block,
    abi: lpSuppliesAbi,
    calls: lpTokenCalls,
    chain
  })
  const tokens0 = sdk.api.abi.multiCall({
    block,
    abi: token0Abi,
    calls: lpTokenCalls,
    chain
  })
  const tokens1 = sdk.api.abi.multiCall({
    block,
    abi: token1Abi,
    calls: lpTokenCalls,
    chain
  })
  if (retry) {
    await Promise.all([
      [lpReserves, lpReservesAbi],
      [lpSupplies, lpSuppliesAbi],
      [tokens0, token0Abi],
      [tokens1, token1Abi]
    ].map(async call => {
      await requery(await call[0], chain, block, call[1])
    }))
  }
  await Promise.all(lpPositions.map(async lpPosition => {
    try {
      let token0, token1, supply
      const lpToken = lpPosition.token
      const token0_ = (await tokens0).output.find(call => call.input.target === lpToken)
      const token1_ = (await tokens1).output.find(call => call.input.target === lpToken)
      const supply_ = (await lpSupplies).output.find(call => call.input.target === lpToken)

      token0 = token0_.output.toLowerCase()
      token1 = token1_.output.toLowerCase()
      supply = supply_.output
      // console.log(token0_, supply_, token1_, lpToken)

      if (supply === "0") {
        return
      }

      let _reserve0, _reserve1
      if (uni_type === 'standard') {
        ({ _reserve0, _reserve1 } = (await lpReserves).output.find(call => call.input.target === lpToken).output)
      }
      else if (uni_type === 'gelato') {
        const gelatoPools = sdk.api.abi.multiCall({
          block,
          abi: gelatoPoolsAbi,
          calls: lpTokenCalls,
          chain
        });
        const gelatoPool = (await gelatoPools).output.find(call => call.input.target === lpToken).output
        const [{ output: _reserve0_ }, { output: _reserve1_ }] = (await Promise.all([
          sdk.api.erc20.balanceOf({
            target: token0,
            owner: gelatoPool,
            block,
            chain
          })
          , sdk.api.erc20.balanceOf({
            target: token1,
            owner: gelatoPool,
            block,
            chain
          })
        ]))
        _reserve0 = _reserve0_
        _reserve1 = _reserve1_
      }

      if (!excludeTokens.includes(token0)) {
        const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply))
        sdk.util.sumSingleBalance(balances, await transformAddress(token0), token0Balance.toFixed(0))
      }
      if (!excludeTokens.includes(token1)) {
        const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply))
        sdk.util.sumSingleBalance(balances, await transformAddress(token1), token1Balance.toFixed(0))
      }
    } catch (e) {
      if (DEBUG_MODE) console.error(e)
      console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
      throw e
    }
  }))
}


// Mostly similar to unwrapGelatoLPs with only edits being gelatoToken0ABI, same for token1 and balances of tokens which are actually held by the contract which address is given by the read pool method
/* lpPositions:{
    balance,
    token
}[]
*/
const gelatoPoolsAbi = { "inputs": [], "name": "pool", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }

async function unwrapGelatoLPs(balances, lpPositions, block, chain = 'ethereum', transformAddress = (addr) => addr, excludeTokensRaw = [], retry = false) {
  const excludeTokens = excludeTokensRaw.map(addr => addr.toLowerCase())
  const lpTokenCalls = lpPositions.map(lpPosition => ({
    target: lpPosition.token
  }))
  const lpReserves = sdk.api.abi.multiCall({
    block,
    abi: lpReservesAbi,
    calls: lpTokenCalls,
    chain
  })
  const lpSupplies = sdk.api.abi.multiCall({
    block,
    abi: lpSuppliesAbi,
    calls: lpTokenCalls,
    chain
  })
  const tokens0 = sdk.api.abi.multiCall({
    block,
    abi: token0Abi,
    calls: lpTokenCalls,
    chain
  })
  const tokens1 = sdk.api.abi.multiCall({
    block,
    abi: token1Abi,
    calls: lpTokenCalls,
    chain
  })

  // Different bit
  if (retry) {
    await Promise.all([
      [lpReserves, lpReservesAbi],
      [lpSupplies, lpSuppliesAbi],
      [tokens0, token0Abi],
      [tokens1, token1Abi]
    ].map(async call => {
      await requery(await call[0], chain, block, call[1])
    }))
  }
  await Promise.all(lpPositions.map(async lpPosition => {
    try {
      const lpToken = lpPosition.token
      const token0 = (await tokens0).output.find(call => call.input.target === lpToken).output.toLowerCase()
      const token1 = (await tokens1).output.find(call => call.input.target === lpToken).output.toLowerCase()
      const supply = (await lpSupplies).output.find(call => call.input.target === lpToken).output

      // Different bits
      const gelatoPool = (await gelatoPools).output.find(call => call.input.target === lpToken).output
      const [{ output: _reserve0 }, { output: _reserve1 }] = (await Promise.all([
        sdk.api.erc20.balanceOf({
          target: token0,
          owner: gelatoPool,
          block,
          chain
        })
        , sdk.api.erc20.balanceOf({
          target: token1,
          owner: gelatoPool,
          block,
          chain
        })
      ]))

      if (!excludeTokens.includes(token0)) {
        const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply))
        sdk.util.sumSingleBalance(balances, await transformAddress(token0), token0Balance.toFixed(0))
      }
      if (!excludeTokens.includes(token1)) {
        const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply))
        sdk.util.sumSingleBalance(balances, await transformAddress(token1), token1Balance.toFixed(0))
      }
    } catch (e) {
      console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
      throw e
    }
  }))
}

// Unwrap the tokens that are LPs and directly add the others
// To be used when you don't know which tokens are LPs and which are not
async function addTokensAndLPs(balances, tokens, amounts, block, chain = "ethereum", transformAddress = id => id) {
  const tokens0 = await sdk.api.abi.multiCall({
    calls: tokens.output.map(t => ({
      target: t.output
    })),
    abi: token0,
    block,
    chain
  })
  const lpBalances = []
  tokens0.output.forEach((result, idx) => {
    const token = tokens.output[idx].output
    const balance = amounts.output[idx].output
    if (result.success) {
      lpBalances.push({
        token,
        balance
      })
    } else {
      sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
    }
  })
  await unwrapUniswapLPs(balances, lpBalances, block, chain, transformAddress)
}

/*
tokens [
    [token, isLP] - eg ["0xaaa", true]
]
*/
async function sumTokensAndLPsSharedOwners(balances, tokens, owners, block, chain = "ethereum", transformAddress = id => id) {
  const balanceOfTokens = await sdk.api.abi.multiCall({
    calls: tokens.map(t => owners.map(o => ({
      target: t[0],
      params: o
    }))).flat(),
    abi: 'erc20:balanceOf',
    block,
    chain
  })
  await requery(balanceOfTokens, chain, block, 'erc20:balanceOf')
  const isLP = {}
  tokens.forEach(token => {
    isLP[token[0].toLowerCase()] = token[1]
  })
  const lpBalances = []
  balanceOfTokens.output.forEach((result, idx) => {
    const token = result.input.target.toLowerCase()
    const balance = result.output
    if (isLP[token] === true) {
      lpBalances.push({
        token,
        balance
      })
    } else {
      sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
    }
  })
  if (lpBalances.length > 0) {
    await unwrapUniswapLPs(balances, lpBalances, block, chain, transformAddress)
  }
}

async function sumTokensSharedOwners(balances, tokens, owners, block, chain = "ethereum", transformAddress) {
  if (transformAddress === undefined) {
    transformAddress = addr => `${chain}:${addr}`
  }
  await sumTokensAndLPsSharedOwners(balances, tokens.map(t => [t, false]), owners, block, chain, transformAddress)
}

async function sumLPWithOnlyOneToken(balances, lpToken, owner, listedToken, block, chain = "ethereum", transformAddress = id => id) {
  const [balanceOfLP, balanceOfTokenListedInLP, lpSupply] = await Promise.all([
    sdk.api.erc20.balanceOf({
      target: lpToken,
      owner,
      block,
      chain
    }),
    sdk.api.erc20.balanceOf({
      target: listedToken,
      owner: lpToken,
      block,
      chain
    }),
    sdk.api.erc20.totalSupply({
      target: lpToken,
      block,
      chain
    }),
  ])
  sdk.util.sumSingleBalance(balances, transformAddress(listedToken),
    BigNumber(balanceOfLP.output).times(balanceOfTokenListedInLP.output).div(lpSupply.output).times(2).toFixed(0)
  )
}

async function sumLPWithOnlyOneTokenOtherThanKnown(balances, lpToken, owner, tokenNotToUse, block, chain = "ethereum", transformAddress = id => id) {
  const [token0, token1] = await Promise.all([token0Abi, token1Abi]
    .map(abi => sdk.api.abi.call({
      target: lpToken,
      abi,
      chain,
      block
    }).then(o => o.output))
  )
  let listedToken = token0
  if (tokenNotToUse.toLowerCase() === listedToken.toLowerCase()) {
    listedToken = token1
  }
  await sumLPWithOnlyOneToken(balances, lpToken, owner, listedToken, block, chain, transformAddress)
}
async function unwrapUniswapV3NFTs({ balances, nftsAndOwners, block, chain, transformAddress }) {
  await Promise.all(nftsAndOwners.map(([nftAddress, owner]) => unwrapUniswapV3NFT({ balances, owner, nftAddress, block, chain, transformAddress })))
  return balances
}

async function unwrapUniswapV3NFT({ balances, owner, nftAddress, block, chain = 'ethereum', transformAddress }) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  const nftPositions = (await sdk.api.erc20.balanceOf({ target: nftAddress, owner, block, chain })).output
  const factory = (await sdk.api.abi.call({ target: nftAddress, abi: wildCreditABI.factory, block, chain })).output

  const positionIds = (await sdk.api.abi.multiCall({
    block, chain, abi: wildCreditABI.tokenOfOwnerByIndex, target: nftAddress,
    calls: Array(Number(nftPositions)).fill(0).map((_, index) => ({ params: [owner, index] })),
  })).output.map(positionIdCall => positionIdCall.output)

  const positions = (await sdk.api.abi.multiCall({
    block, chain, abi: wildCreditABI.positions, target: nftAddress,
    calls: positionIds.map((position) => ({ params: [position] })),
  })).output.map(positionsCall => positionsCall.output)

  const lpInfo = {}
  positions.forEach(position => lpInfo[getKey(position)] = position)
  const lpInfoArray = Object.values(lpInfo)

  const poolInfos = (await sdk.api.abi.multiCall({
    block, chain, abi: wildCreditABI.getPool, target: factory,
    calls: lpInfoArray.map((info) => ({ params: [info.token0, info.token1, info.fee] })),
  })).output.map(positionsCall => positionsCall.output)

  const slot0 = await sdk.api.abi.multiCall({ block, chain, abi: wildCreditABI.slot0, calls: poolInfos.map(i => ({ target: i })) })

  slot0.output.forEach((slot, i) => lpInfoArray[i].tick = slot.output.tick)

  positions.map(addV3PositionBalances)
  return balances

  function getKey(position) {
    let { token0, token1, fee } = position
    token0 = token0.toLowerCase()
    token1 = token1.toLowerCase()
    return `${token0}-${token1}-${fee}`
  }

  function addV3PositionBalances(position) {
    const tickToPrice = (tick) => new BigNumber(1.0001 ** +tick)

    const token0 = position.token0
    const token1 = position.token1
    const liquidity = position.liquidity
    const bottomTick = position.tickLower
    const topTick = position.tickUpper
    const tick = lpInfo[getKey(position)].tick

    let amount0 = BigNumber(0)
    let amount1 = BigNumber(0)

    if (Number(tick) < Number(bottomTick)) {
      const sa = tickToPrice(new BigNumber(bottomTick).div(2).integerValue(BigNumber.ROUND_DOWN))
      const sb = tickToPrice(new BigNumber(topTick).div(2).integerValue(BigNumber.ROUND_DOWN))

      amount0 = new BigNumber(liquidity).times(new BigNumber(sb.minus(sa)).div(sa.times(sb))).integerValue(BigNumber.ROUND_DOWN)
    } else if (Number(tick) < Number(topTick)) {
      const sa = tickToPrice(Math.floor(+bottomTick / 2))
      const sb = tickToPrice(Math.floor(+topTick / 2))
      const price = tickToPrice(tick)
      const sp = price.squareRoot()

      amount0 = new BigNumber(liquidity).times(sb.minus(sp)).div(sp.times(sb)).integerValue(BigNumber.ROUND_DOWN)
      amount1 = new BigNumber(liquidity).times(sp.minus(sa)).integerValue(BigNumber.ROUND_DOWN)
    } else {
      const sa = tickToPrice(new BigNumber(bottomTick).div(2)).integerValue(BigNumber.ROUND_DOWN)
      const sb = tickToPrice(new BigNumber(topTick).div(2)).integerValue(BigNumber.ROUND_DOWN)

      amount1 = new BigNumber(liquidity).times(new BigNumber(sb.minus(sa))).integerValue(BigNumber.ROUND_DOWN)
    }

    sdk.util.sumSingleBalance(balances, transformAddress(token0), amount0.toFixed(0))
    sdk.util.sumSingleBalance(balances, transformAddress(token1), amount1.toFixed(0))
  }
}

/*
tokens [
    [token, owner, isLP] - eg ["0xaaa", "0xbbb", true]
]
*/
async function sumTokensAndLPs(balances, tokens, block, chain = "ethereum", transformAddress = id => id) {
  const balanceOfTokens = await sdk.api.abi.multiCall({
    calls: tokens.map(t => ({
      target: t[0],
      params: t[1]
    })),
    abi: 'erc20:balanceOf',
    block,
    chain
  })
  const lpBalances = []
  balanceOfTokens.output.forEach((result, idx) => {
    const token = result.input.target
    const balance = result.output
    if (tokens[idx][2]) {
      lpBalances.push({
        token,
        balance
      })
    } else {
      sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
    }
  })
  await unwrapUniswapLPs(balances, lpBalances, block, chain, transformAddress)
}

const balancerVault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
async function sumBalancerLps(balances, tokensAndOwners, block, chain, transformAddress) {
  const poolIds = sdk.api.abi.multiCall({
    calls: tokensAndOwners.map(t => ({
      target: t[0]
    })),
    abi: getPoolId,
    block,
    chain
  })
  const balancerPoolSupplies = sdk.api.abi.multiCall({
    calls: tokensAndOwners.map(t => ({
      target: t[0]
    })),
    abi: 'erc20:totalSupply',
    block,
    chain
  })
  const balanceOfTokens = sdk.api.abi.multiCall({
    calls: tokensAndOwners.map(t => ({
      target: t[0],
      params: t[1]
    })),
    abi: 'erc20:balanceOf',
    block,
    chain
  });
  const balancerPoolsPromise = sdk.api.abi.multiCall({
    calls: (await poolIds).output.map(o => ({
      target: balancerVault,
      params: o.output
    })),
    abi: getPoolTokens,
    block,
    chain
  })
  const [poolSupplies, tokenBalances, balancerPools] = await Promise.all([balancerPoolSupplies, balanceOfTokens, balancerPoolsPromise])
  tokenBalances.output.forEach((result, idx) => {
    const lpBalance = result.output
    const balancerPool = balancerPools.output[idx].output
    const supply = poolSupplies.output[idx].output
    balancerPool.tokens.forEach((token, tokenIndex) => {
      const tokensInPool = balancerPool.balances[tokenIndex]
      const underlyingBalance = BigNumber(tokensInPool).times(lpBalance).div(supply)
      sdk.util.sumSingleBalance(balances, transformAddress(token), underlyingBalance.toFixed(0));
    })
  })
}

const nullAddress = '0x0000000000000000000000000000000000000000'
/*
tokensAndOwners [
    [token, owner] - eg ["0xaaa", "0xbbb"]
]
*/
async function sumTokens(balances = {}, tokensAndOwners, block, chain = "ethereum", transformAddress, { resolveCrv = false, resolveLP = false, resolveYearn = false, unwrapAll = false, blacklistedLPs = [], } = {}) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  const ethBalanceInputs = []

  tokensAndOwners = tokensAndOwners.filter(i => {
    if (i[0] !== nullAddress)
      return true
    ethBalanceInputs.push(i[1])
    return false
  })

  if (ethBalanceInputs.length) {
    const { output: ethBalances } = await sdk.api.eth.getBalances({ targets: ethBalanceInputs, chain, block })
    ethBalances.forEach(({ balance }) => sdk.util.sumSingleBalance(balances, transformAddress(nullAddress), balance))
  }

  const balanceOfTokens = await sdk.api.abi.multiCall({
    calls: tokensAndOwners.map(t => ({
      target: t[0],
      params: t[1]
    })),
    abi: 'erc20:balanceOf',
    block,
    chain
  })
  balanceOfTokens.output.forEach((result, idx) => {
    const token = transformAddress(result.input.target)
    const balance = BigNumber(result.output)
    try {
      balances[token] = BigNumber(balances[token] || 0).plus(balance).toFixed(0)
    } catch (e) {
      console.log(token, balance, balances[token])
      throw e
    }
  })

  if (resolveLP || unwrapAll)
    await unwrapLPsAuto({ balances, block, chain, transformAddress, blacklistedLPs })

  if (resolveCrv || unwrapAll)
    await resolveCrvTokens(balances, block, chain, transformAddress)

  if (resolveYearn || unwrapAll) {
    await Promise.all(Object.keys(balances).map(token => unwrapYearn(balances, stripTokenHeader(token), block, chain, transformAddress)))
    await resolveCrvTokens(balances, block, chain, transformAddress)
  }

  if (['astar', 'harmony'].includes(chain)) {
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
  }

  return balances
}

async function unwrapCreamTokens(balances, tokensAndOwners, block, chain = "ethereum", transformAddress = id => id) {
  const [balanceOfTokens, exchangeRates, underlyingTokens] = await Promise.all([
    sdk.api.abi.multiCall({
      calls: tokensAndOwners.map(t => ({
        target: t[0],
        params: t[1]
      })),
      abi: 'erc20:balanceOf',
      block,
      chain
    }),
    sdk.api.abi.multiCall({
      calls: tokensAndOwners.map(t => ({
        target: t[0],
      })),
      abi: creamAbi.exchangeRateStored,
      block,
      chain
    }),
    sdk.api.abi.multiCall({
      calls: tokensAndOwners.map(t => ({
        target: t[0],
      })),
      abi: creamAbi.underlying,
      block,
      chain
    })
  ])
  balanceOfTokens.output.forEach((balanceCall, i) => {
    const underlying = underlyingTokens.output[i].output
    const balance = BigNumber(balanceCall.output).times(exchangeRates.output[i].output).div(1e18).toFixed(0)
    sdk.util.sumSingleBalance(balances, transformAddress(underlying), balance)
  })
}

const crv_abi = {
  "crvLP_coins": { "stateMutability": "view", "type": "function", "name": "coins", "inputs": [{ "name": "arg0", "type": "uint256" }], "outputs": [{ "name": "", "type": "address" }], "gas": 3123 }
}
async function genericUnwrapCrv(balances, crvToken, lpBalance, block, chain) {
  const { output: resolvedCrvTotalSupply } = await sdk.api.erc20.totalSupply({
    target: crvToken,
    chain, block
  })

  // Get Curve LP token balances
  // A while-loop would need a try-catch because sending error when idx > tokens_count
  const { output: crv_symbol } = await sdk.api.abi.call({
    abi: 'erc20:symbol',
    target: crvToken,
    chain,
    block
  })

  const LP_tokens_count = ['3Crv'].includes(crv_symbol) ? 3 : 2
  const coins_indices = Array.from(Array(LP_tokens_count).keys())
  const coins = (await sdk.api.abi.multiCall({
    abi: crv_abi['crvLP_coins'],
    calls: coins_indices.map(i => ({ params: [i] })),
    target: crvToken,
    chain,
    block
  })).output.map(c => c.output)
  const crvLP_token_balances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: coins.map(c => ({
      target: c,
      params: crvToken,
    })),
    chain,
    block
  })

  // Edit the balances to weigh with respect to the wallet holdings of the crv LP token
  crvLP_token_balances.output.forEach(call =>
    call.output = BigNumber(call.output).times(lpBalance).div(resolvedCrvTotalSupply).toFixed(0)
  )
  sdk.util.sumMultiBalanceOf(balances, crvLP_token_balances);
}

const cvx_abi = {
  "cvxBRP_pid": { "inputs": [], "name": "pid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  "cvxBRP_balanceOf": { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  "cvxBRP_earned": { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "earned", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  "cvxBRP_rewards": { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "rewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  "cvxBRP_userRewardPerTokenPaid": { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userRewardPerTokenPaid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  "cvxBRP_stakingToken": { "inputs": [], "name": "stakingToken", "outputs": [{ "internalType": "address", "name": "stakingToken", "type": "address" }], "stateMutability": "view", "type": "function" },
  "cvxBooster_poolInfo": { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "address", "name": "lptoken", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "gauge", "type": "address" }, { "internalType": "address", "name": "crvRewards", "type": "address" }, { "internalType": "address", "name": "stash", "type": "address" }, { "internalType": "bool", "name": "shutdown", "type": "bool" }], "stateMutability": "view", "type": "function" }
}
const cvxBoosterAddress = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
async function genericUnwrapCvx(balances, holder, cvx_BaseRewardPool, block, chain) {
  // Compute the balance of the treasury of the CVX position and unwrap
  const [
    { output: cvx_LP_bal },
    { output: pool_id }
  ] = await Promise.all([
    sdk.api.abi.call({
      abi: cvx_abi['cvxBRP_balanceOf'], // cvx_balanceOf cvx_earned cvx_rewards cvx_userRewardPerTokenPaid
      target: cvx_BaseRewardPool,
      params: [holder],
      chain, block
    }),
    // const {output: pool_id} = await 
    sdk.api.abi.call({
      abi: cvx_abi['cvxBRP_pid'],
      target: cvx_BaseRewardPool,
      chain, block
    })
  ])
  const { output: crvPoolInfo } = await sdk.api.abi.call({
    abi: cvx_abi['cvxBooster_poolInfo'],
    target: cvxBoosterAddress,
    params: [pool_id],
    chain,
    block: block,
  })
  await genericUnwrapCrv(balances, crvPoolInfo.lptoken, cvx_LP_bal, block, chain)
}

async function unwrapLPsAuto({ balances, block, chain = "ethereum", transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens = [], blacklistedLPs = [] }) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  pool2Tokens = pool2Tokens.map(token => token.toLowerCase())
  blacklistedLPs = blacklistedLPs.map(token => token.toLowerCase())
  const tokens = []
  const amounts = []

  Object.keys(balances).forEach(key => {
    if (chain === 'ethereum' && key.indexOf(':') > -1) return;  // token is transformed, probably not an LP
    if (chain !== 'ethereum' && !key.startsWith(chain + ':')) return;  // token is transformed, probably not an LP
    const token = stripTokenHeader(key)
    if (!/^0x/.test(token)) return;     // if token is not an eth address, we ignore it
    tokens.push({ output: token })
    amounts.push({ output: balances[key] })
    delete balances[key]
  })

  return _addTokensAndLPs(balances, tokens, amounts)

  async function _addTokensAndLPs(balances, tokens, amounts) {
    const symbols = (await sdk.api.abi.multiCall({
      calls: tokens.map(t => ({ target: t.output })), abi: symbol, block, chain
    })).output
    const lpBalances = []
    symbols.forEach(({ output }, idx) => {
      const token = tokens[idx].output
      const balance = amounts[idx].output
      if (isLP(output, token, chain) && !blacklistedLPs.includes(token.toLowerCase()))
        lpBalances.push({ token, balance })
      else
        sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
    })
    await _unwrapUniswapLPs(balances, lpBalances)
  }

  async function _unwrapUniswapLPs(balances, lpPositions) {
    const lpTokenCalls = lpPositions.map(lpPosition => ({ target: lpPosition.token }))
    const { output: lpReserves } = await sdk.api.abi.multiCall({ block, abi: lpReservesAbi, calls: lpTokenCalls, chain, })
    const { output: lpSupplies } = await sdk.api.abi.multiCall({ block, abi: lpSuppliesAbi, calls: lpTokenCalls, chain, })
    const { output: tokens0 } = await sdk.api.abi.multiCall({ block, abi: token0Abi, calls: lpTokenCalls, chain, })
    const { output: tokens1 } = await sdk.api.abi.multiCall({ block, abi: token1Abi, calls: lpTokenCalls, chain, })

    lpPositions.map(lpPosition => {
      try {
        let token0, token1, supply
        const lpToken = lpPosition.token
        const token0_ = tokens0.find(call => call.input.target === lpToken)
        const token1_ = tokens1.find(call => call.input.target === lpToken)
        const supply_ = lpSupplies.find(call => call.input.target === lpToken)
        try {
          token0 = token0_.output.toLowerCase()
          token1 = token1_.output.toLowerCase()
          supply = supply_.output
        } catch (e) {
          console.log('Unable to resolve LP: ', lpToken);
          throw e
        }

        if (excludePool2)
          if (pool2Tokens.includes(token0) || pool2Tokens.includes(token1)) return;

        if (onlyPool2)
          if (!pool2Tokens.includes(token0) && !pool2Tokens.includes(token1)) return;

        if (supply === "0") {
          return
        }

        let _reserve0, _reserve1
        let output = lpReserves.find(call => call.input.target === lpToken);
        _reserve0 = output.output._reserve0 || output.output.reserve0
        _reserve1 = output.output._reserve1 || output.output.reserve1

        const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply)).toFixed(0)
        const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply)).toFixed(0)
        sdk.util.sumSingleBalance(balances, transformAddress(token0), token0Balance)
        sdk.util.sumSingleBalance(balances, transformAddress(token1), token1Balance)
      } catch (e) {
        console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
        throw e
      }
    })
  }
}

function stripTokenHeader(token) {
  return token.indexOf(':') > -1 ? token.split(':')[1] : token
}

async function unwrapTroves({ balances = {}, chain = 'ethereum', block, troves = [], transformAddress }) {
  const troveCalls = troves.map(target => ({ target }))
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)
  const [{ output: activePools }, { output: tokens }] = await Promise.all([
    sdk.api.abi.multiCall({
      block,
      abi: activePoolAbi,
      calls: troveCalls,
      chain
    }),
    sdk.api.abi.multiCall({
      block,
      abi: wethAddressAbi,
      calls: troveCalls,
      chain
    })
  ])

  const tokensAndOwners = []

  for (let i = 0; i < troves.length; i++) {
    tokensAndOwners.push([tokens[i].output, activePools[i].output])
  }

  await sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveCrv: true, resolveLP: true, resolveYearn: true })
  return balances
}


async function sumTokens2({
  balances = {},
  tokensAndOwners = [],
  tokens = [],
  owners = [],
  owner,
  block,
  chain = 'ethereum',
  transformAddress,
  resolveCrv = false,
  resolveLP = false,
  resolveYearn = false,
  unwrapAll = false,
  blacklistedLPs = [],
}) {

  if (!tokensAndOwners.length) {
    tokens = getUniqueAddresses(tokens)
    owners = getUniqueAddresses(owners)
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
  }

  return sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveCrv, resolveLP, resolveYearn, unwrapAll, blacklistedLPs })
}

module.exports = {
  unwrapYearn,
  unwrapCrv,
  unwrapUniswapLPs,
  unwrapUniswapV3NFTs,
  addTokensAndLPs,
  sumTokensAndLPsSharedOwners,
  sumTokensAndLPs,
  sumTokens,
  sumBalancerLps,
  unwrapCreamTokens,
  sumLPWithOnlyOneToken,
  sumTokensSharedOwners,
  sumLPWithOnlyOneTokenOtherThanKnown,
  unwrapGelatoLPs,
  genericUnwrapCrv,
  genericUnwrapCvx,
  unwrapLPsAuto,
  unwrapTroves,
  isLP,
  sumTokens2,
}
