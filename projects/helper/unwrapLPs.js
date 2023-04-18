const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const token0 = 'address:token0'
const symbol = 'string:symbol'
const { getPoolTokens, getPoolId, bPool, getCurrentTokens, getVault: getBalancerVault, } = require('./abis/balancer.json')
const { requery } = require('./requery')
const { getChainTransform, getFixBalances } = require('./portedTokens')
const creamAbi = require('./abis/cream.json')
const { isLP, getUniqueAddresses, log, } = require('./utils')
const { sumArtBlocks, whitelistedNFTs, } = require('./nft')
const wildCreditABI = require('../wildcredit/abi.json');
const { covalentGetTokens } = require("./http");

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
  lpPositions = lpPositions.filter(i => +i.balance > 0)
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
      sdk.log(e)
      console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
      throw e
    }
  }))
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
async function unwrapUniswapV3NFTs({ balances = {}, nftsAndOwners = [], block, chain = 'ethereum', transformAddress, owner, nftAddress, owners }) {
  if (!nftsAndOwners.length) {
    if (!nftAddress)
      switch (chain) {
        case 'ethereum':
        case 'polygon':
        case 'optimism':
        case 'arbitrum': nftAddress = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'; break;
        case 'bsc': nftAddress = '0x7b8a01b39d58278b5de7e48c8449c9f4f5170613'; break;
        default: throw new Error('missing default uniswap nft address')
      }

    if ((!owners || !owners.length) && owner)
      owners = [owner]
    owners = getUniqueAddresses(owners)
    nftsAndOwners = owners.map(o => [nftAddress, o])
  }
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

    sdk.util.sumSingleBalance(balances, transformAddress(token0), new BigNumber(amount0).toFixed(0))
    sdk.util.sumSingleBalance(balances, transformAddress(token1), new BigNumber(amount1).toFixed(0))
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
const gasTokens = [nullAddress, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb']
/*
tokensAndOwners [
    [token, owner] - eg ["0xaaa", "0xbbb"]
]
*/
async function sumTokens(balances = {}, tokensAndOwners, block, chain = "ethereum", transformAddress, { resolveLP = false, unwrapAll = false, blacklistedLPs = [], skipFixBalances = false, abis = {}, ignoreFailed = false } = {}) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  let ethBalanceInputs = []

  tokensAndOwners = tokensAndOwners.filter(i => {
    const token = i[0].toLowerCase()
    if (token !== nullAddress && !gasTokens.includes(token))
      return true
    ethBalanceInputs.push(i[1])
    return false
  })

  ethBalanceInputs = getUniqueAddresses(ethBalanceInputs)

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
    let balance = BigNumber(result.output)
    if (result.output === null ||isNaN(+result.output)) {
      sdk.log('failed for', token, balance, balances[token])
      if (ignoreFailed) balance = BigNumber(0)
      else throw e
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

async function unwrapLPsAuto({ api, balances, block, chain = "ethereum", transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens = [], blacklistedLPs = [], abis = {}, }) {
  if (api) {
    chain = api.chain ?? chain
    block = api.block ?? block
    if (!balances) balances = api.getBalances()
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
  resolveArtBlocks = false,
  resolveNFTs = false,
  ignoreFailed = false,
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
    tokens = getUniqueAddresses(tokens)
    owners = getUniqueAddresses(owners)
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
    await unwrapUniswapV3NFTs({ balances, chain, block, owner, owners, })

  blacklistedTokens = blacklistedTokens.map(t => t.toLowerCase())
  tokensAndOwners = tokensAndOwners.map(([t, o]) => [t.toLowerCase(), o]).filter(([token]) => !blacklistedTokens.includes(token))
  tokensAndOwners = getUniqueToA(tokensAndOwners)
  log(chain, 'summing tokens', tokensAndOwners.length)

  await sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveLP, unwrapAll, blacklistedLPs, skipFixBalances: true, abis, ignoreFailed, })

  if (!skipFixBalances) {
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
  }

  return balances

  function getUniqueToA(toa) {
    toa = toa.map(i => i.join('-'))
    return getUniqueAddresses(toa).map(i => i.split('-'))
  }
}

function sumTokensExport({ balances, tokensAndOwners, tokens, owner, owners, transformAddress, unwrapAll, resolveLP, blacklistedLPs, blacklistedTokens, skipFixBalances, ownerTokens, resolveUniV3, resolveArtBlocks, resolveNFTs, }) {
  return async (_, _b, _cb, { api }) => sumTokens2({ api, balances, tokensAndOwners, tokens, owner, owners, transformAddress, unwrapAll, resolveLP, blacklistedLPs, blacklistedTokens, skipFixBalances, ownerTokens, resolveUniV3, resolveArtBlocks, resolveNFTs, })
}

async function unwrapBalancerToken({ chain, block, balancerToken, owner, balances = {}, isBPool = false, }) {
  const { output: lpTokens } = await sdk.api.erc20.balanceOf({ target: balancerToken, owner, chain, block, })
  const { output: lpSupply } = await sdk.api.erc20.totalSupply({ target: balancerToken, chain, block, })
  let underlyingPool = balancerToken
  if (!isBPool)
    underlyingPool = await sdk.api2.abi.call({ target: balancerToken, abi: bPool, chain, block, })
  const { output: underlyingTokens } = await sdk.api.abi.call({ target: underlyingPool, abi: getCurrentTokens, chain, block, })

  const ratio = lpTokens / lpSupply
  const tempBalances = await sumTokens2({ owner: underlyingPool, tokens: underlyingTokens, chain, block, })
  for (const [token, value] of Object.entries(tempBalances)) {
    const newValue = BigNumber(value * ratio).toFixed(0)
    sdk.util.sumSingleBalance(balances, token, newValue)
  }

  return balances
}

async function unwrapBalancerPool({ chain = 'ethereum', block, balancerPool, owner, balances = {} }) {
  const { output: vault } = await sdk.api.abi.call({ target: balancerPool, abi: getBalancerVault, chain, block, })
  const { output: poolId } = await sdk.api.abi.call({ target: balancerPool, abi: getPoolId, chain, block, })
  const { output: poolTokens } = await sdk.api.abi.call({ target: vault, params: [poolId], abi: getPoolTokens, chain, block, })
  const transform = await getChainTransform(chain)

  const { output: lpTokens } = await sdk.api.erc20.balanceOf({ target: balancerPool, owner, chain, block, })
  const { output: lpSupply } = await sdk.api.erc20.totalSupply({ target: balancerPool, chain, block, })

  const ratio = lpTokens / lpSupply
  const { tokens, balances: bal, } = poolTokens
  tokens.forEach((token, i) => {
    const newValue = BigNumber(+bal[i] * ratio).toFixed(0)
    sdk.util.sumSingleBalance(balances, transform(token), newValue)
  })
  return balances
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
  unwrapBalancerPool,
  sumTokensExport,
}
