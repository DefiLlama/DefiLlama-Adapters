const ADDRESSES = require('./coreAssets.json')
const sdk = require("@defillama/sdk");
const ethers = require("ethers");
const BigNumber = require("bignumber.js");
const symbol = 'string:symbol'
const { bPool, getCurrentTokens, } = require('./abis/balancer.json')
const { getChainTransform, getFixBalances } = require('./portedTokens')
const { getUniqueAddresses, normalizeAddress } = require('./tokenMapping')
const { isLP, log, sliceIntoChunks, isICHIVaultToken, createIncrementArray, sleep } = require('./utils')
const { sumArtBlocks, whitelistedNFTs, } = require('./nft')
const wildCreditABI = require('../wildcredit/abi.json');
const slipstreamNftABI = require('../arcadia-finance-v2/slipstreamNftABI.json');
const { covalentGetTokens, } = require("./token");
const SOLIDLY_VE_NFT_ABI = require('./abis/solidlyVeNft.json');
const { tickToPrice } = require('./utils/tick');

const lpReservesAbi = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const lpSuppliesAbi = "uint256:totalSupply"
const token0Abi = "address:token0"
const token1Abi = "address:token1"
const poolPositionAbi = 'function getPoolAndPositionInfo(uint256 tokenId) view returns ((address token0, address token1, uint24 fee, int24 tickSpacing, address hook), uint256 info)'
const getSlot0Abi = 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const getPositionLiquidityAbi = 'function getPositionLiquidity(uint256 tokenId) view returns (uint128 liquidity)'

