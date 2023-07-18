const ADDRESSES = require('./coreAssets.json')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const token0 = 'address:token0'
const symbol = 'string:symbol'
const { getPoolTokens, getPoolId, bPool, getCurrentTokens, } = require('./abis/balancer.json')
const { requery } = require('./requery')
const { getChainTransform, getFixBalances } = require('./portedTokens')
const { getUniqueAddresses, normalizeAddress } = require('./tokenMapping')
const creamAbi = require('./abis/cream.json')
const { isLP, log, } = require('./utils')
const { sumArtBlocks, whitelistedNFTs, } = require('./nft')
const wildCreditABI = require('../wildcredit/abi.json');
const { covalentGetTokens, get } = require("./http");
const { sliceIntoChunks } = require('@defillama/sdk/build/util');

const lpReservesAbi = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const lpSuppliesAbi = "uint256:totalSupply"
const token0Abi = "address:token0"
const token1Abi = "address:token1"

/* lpPositions:{
    balance,
    token
}[]
*/
async function unwrapUniswapLPs(balances, lpPositions, block, chain = 'ethereum', transformAddress = null, excludeTokensRaw = [], retry = false, uni_type = 'standard',) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)
  const api = new sdk.ChainApi({ chain, block })
  lpPositions = lpPositions.filter(i => +i.balance > 0)
  const excludeTokens = excludeTokensRaw.map(addr => addr.toLowerCase())
  const lpTokenCalls = lpPositions.map(i => i.token)
  const [
    lpReserves, lpSupplies, tokens0, tokens1,
  ] = await Promise.all([
    uni_type === 'standard' ? api.multiCall({ abi: lpReservesAbi, calls: lpTokenCalls, }) : null,
    api.multiCall({ abi: lpSuppliesAbi, calls: lpTokenCalls, }),
    api.multiCall({ abi: token0Abi, calls: lpTokenCalls, }),
    api.multiCall({ abi: token1Abi, calls: lpTokenCalls, }),
  ])
  let gelatoPools, gToken0Bals, gToken1Bals
  if (uni_type === 'gelato') {
    gelatoPools = await api.multiCall({ abi: gelatoPoolsAbi, calls: lpTokenCalls, })
    gToken1Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: gelatoPools.map((v, i) => ({ target: tokens0[i], params: v })), })
    gToken0Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: gelatoPools.map((v, i) => ({ target: tokens1[i], params: v })), })
  }
  lpPositions.map((lpPosition, i) => {
    const token0 = tokens0[i].toLowerCase()
    const token1 = tokens1[i].toLowerCase()
    const supply = lpSupplies[i]

    if (supply === "0") {
      return
    }

    let _reserve0, _reserve1
    if (uni_type === 'standard') {
      _reserve0 = lpReserves[i]._reserve0
      _reserve1 = lpReserves[i]._reserve1
    } else if (uni_type === 'gelato') {
      _reserve0 = gToken0Bals[i]
      _reserve1 = gToken1Bals[i]
    }

    const ratio = lpPosition.balance / supply
    if (!excludeTokens.includes(token0)) {
      sdk.util.sumSingleBalance(balances, transformAddress(token0), ratio * _reserve0)
    }
    if (!excludeTokens.includes(token1)) {
      sdk.util.sumSingleBalance(balances, transformAddress(token1), ratio * _reserve1)
    }
  })
}

const gelatoPoolsAbi = 'address:pool'

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
async function sumTokensAndLPsSharedOwners(balances, tokens, owners, block, chain = "ethereum", transformAddress) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)
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

const PANCAKE_NFT_ADDRESS = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'
async function unwrapUniswapV3NFTs({ balances = {}, nftsAndOwners = [], block, chain = 'ethereum', owner, nftAddress, owners, blacklistedTokens = [], whitelistedTokens = [], }) {
  if (!nftsAndOwners.length) {
    if (!nftAddress)
      switch (chain) {
        case 'ethereum':
        case 'polygon':
        case 'optimism':
        case 'arbitrum': nftAddress = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'; break;
        case 'bsc': nftAddress = [PANCAKE_NFT_ADDRESS, '0x7b8a01b39d58278b5de7e48c8449c9f4f5170613']; break;
        default: throw new Error('missing default uniswap nft address')
      }

    if ((!owners || !owners.length) && owner)
      owners = [owner]
    owners = getUniqueAddresses(owners, chain)
    if (Array.isArray(nftAddress))
      nftsAndOwners = nftAddress.map(nft => owners.map(o => [nft, o])).flat()
    else
      nftsAndOwners = owners.map(o => [nftAddress, o])
  }
  await Promise.all(nftsAndOwners.map(([nftAddress, owner]) => unwrapUniswapV3NFT({ balances, owner, nftAddress, block, chain, blacklistedTokens, whitelistedTokens, })))
  return balances
}