/* lpPositions:{
    balance,
    token
}[]
*/
async function unwrapUniswapLPs(balances, lpPositions, block, chain = 'ethereum', transformAddress = null, excludeTokensRaw = [], uni_type = 'standard',) {
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

const PANCAKE_NFT_ADDRESS = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'

async function unwrapUniswapV4NFTs({ balances = {}, nftsAndOwners = [], block, chain = 'ethereum', owner, nftAddress, stateViewer, owners, blacklistedTokens = [], whitelistedTokens = [], uniV4ExtraConfig = {} }) {
  nftAddress = nftAddress ?? uniV4ExtraConfig.nftAddress
  stateViewer = stateViewer ?? uniV4ExtraConfig.stateViewer
  const commonConfig = { balances, owner, owners, chain, block, blacklistedTokens, whitelistedTokens, uniV4ExtraConfig, }
  if (!stateViewer)
    switch (chain) {
      case 'base': stateViewer = '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71'; break;
      default: throw new Error('missing default uniswap state viewer address chain: ' + chain)
    }

  if (!nftsAndOwners.length) {
    if (!nftAddress)
      switch (chain) {
        case 'base': nftAddress = '0x7C5f5A4bBd8fD63184577525326123B519429bDc'; break;
        default: throw new Error('missing default uniswap nft address chain: ' + chain)
      }

    if (Array.isArray(nftAddress)) {
      await Promise.all(nftAddress.map((addr) => unwrapUniswapV4NFT({ ...commonConfig, nftAddress: addr, stateViewer: stateViewer,})))
    } else
      await unwrapUniswapV4NFT({ ...commonConfig, nftAddress, stateViewer: stateViewer,})

  } else
    await Promise.all(nftsAndOwners.map(([nftAddress, owner]) => unwrapUniswapV4NFT({ ...commonConfig, owner, nftAddress, stateViewer: stateViewer,})))
  return balances
}

async function unwrapUniswapV4NFT({ balances, owner, owners, nftAddress, stateViewer, block, chain = 'ethereum', blacklistedTokens = [], whitelistedTokens = [], uniV4ExtraConfig = {}, }) {

  blacklistedTokens = getUniqueAddresses(blacklistedTokens, chain)
  whitelistedTokens = getUniqueAddresses(whitelistedTokens, chain)

  let positionIds = uniV4ExtraConfig.positionIds // Univ4's pos mgr does not have tokenOfOwnerByIndex

  const positionsEncoded = (await sdk.api.abi.multiCall({
    block, chain, abi: poolPositionAbi, target: nftAddress,
    calls: positionIds.map((position) => ({ params: [position] })),
  })).output.map(positionsCall => positionsCall.output)

  const positionsLiquidity = (await sdk.api.abi.multiCall({
    block, chain, abi: getPositionLiquidityAbi, target: nftAddress,
    calls: positionIds.map((position) => ({ params: [position] })),
  })).output.map(positionsCall => positionsCall.output)

  const positions = positionsEncoded.map((positionInfo, i) => {
    const positionInfoBN = new BigNumber(positionInfo[1]);

    //The postionInfo uint256 contains info about poolId, ticks and subscriber
    const { tickLower, tickUpper } = extractTicks(positionInfoBN);
    return {
      token0: positionInfo[0].token0,
      token1: positionInfo[0].token1,
      fee: positionInfo[0].fee,
      tickSpacing: positionInfo[0].tickSpacing,
      hook: positionInfo[0].hook,
      tickLower: tickLower,
      tickUpper: tickUpper,
      liquidity: positionsLiquidity[i],
    };
  });

  const lpInfo = {}
  positions.forEach(position => lpInfo[getKey(position)] = position)
  const lpInfoArray = Object.values(lpInfo)

  const poolInfos = lpInfoArray.map(position => {
    const poolId = getPoolId(position);
    return poolId; // Array of poolIds matching lpInfoArray indices
  });

  const slot0 = await sdk.api.abi.multiCall({
    block,
    chain,
    abi: getSlot0Abi,
    target: stateViewer,
    calls: poolInfos.map(poolId => ({ params: [poolId] })),
  });

  slot0.output.forEach((slot, i) => {
    lpInfoArray[i].tick = slot.output.tick;
  });

  positions.map(addV4PositionBalances)
  return balances

  function getKey(position) {
    let { token0, token1, fee, tickSpacing, hook } = position
    token0 = token0.toLowerCase()
    token1 = token1.toLowerCase()
    hook = hook.toLowerCase()
    return `${token0}-${token1}-${fee}-${tickSpacing}-${hook}`
  }

  function getPoolId(poolKey) {
    const { token0, token1, fee, tickSpacing, hook } = poolKey;

    const abiCoder = new ethers.AbiCoder();

    const encodedData = abiCoder.encode(
      ["address", "address", "uint24", "int24", "address"],
      [token0, token1, fee, tickSpacing, hook]
    );
    
    const poolId = ethers.keccak256(encodedData);
    return poolId;
  }

  // Convert an unsigned 24-bit value to a signed int24
  function toInt24(unsignedValue) {
    // safe for 24-bit values
    const value = unsignedValue.toNumber();
    // Check if signed (negative)
    if (value & 0x800000) {
        // If negative, subtract 2^24 (16777216) to get the signed value
        return value - (1 << 24);
    } else {
        // If positive, return as is
        return value;
    }
  }


  function extractTicks(poolInfo) {
    // shift right by 32 bits and mask with 0xFFFFFF (24 bits)
    const tickLowerUnsigned = poolInfo.dividedToIntegerBy(new BigNumber(2).pow(8)).mod(new BigNumber(2).pow(24));
    //shift right by 8 bits and mask with 0xFFFFFF (24 bits)
    const tickUpperUnsigned = poolInfo.dividedToIntegerBy(new BigNumber(2).pow(32)).mod(new BigNumber(2).pow(24));
    const tickUpper = toInt24(tickUpperUnsigned);
    const tickLower = toInt24(tickLowerUnsigned);
    return { tickUpper, tickLower };
  }


  function addV4PositionBalances(position) {
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

async function unwrapUniswapV3NFTs({ balances = {}, nftsAndOwners = [], block, chain = 'ethereum', owner, nftAddress, owners, blacklistedTokens = [], whitelistedTokens = [], uniV3ExtraConfig = {} }) {
  nftAddress = nftAddress ?? uniV3ExtraConfig.nftAddress
  const commonConfig = { balances, owner, owners, chain, block, blacklistedTokens, whitelistedTokens, uniV3ExtraConfig, }
  // https://docs.uniswap.org/contracts/v3/reference/deployments
  if (!nftsAndOwners.length) {
    if (!nftAddress)
      switch (chain) {
        case 'ethereum':
        case 'polygon':
        case 'optimism':
        case 'arbitrum': nftAddress = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'; break;
        case 'bsc': nftAddress = [PANCAKE_NFT_ADDRESS, '0x7b8a01b39d58278b5de7e48c8449c9f4f5170613']; break;
        case 'evmos': nftAddress = '0x5fe5daaa011673289847da4f76d63246ddb2965d'; break;
        case 'celo': nftAddress = '0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A'; break;
        case 'base': nftAddress = '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1'; break;
        case 'blast': nftAddress = '0x434575eaea081b735c985fa9bf63cd7b87e227f9'; break;
        case 'sonic': nftAddress = '0x743e03cceb4af2efa3cc76838f6e8b50b63f184c'; break;
        default: throw new Error('missing default uniswap nft address chain: ' + chain)
      }

    if (Array.isArray(nftAddress)) {
      await Promise.all(nftAddress.map((addr) => unwrapUniswapV3NFT({ ...commonConfig, nftAddress: addr, })))
    } else
      await unwrapUniswapV3NFT({ ...commonConfig, nftAddress, })

  } else
    await Promise.all(nftsAndOwners.map(([nftAddress, owner]) => unwrapUniswapV3NFT({ ...commonConfig, owner, nftAddress, })))
  return balances
}

const factories = {}

const getFactoryKey = (chain, nftAddress) => `${chain}:${nftAddress}`.toLowerCase()

async function unwrapUniswapV3NFT({ balances, owner, owners, nftAddress, block, chain = 'ethereum', blacklistedTokens = [], whitelistedTokens = [], uniV3ExtraConfig = {}, }) {

  blacklistedTokens = getUniqueAddresses(blacklistedTokens, chain)
  whitelistedTokens = getUniqueAddresses(whitelistedTokens, chain)
  let nftIdFetcher = uniV3ExtraConfig.nftIdFetcher ?? nftAddress

  const factoryKey = getFactoryKey(chain, nftAddress)
  if (!factories[factoryKey]) factories[factoryKey] = sdk.api.abi.call({ target: nftAddress, abi: wildCreditABI.factory, block, chain })
  let factory = (await factories[factoryKey]).output
  if (factory.toLowerCase() === '0xa08ae3d3f4da51c22d3c041e468bdf4c61405aab') // thruster finance has a bug where they set the pool deployer instead of the factory
    factory = '0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127'

  let positionIds = uniV3ExtraConfig.positionIds
  if (!positionIds) {
    if (!owners?.length && owner) owners = [owner]
    owners = getUniqueAddresses(owners, chain)
    const { output: lengths } = await sdk.api.abi.multiCall({
      block, chain, abi: wildCreditABI.balanceOf,
      calls: owners.map((params) => ({ target: nftIdFetcher, params, })),
    })
    const positionIDCalls = []
    for (let i = 0; i < owners.length; i++) {
      const length = lengths[i].output
      positionIDCalls.push(...createIncrementArray(length).map(j => ({ params: [owners[i], j] })))
    }

    positionIds = (await sdk.api.abi.multiCall({
      block, chain, abi: wildCreditABI.tokenOfOwnerByIndex, target: nftIdFetcher,
      calls: positionIDCalls,
    })).output.map(positionIdCall => positionIdCall.output)
  }

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

async function unwrapSlipstreamNFTs({ balances, nftsAndOwners = [], api, owner, nftAddress, owners, blacklistedTokens = [], whitelistedTokens = [], uniV3ExtraConfig = {} }) {
  // https://velodrome.finance/security#contracts
  // https://aerodrome.finance/security#contracts
  const chain = api.chain
  if (!nftsAndOwners.length) {
    if (!nftAddress)
      switch (chain) {
        case 'optimism': nftAddress = '0xbB5DFE1380333CEE4c2EeBd7202c80dE2256AdF4'; break;
        case 'base': nftAddress = '0x827922686190790b37229fd06084350e74485b72'; break;
        case 'swellchain': nftAddress = '0x991d5546C4B442B4c5fdc4c8B8b8d131DEB24702'; break;
        default: throw new Error('missing default uniswap nft address chain: ' + chain)
      }

    if ((!owners || !owners.length) && owner)
      owners = [owner]
    owners = getUniqueAddresses(owners, chain)
    if (Array.isArray(nftAddress))
      nftsAndOwners = nftAddress.map(nft => owners.map(o => [nft, o])).flat()
    else
      nftsAndOwners = owners.map(o => [nftAddress, o])
  }
  await Promise.all(nftsAndOwners.map(([nftAddress, owner]) => unwrapSlipstreamNFT({ balances, owner, nftAddress, api, blacklistedTokens, whitelistedTokens, uniV3ExtraConfig, })))
  return balances
}

async function unwrapSlipstreamNFT({ api, balances, owner, positionIds = [], nftAddress, blacklistedTokens = [], whitelistedTokens = [], uniV3ExtraConfig = {}, }) {
  if (!balances) balances = api.getBalances()
  const chain = api.chain

  blacklistedTokens = getUniqueAddresses(blacklistedTokens, chain)
  whitelistedTokens = getUniqueAddresses(whitelistedTokens, chain)
  let nftIdFetcher = uniV3ExtraConfig.nftIdFetcher ?? nftAddress

  const factoryKey = getFactoryKey(chain, nftAddress)
  if (!factories[factoryKey]) factories[factoryKey] = api.call({ target: nftAddress, abi: wildCreditABI.factory, })
  let factory = (await factories[factoryKey])

  if (!positionIds || positionIds.length === 0) {
    const nftPositions = await api.call({ target: nftIdFetcher, params: owner, abi: 'erc20:balanceOf' })
    positionIds = (await api.multiCall({
      abi: wildCreditABI.tokenOfOwnerByIndex, target: nftIdFetcher,
      calls: Array(Number(nftPositions)).fill(0).map((_, index) => ({ params: [owner, index] })),
    }))
  }

  const positions = (await api.multiCall({ abi: slipstreamNftABI.positions, target: nftAddress, calls: positionIds, }))

  const lpInfo = {}
  positions.forEach(position => lpInfo[getKey(position)] = position)
  const lpInfoArray = Object.values(lpInfo)

  const poolInfos = (await api.multiCall({ abi: slipstreamNftABI.getPool, target: factory, calls: lpInfoArray.map((info) => ({ params: [info.token0, info.token1, info.tickSpacing] })), }))

  const slot0 = await api.multiCall({ abi: slipstreamNftABI.slot0, calls: poolInfos })

  slot0.forEach((slot, i) => lpInfoArray[i].tick = slot.tick)

  positions.map(addV3PositionBalances)
  return balances

  function getKey(position) {
    let { token0, token1, tickSpacing } = position
    token0 = token0.toLowerCase()
    token1 = token1.toLowerCase()
    return `${token0}-${token1}-${tickSpacing}`
  }

  function addV3PositionBalances(position) {
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

const nullAddress = ADDRESSES.null
const gasTokens = [nullAddress, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '0x000000000000000000000000000000000000800a', // zksync era gas token
]
const gasTokenSet = new Set(gasTokens)
/*
tokensAndOwners [
    [token, owner] - eg ["0xaaa", "0xbbb"]
]
*/
async function sumTokens(balances = {}, tokensAndOwners, block, chain = "ethereum", transformAddress, { resolveLP = false, unwrapAll = false, blacklistedLPs = [], skipFixBalances = false, abis = {}, permitFailure = false, sumChunkSize = undefined } = {}) {
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
    // if (chain === "tron") {
    //   const ethBalances = await Promise.all(ethBalanceInputs.map(getTrxBalance))
    //   ethBalances.forEach(balance => sdk.util.sumSingleBalance(balances, transformAddress(nullAddress), balance))
    // } else {
    const { output: ethBalances } = await sdk.api.eth.getBalances({ targets: ethBalanceInputs, chain, block })
    ethBalances.forEach(({ balance }) => sdk.util.sumSingleBalance(balances, transformAddress(nullAddress), balance))
    // }
  }

  let chunks = [tokensAndOwners]
  if (sumChunkSize)
    chunks = sliceIntoChunks(tokensAndOwners, sumChunkSize)

  for (const tokensAndOwners of chunks) {
    const balanceOfTokens = await sdk.api.abi.multiCall({
      calls: tokensAndOwners.map(t => ({
        target: t[0],
        params: t[1]
      })),
      permitFailure,
      abi: 'erc20:balanceOf',
      block,
      chain,
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
    await sleep(3000) // avoid rate limit issues
  }


  Object.entries(balances).forEach(([token, value]) => {
    if (+value === 0) delete balances[token]
  })

  if (resolveLP || unwrapAll)
    await unwrapLPsAuto({ balances, block, chain, transformAddress, blacklistedLPs, abis })

  if (!skipFixBalances && ['astar', 'harmony', 'kava', 'thundercore', 'klaytn', 'evmos'].includes(chain)) {
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
  }

  return balances
}


const cvx_abi = {
  cvxBRP_pid: "uint256:pid",
  cvxBRP_balanceOf: "function balanceOf(address account) view returns (uint256)",
  cvxBRP_earned: "function earned(address account) view returns (uint256)",
  cvxBRP_rewards: "function rewards(address) view returns (uint256)",
  cvxBRP_userRewardPerTokenPaid: "function userRewardPerTokenPaid(address) view returns (uint256)",
  cvxBRP_stakingToken: "address:stakingToken",
  cvxBooster_poolInfo: "function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)",
  cvxFraxFarm_lockedLiquidityOf: "function lockedLiquidityOf(address) view returns (uint256)",
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


async function unwrapLPsAuto({ api, balances, block, chain = "ethereum", transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens = [], blacklistedLPs = [], abis = {} }) {
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
    if (gasTokenSet.has(token)) return; // if token is a gas token, we ignore it
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
          sdk.log('Unable to resolve LP: ', lpToken);
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
        sdk.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
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
  token,
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
  resolveUniV4 = false,
  resolveSlipstream = false,
  uniV3WhitelistedTokens = [],
  uniV3nftsAndOwners = [],
  resolveArtBlocks = false,
  resolveNFTs = false,
  resolveVlCVX = false,
  permitFailure = false,
  fetchCoValentTokens = false,
  tokenConfig = {},
  sumChunkSize = undefined,
  uniV3ExtraConfig = {
    // positionIds
    // nftAddress
    // nftIdFetcher
  },
  uniV4ExtraConfig = {
    // positionIds
    // nftAddress
    // nftIdFetcher
  },
  resolveIchiVault = false,
  solidlyVeNfts = [],
  convexRewardPools = [],
  auraPools = [],
}) {
  if (api) {
    chain = api.chain ?? chain
    block = api.block ?? block
    if (!balances) balances = api.getBalances()
  } else if (!balances) {
    balances = {}
    api = new sdk.ChainApi({ chain, block })
  }

  if (owner) owners.push(owner)
  if (token) tokens.push(token)
  tokens = getUniqueAddresses(tokens, chain)
  owners = getUniqueAddresses(owners, chain)
  if (owners.length) {
    for (const token of tokens) {
      for (const owner of owners) {
        tokensAndOwners.push([token, owner])
      }
    }
  }

  if (resolveArtBlocks || resolveNFTs) {
    if (!api) throw new Error('Missing arg: api')
    await sumArtBlocks({ balances, api, owner, owners, })
  }

  if (resolveVlCVX && owners.length && chain === 'ethereum') {
    const vlCVXBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: owners, target: ADDRESSES.ethereum.vlCVX })
    vlCVXBals.forEach((v) => sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.vlCVX, v, chain))
  }

  if (fetchCoValentTokens) {
    const cTokens = (await Promise.all(owners.map(i => covalentGetTokens(i, api, tokenConfig))))
    cTokens.forEach((tokens, i) => ownerTokens.push([tokens, owners[i]]))
  }

  if (resolveNFTs) {
    const coreNftTokens = whitelistedNFTs[api.chain] ?? []
    const nftTokens = await Promise.all(owners.map(i => covalentGetTokens(i, api, { onlyWhitelisted: false })))
    nftTokens.forEach((nfts, i) => ownerTokens.push([[nfts, tokens, coreNftTokens].flat(), owners[i]]))
  }

  if (solidlyVeNfts.length) {
    await Promise.all(
      owners.map(
        owner => solidlyVeNfts.map(veNftDetails => unwrapSolidlyVeNft({ api, owner, ...veNftDetails }))
      )
        .flat()
    )
  }

  if (convexRewardPools.length) {
    const convexRewardPoolsTokensAndOwners = convexRewardPools.map(poolAddress => {
      return owners.map(owner => [poolAddress, owner])
    }).flat();
    await unwrapConvexRewardPools({ api, tokensAndOwners: convexRewardPoolsTokensAndOwners });
  }

  if (auraPools.length) {
    const tokensAndOwners = auraPools.map(poolAddress => {
      return owners.map(owner => [poolAddress, owner])
    }).flat();
    Promise.all(
      tokensAndOwners.map(([pool, owner]) => {
        return unwrapAuraPool({ api, auraPool: pool, owner })
      })
    );
  }

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

  if (resolveUniV3 || uniV3nftsAndOwners.length || Object.keys(uniV3ExtraConfig).length)
    await unwrapUniswapV3NFTs({ balances, chain, block, owner, owners, blacklistedTokens, whitelistedTokens: uniV3WhitelistedTokens, nftsAndOwners: uniV3nftsAndOwners, uniV3ExtraConfig, })

  if (resolveUniV4 || Object.keys(uniV4ExtraConfig).length)
    await unwrapUniswapV4NFTs({ balances, chain, block, owner, owners, blacklistedTokens, whitelistedTokens: uniV3WhitelistedTokens, uniV4ExtraConfig, })

  if (resolveSlipstream)
    await unwrapSlipstreamNFTs({ balances, api, owner, owners, blacklistedTokens, whitelistedTokens: uniV3WhitelistedTokens, nftsAndOwners: uniV3nftsAndOwners, uniV3ExtraConfig, })

  blacklistedTokens = blacklistedTokens.map(t => normalizeAddress(t, chain))
  tokensAndOwners = tokensAndOwners.map(([t, o]) => [normalizeAddress(t, chain), o]).filter(([token]) => !blacklistedTokens.includes(token))
  tokensAndOwners = getUniqueToA(tokensAndOwners)
  log(chain, 'summing tokens', tokensAndOwners.length)


  await sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveLP, unwrapAll, blacklistedLPs, skipFixBalances: true, abis, permitFailure, sumChunkSize, })


  if (resolveIchiVault)
    await unwrapHypervisorVaults({ api })


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

async function unwrapHypervisorVaults({ api, lps }) {
  let chain = api.chain
  const balances = api.getBalances()
  let tokens = Object.keys(balances).filter(t => t.startsWith(chain + ':')).map(t => t.split(':')[1])
  if (!lps) {
    const symbols = (await api.multiCall({ abi: 'erc20:symbol', calls: tokens, permitFailure: true })).map(i => i || '')
    lps = tokens.filter((t, i) => isICHIVaultToken(symbols[i], t, chain))
  }

  if (!lps.length) return api.getBalances()

  const [
    token0s, token1s, supplies, uBalances,
  ] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: lps }),
    api.multiCall({ abi: 'address:token1', calls: lps }),
    api.multiCall({ abi: 'uint256:totalSupply', calls: lps }),
    api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 token0Bal, uint256 token1Bal)', calls: lps }),
  ])

  lps.forEach((_, i) => {
    const lpToken = `${chain}:${lps[i]}`
    const bal = balances[lpToken]
    if (!bal) return;
    const ratio = bal / supplies[i]
    const token0Bal = uBalances[i][0] * ratio
    const token1Bal = uBalances[i][1] * ratio
    api.add(token0s[i], token0Bal)
    api.add(token1s[i], token1Bal)
    api.removeTokenBalance(lpToken)
  })

  return api.getBalances()
}

function sumTokensExport({ balances, tokensAndOwners, tokensAndOwners2, tokens, owner, owners, transformAddress, unwrapAll, resolveLP, blacklistedLPs, blacklistedTokens, skipFixBalances, ownerTokens, resolveUniV3, resolveUniV4, resolveSlipstream, resolveArtBlocks, resolveNFTs, fetchCoValentTokens, logCalls, ...args }) {
  return async (api) => sumTokens2({ api, balances, tokensAndOwners, tokensAndOwners2, tokens, owner, owners, transformAddress, unwrapAll, resolveLP, blacklistedLPs, blacklistedTokens, skipFixBalances, ownerTokens, resolveUniV3, resolveUniV4, resolveSlipstream, resolveArtBlocks, resolveNFTs, fetchCoValentTokens, ...args, })
}

async function unwrapAuraPool({ api, chain, block, auraPool, owner, balances, isBPool = false, isV2 = true }) {
  if (!api) {
    api = new sdk.ChainApi({ chain, block, })
  }
  balances = balances || api.getBalances()
  const [lpSupply, lpTokens, balancerToken] = await api.batchCall([
    { abi: 'erc20:totalSupply', target: auraPool },
    { abi: 'erc20:balanceOf', target: auraPool, params: owner },
    { abi: 'address:asset', target: auraPool },
  ]);
  if (+lpTokens === 0) return balances;
  const [vault] = await api.batchCall([
    { abi: 'address:getVault', target: balancerToken },
  ]);
  const auraRatio = lpTokens / lpSupply;
  return unwrapBalancerToken({ api, chain, block, balancerToken, owner: vault, balances, isBPool, isV2, extraRatio: auraRatio })
}