async function unwrapUniswapV3NFT({ balances, owner, nftAddress, block, chain = 'ethereum', blacklistedTokens = [], whitelistedTokens = [], }) {
  blacklistedTokens = getUniqueAddresses(blacklistedTokens, chain)
  whitelistedTokens = getUniqueAddresses(whitelistedTokens, chain)

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
    const tickToPrice = (tick) => 1.0001 ** tick

    const token0 = position.token0
    const token1 = position.token1
    const liquidity = position.liquidity
    const bottomTick = +position.tickLower
    const topTick = +position.tickUpper
    const tick = +lpInfo[getKey(position)].tick
    const sa = tickToPrice(bottomTick / 2)
    const sb = tickToPrice(topTick / 2)

    let amount0 = 0
    let amount1 = 0

    if (tick < bottomTick) {
      amount0 = liquidity * (sb - sa) / (sa * sb)
    } else if (tick < topTick) {
      const price = tickToPrice(tick)
      const sp = price ** 0.5

      amount0 = liquidity * (sb - sp) / (sp * sb)
      amount1 = liquidity * (sp - sa)
    } else {
      amount1 = liquidity * (sb - sa)
    }

    addToken({ balances, token: token0, amount: amount0, chain, blacklistedTokens, whitelistedTokens })
    addToken({ balances, token: token1, amount: amount1, chain, blacklistedTokens, whitelistedTokens })
  }
}

function addToken({ balances, token, amount, chain, blacklistedTokens = [], whitelistedTokens = [] }) {
  const addr = normalizeAddress(token, chain)
  if (blacklistedTokens.length && blacklistedTokens.includes(addr)) return;
  if (whitelistedTokens.length && !whitelistedTokens.includes(addr)) return;
  sdk.util.sumSingleBalance(balances, token, amount, chain)
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

async function getTrxBalance(account) {
  const data = await get('https://apilist.tronscan.org/api/account?address=' + account)
  return data.balance + (data.totalFrozen || 0)
}

const nullAddress = ADDRESSES.null
const gasTokens = [nullAddress, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb']
/*
tokensAndOwners [
    [token, owner] - eg ["0xaaa", "0xbbb"]
]
*/
async function sumTokens(balances = {}, tokensAndOwners, block, chain = "ethereum", transformAddress, { resolveLP = false, unwrapAll = false, blacklistedLPs = [], skipFixBalances = false, abis = {}, permitFailure = false } = {}) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  let ethBalanceInputs = []

  tokensAndOwners = tokensAndOwners.filter(i => {
    const token = normalizeAddress(i[0], chain)
    if (token !== nullAddress && !gasTokens.includes(token))
      return true
    ethBalanceInputs.push(i[1])
    return false
  })

  ethBalanceInputs = getUniqueAddresses(ethBalanceInputs, chain)

  if (ethBalanceInputs.length) {
    if (chain === "tron") {
      const ethBalances = await Promise.all(ethBalanceInputs.map(getTrxBalance))
      ethBalances.forEach(balance => sdk.util.sumSingleBalance(balances, transformAddress(nullAddress), balance))
    } else {
      const { output: ethBalances } = await sdk.api.eth.getBalances({ targets: ethBalanceInputs, chain, block })
      ethBalances.forEach(({ balance }) => sdk.util.sumSingleBalance(balances, transformAddress(nullAddress), balance))
    }
  }

  const balanceOfTokens = await sdk.api.abi.multiCall({
    calls: tokensAndOwners.map(t => ({
      target: t[0],
      params: t[1]
    })),
    permitFailure,
    abi: 'erc20:balanceOf',
    block,
    chain
  })
  balanceOfTokens.output.forEach((result) => {
    const token = transformAddress(result.input.target)
    let balance = BigNumber(result.output)
    if (result.output === null || isNaN(+result.output)) {
      sdk.log('failed for', token, balance, balances[token])
      if (permitFailure) balance = BigNumber(0)
      else throw new Error('Unable to fetch balance for: ' + result.input.target)
    }
    balances[token] = BigNumber(balances[token] || 0).plus(balance).toFixed(0)
  })

  Object.entries(balances).forEach(([token, value]) => {
    if (+value === 0) delete balances[token]
  })

  if (resolveLP || unwrapAll)
    await unwrapLPsAuto({ balances, block, chain, transformAddress, blacklistedLPs, abis, })

  if (!skipFixBalances && ['astar', 'harmony', 'kava', 'thundercore', 'klaytn', 'evmos'].includes(chain)) {
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

const cvx_abi = {
  cvxBRP_pid: "uint256:pid",
  cvxBRP_balanceOf: "function balanceOf(address account) view returns (uint256)",
  cvxBRP_earned: "function earned(address account) view returns (uint256)",
  cvxBRP_rewards: "function rewards(address) view returns (uint256)",
  cvxBRP_userRewardPerTokenPaid: "function userRewardPerTokenPaid(address) view returns (uint256)",
  cvxBRP_stakingToken: "address:stakingToken",
  cvxBooster_poolInfo: "function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)",
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
  sdk.util.sumSingleBalance(balances, crvPoolInfo.lptoken, cvx_LP_bal, chain)
  return balances
}

async function genericUnwrapCvxDeposit({ api, owner, token, balances }) {
  if (!balances) balances = await api.getBalances()
  const [bal, cToken] = await api.batchCall([
    { target: token, params: owner, abi: 'erc20:balanceOf' },
    { target: token, abi: 'address:curveToken' },
  ])
  sdk.util.sumSingleBalance(balances, cToken, bal, api.chain)
  return balances
}

async function genericUnwrapCvxRewardPool({ api, owner, pool, balances }) {
  if (!balances) balances = await api.getBalances()
  const [bal, cToken] = await api.batchCall([
    { target: pool, params: owner, abi: 'erc20:balanceOf' },
    { target: pool, abi: 'address:stakingToken' },
  ])
  sdk.util.sumSingleBalance(balances, cToken, bal, api.chain)
  return balances
}

async function unwrapLPsAuto({ api, balances, block, chain = "ethereum", transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens = [], blacklistedLPs = [], abis = {}, }) {
  if (api) {
    chain = api.chain ?? chain
    block = api.block ?? block
    if (!balances) balances = api.getBalances()
  } else {
    api = new sdk.ChainApi({ chain, block })
  }

  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  pool2Tokens = pool2Tokens.map(token => token.toLowerCase())
  blacklistedLPs = blacklistedLPs.map(token => token.toLowerCase())
  const tokens = []
  const amounts = []

  Object.keys(balances).forEach(key => {
    if (+balances[key] === 0) {
      delete balances[key]
      return;
    }
    if (chain === 'ethereum') {
      if (!key.startsWith(chain + ':') && !key.startsWith('0x')) return;  // token is transformed, probably not an LP
    } else if (!key.startsWith(chain + ':')) {
      return;// token is transformed, probably not an LP
    }
    const token = stripTokenHeader(key)
    if (!/^0x/.test(token)) return;     // if token is not an eth address, we ignore it
    tokens.push({ output: token })
    amounts.push({ output: balances[key] })
    delete balances[key]
  })

  return _addTokensAndLPs(balances, tokens, amounts)

  async function _addTokensAndLPs(balances, tokens, amounts) {
    const symbols = (await sdk.api.abi.multiCall({
      calls: tokens.map(t => ({ target: t.output })), abi: symbol, block, chain, permitFailure: true,
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
    return balances
  }

  async function _unwrapUniswapLPs(balances, lpPositions) {
    const lpTokenCalls = lpPositions.map(lpPosition => ({ target: lpPosition.token }))
    const { output: lpReserves } = await sdk.api.abi.multiCall({ block, abi: abis.getReservesABI || lpReservesAbi, calls: lpTokenCalls, chain, })
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

async function sumTokens2({
  balances,
  tokensAndOwners = [],
  tokensAndOwners2 = [],
  ownerTokens = [],
  tokens = [],
  owners = [],
  owner,
  block,
  chain = 'ethereum',
  transformAddress,
  resolveLP = false,
  unwrapAll = false,
  blacklistedLPs = [],
  blacklistedTokens = [],
  skipFixBalances = false,
  abis = {},
  api,
  resolveUniV3 = false,
  uniV3WhitelistedTokens = [],
  resolveArtBlocks = false,
  resolveNFTs = false,
  permitFailure = false,
}) {
  if (api) {
    chain = api.chain ?? chain
    block = api.block ?? block
    if (!balances) balances = api.getBalances()
  } else if (!balances) {
    balances = {}
  }

  if (resolveArtBlocks || resolveNFTs) {
    if (!api) throw new Error('Missing arg: api')
    await sumArtBlocks({ balances, api, owner, owners, })
  }

  if (resolveNFTs) {
    if (!api) throw new Error('Missing arg: api')
    if (!owners || !owners.length) owners = [owner]
    const nftTokens = (await Promise.all(owners.map(i => covalentGetTokens(i, api.chain)))).flat()
    return sumTokens2({ balances, api, owners, tokens: [...nftTokens, ...tokens, ...(whitelistedNFTs[api.chain] || [])], })
  }

  if (!tokensAndOwners.length) {
    tokens = getUniqueAddresses(tokens, chain)
    owners = getUniqueAddresses(owners, chain)
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
    if (ownerTokens.length) {
      ownerTokens.map(([tokens, owner]) => {
        if (typeof owner !== 'string') throw new Error('invalid config', owner)
        if (!Array.isArray(tokens)) throw new Error('invalid config', tokens)
        tokens.forEach(t => tokensAndOwners.push([t, owner]))
      })
    }
    if (tokensAndOwners2.length) {
      const [_tokens, _owners] = tokensAndOwners2
      _tokens.forEach((v, i) => tokensAndOwners.push([v, _owners[i]]))
    }
  }

  if (resolveUniV3)
    await unwrapUniswapV3NFTs({ balances, chain, block, owner, owners, blacklistedTokens, whitelistedTokens: uniV3WhitelistedTokens, })

  blacklistedTokens = blacklistedTokens.map(t => normalizeAddress(t, chain))
  tokensAndOwners = tokensAndOwners.map(([t, o]) => [normalizeAddress(t, chain), o]).filter(([token]) => !blacklistedTokens.includes(token))
  tokensAndOwners = getUniqueToA(tokensAndOwners)
  log(chain, 'summing tokens', tokensAndOwners.length)

  if (chain === 'tron') {
    const tokensAndOwnersChunks = sliceIntoChunks(tokensAndOwners, 3)
    for (const toa of tokensAndOwnersChunks) {
      await sumTokens(balances, toa, block, chain, transformAddress, { resolveLP, unwrapAll, blacklistedLPs, skipFixBalances: true, abis, permitFailure, })
    }
  } else {
    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveLP, unwrapAll, blacklistedLPs, skipFixBalances: true, abis, permitFailure, })
  }

  if (!skipFixBalances) {
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
  }

  return balances

  function getUniqueToA(toa) {
    toa = toa.map(i => i.join('-'))
    return getUniqueAddresses(toa, chain).map(i => i.split('-'))
  }
}

function sumTokensExport({ balances, tokensAndOwners, tokensAndOwners2, tokens, owner, owners, transformAddress, unwrapAll, resolveLP, blacklistedLPs, blacklistedTokens, skipFixBalances, ownerTokens, resolveUniV3, resolveArtBlocks, resolveNFTs, }) {
  return async (_, _b, _cb, { api }) => sumTokens2({ api, balances, tokensAndOwners, tokensAndOwners2, tokens, owner, owners, transformAddress, unwrapAll, resolveLP, blacklistedLPs, blacklistedTokens, skipFixBalances, ownerTokens, resolveUniV3, resolveArtBlocks, resolveNFTs, })
}

async function unwrapBalancerToken({ api, chain, block, balancerToken, owner, balances = {}, isBPool = false, isV2 = true }) {
  if (!api) {
    api = new sdk.ChainApi({ chain, block, })
  }
  const [lpSupply, lpTokens] = await api.batchCall([
    { abi: 'erc20:totalSupply', target: balancerToken },
    { abi: 'erc20:balanceOf', target: balancerToken, params: owner },
  ])
  if (+lpTokens === 0) return balances
  const ratio = lpTokens / lpSupply

  if (isV2) {
    const poolId = await api.call({ abi: 'function getPoolId() view returns (bytes32)', target: balancerToken })
    const vault = await api.call({ abi: 'address:getVault', target: balancerToken })
    const [tokens, bals] = await api.call({ abi: 'function getPoolTokens(bytes32) view returns (address[], uint256[],uint256)', target: vault, params: poolId })
    tokens.forEach((v, i) => {
      sdk.util.sumSingleBalance(balances, v, bals[i] * ratio, api.chain)
    })
  } else {
    let underlyingPool = balancerToken
    if (!isBPool)
      underlyingPool = await api.call({ target: balancerToken, abi: bPool, })

    const underlyingTokens = await api.call({ target: underlyingPool, abi: getCurrentTokens, })

    const tempBalances = await sumTokens2({ owner: underlyingPool, tokens: underlyingTokens, api, })
    for (const [token, value] of Object.entries(tempBalances)) {
      const newValue = BigNumber(value * ratio).toFixed(0)
      sdk.util.sumSingleBalance(balances, token, newValue)
    }
  }

  return balances
}

async function unwrapMakerPositions({ api, blacklistedTokens = [], whitelistedTokens = [], owner, skipDebt = false }) {
  const vaultIds = []
  const chain = api.chain
  if (chain && chain !== 'ethereum') throw new Error('Maker protocol not found in chain')
  blacklistedTokens = getUniqueAddresses(blacklistedTokens, chain)
  whitelistedTokens = getUniqueAddresses(whitelistedTokens, chain)
  // taken from https://maker.defiexplore.com/api/users/0x849d52316331967b6ff1198e5e32a0eb168d039d?orderTx=DESC&order=DESC&sortBy=debt
  // https://docs.makerdao.com/smart-contract-modules/proxy-module/cdp-manager-detailed-documentation
  const PROXY_REGISTRY = '0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4'
  const ds_proxy = await api.call({ abi: 'function proxies(address) view returns (address)', target: PROXY_REGISTRY, params: owner })
  const CDP_MANAGER = '0x5ef30b9986345249bc32d8928b7ee64de9435e39'
  const ILK_REGISTRY = '0x5a464C28D19848f44199D003BeF5ecc87d090F87'
  const vaultCount = await api.call({ abi: 'function count(address) view returns (uint256)', target: CDP_MANAGER, params: ds_proxy })
  if (vaultCount < 1) return api.getBalances()
  vaultIds.push(await api.call({ abi: 'function first(address) view returns (uint256)', target: CDP_MANAGER, params: ds_proxy }))
  for (let i = 0; i < vaultCount - 1; i++) {
    const [_, nextId] = await api.call({ abi: 'function list(uint256) view returns (uint256,uint256)', target: CDP_MANAGER, params: vaultIds[i] })
    vaultIds.push(nextId)
  }
  const ilks = await api.multiCall({ abi: 'function ilks(uint256) view returns (bytes32)', calls: vaultIds, target: CDP_MANAGER })
  const urns = await api.multiCall({ abi: 'function urns(uint256) view returns (address)', calls: vaultIds, target: CDP_MANAGER })
  let collaterals = await api.multiCall({ abi: 'function gem(bytes32) view returns (address)', calls: ilks, target: ILK_REGISTRY })
  const vat = await api.call({ abi: 'address:vat', target: CDP_MANAGER })
  const cdpData = await api.multiCall({ abi: 'function urns(bytes32, address) view returns (uint256 collateralBal, uint256 debt)', calls: urns.map((v, i) => ({ params: [ilks[i], v] })), target: vat })
  collaterals = collaterals.map(i => normalizeAddress(i, chain))
  cdpData.forEach(({ collateralBal, debt }, i) => {
    if (!skipDebt)
      api.add(ADDRESSES.ethereum.DAI, debt * -1)
    const collateral = collaterals[i]
    if (blacklistedTokens.length && blacklistedTokens.includes(collateral, chain)) return;
    if (whitelistedTokens.length && !whitelistedTokens.includes(collateral, chain)) return;
    api.add(collateral, collateralBal)
  })
  return api.getBalances()
}

async function unwrap4626Tokens({ api, tokensAndOwners, }) {
  const tokens = tokensAndOwners.map(i => i[0])
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokensAndOwners.map(i => ({ target: i[0], params: i[1] })), })
  const assets = await api.multiCall({ abi: 'address:asset', calls: tokens, })
  api.addTokens(assets, bals)
  return api.getBalances()
}

async function unwrapConvexRewardPools({ api, tokensAndOwners }) {
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokensAndOwners.map(([t, o]) => ({ target: t, params: o })) })
  const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: tokensAndOwners.map(i => i[0]) })
  api.addTokens(tokens, bals)
  return api.getBalances()
}

module.exports = {
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
  genericUnwrapCvx,
  unwrapLPsAuto,
  isLP,
  nullAddress,
  sumTokens2,
  unwrapBalancerToken,
  sumTokensExport,
  genericUnwrapCvxDeposit,
  genericUnwrapCvxRewardPool,
  unwrapMakerPositions,
  unwrap4626Tokens,
  unwrapConvexRewardPools,
}