async function unwrapBalancerToken({ api, chain, block, balancerToken, owner, balances, isBPool = false, isV2 = true, extraRatio = 1 }) {
  if (!api) {
    api = new sdk.ChainApi({ chain, block, })
  }
  balances = balances || api.getBalances()
  const [lpSupply, lpTokens] = await api.batchCall([
    { abi: 'erc20:totalSupply', target: balancerToken },
    { abi: 'erc20:balanceOf', target: balancerToken, params: owner },
  ])
  if (+lpTokens === 0) return balances
  const ratio = lpTokens / lpSupply * extraRatio

  if (isV2) {
    const poolId = await api.call({ abi: 'function getPoolId() view returns (bytes32)', target: balancerToken })
    const vault = await api.call({ abi: 'address:getVault', target: balancerToken })
    const [tokens, bals] = await api.call({ abi: 'function getPoolTokens(bytes32) view returns (address[], uint256[],uint256)', target: vault, params: poolId })
    tokens.forEach((v, i) => {
      // handle balancer composable metapools case where the pool contains the LP itself, we can skip it for our calc
      if (v.toLowerCase() !== balancerToken.toLowerCase()) {
        sdk.util.sumSingleBalance(balances, v, bals[i] * ratio, api.chain)
      }
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

function addUniV3LikePosition({ api, token0, token1, liquidity, tickLower, tickUpper, tick }) {
  
  const sa = tickToPrice(tickLower / 2)
  const sb = tickToPrice(tickUpper / 2)

  let amount0 = 0
  let amount1 = 0

  if (tick < tickLower) {
    amount0 = liquidity * (sb - sa) / (sa * sb)
  } else if (tick < tickUpper) {
    const price = tickToPrice(tick)
    const sp = price ** 0.5

    amount0 = liquidity * (sb - sp) / (sp * sb)
    amount1 = liquidity * (sp - sa)
  } else {
    amount1 = liquidity * (sb - sa)
  }

  api.add(token0, amount0)
  api.add(token1, amount1)
}

async function unwrapSolidlyVeNft({ api, baseToken, veNft, owner, hasTokensOfOwnerAbi = false, isAltAbi = false, lockedAbi, nftIdGetterAbi }) {
  let tokenIds
  const _lockedAbi = lockedAbi || (hasTokensOfOwnerAbi || isAltAbi ? SOLIDLY_VE_NFT_ABI.lockedSimple : SOLIDLY_VE_NFT_ABI.locked)
  const _nftIdGetterAbi = nftIdGetterAbi || (isAltAbi ? SOLIDLY_VE_NFT_ABI.tokenOfOwnerByIndex : SOLIDLY_VE_NFT_ABI.ownerToNFTokenIdList)
  if (hasTokensOfOwnerAbi) {
    tokenIds = await api.call({ abi: SOLIDLY_VE_NFT_ABI.tokensOfOwner, params: owner, target: veNft })
  } else {
    const count = await api.call({ abi: 'erc20:balanceOf', target: veNft, params: owner })
    tokenIds = await api.multiCall({ abi: _nftIdGetterAbi, calls: createIncrementArray(count).map(i => ({ params: [owner, i] })), target: veNft })
  }
  const bals = await api.multiCall({ abi: _lockedAbi, calls: tokenIds, target: veNft })
  bals.forEach(i => api.add(baseToken, i.amount))
}

module.exports = {
  PANCAKE_NFT_ADDRESS,
  unwrapUniswapLPs,
  unwrapSlipstreamNFT,
  sumTokens,
  genericUnwrapCvx,
  unwrapLPsAuto,
  isLP,
  nullAddress,
  sumTokens2,
  unwrapBalancerToken,
  sumTokensExport,
  unwrapMakerPositions,
  unwrap4626Tokens,
  unwrapConvexRewardPools,
  addUniV3LikePosition,
  unwrapSolidlyVeNft,
  unwrapHypervisorVaults,
}
