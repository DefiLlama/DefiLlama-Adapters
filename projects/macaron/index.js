const abi = require("./abi.json");
const config = require("./config");
const { sumTokens, unwrapUniswapLPs, } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const { getChainTransform, } = require("../helper/portedTokens");

module.exports = {}

function setChainTVL(chain) {
  const { masterchef, pools, vaults_json, chainId, erc20s, LPs, token, } = config[chain]
  let getTvl

  async function getAllTVL(ts, _block, chainBlocks) {
    const transform = await getChainTransform(chain)
    const block = chainBlocks[chain]
    const balances = {
      tvl: {},
      staking: {},
      pool2: {},
    }

    const lengthOfPool = (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: masterchef,
        chain, block,
      })
    ).output

    const lpPositionCalls = [];

    for (let index = 0; index < lengthOfPool; index++)
      lpPositionCalls.push({ params: [index] })

    const { output: mcPools } = await sdk.api.abi.multiCall({
      target: masterchef, calls: lpPositionCalls, block, chain, abi: abi.poolInfo
    })

    const masterchefPools = []

    mcPools.forEach(({ output }) => {
      masterchefPools.push(output)
    })

    const toaTvl = []
    const toaSyrup = []
    const toaPool2 = []
    const toaStaking = []
    const syrupMapping = {}

    // handle masterchef
    masterchefPools.forEach(pool => {
      const addr = pool.lpToken.toLowerCase()
      if (pool.isCLP) {
        const syrup = pool.syrupToken.toLowerCase()
        toaSyrup.push([syrup, masterchef])
        syrupMapping[syrup] = addr
        return;
      }
      if (addr === token)
        toaStaking.push([addr, masterchef])
      else if (LPs.includes(addr))
        toaPool2.push([addr, masterchef])
      else
        toaTvl.push([addr, masterchef])
    })

    // handle chocochef and boost pools
    if (vaults_json)
      pools.push(...vaults_json)

    pools.forEach(pool => {
      const symbol = pool.stakingToken?.symbol?.toLowerCase()
      const masterchef = pool.contractAddress[chainId].toLowerCase()
      const addr = pool.stakingToken.address[chainId].toLowerCase()
      if (symbol === 'mcrn')
        toaStaking.push([addr, masterchef])
      else if (symbol.includes('mcrn') && symbol.endsWith('lp'))
        toaPool2.push([addr, masterchef])
      else
        toaTvl.push([addr, masterchef])
    })


    const balanceCalls = toaSyrup.map(([token, address]) => ({ target: token, params: [address] }))
    const { output: syrupBalances } = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf', calls: balanceCalls, block, chain
    })

    const lpPositions = []
    syrupBalances.forEach(({ input, output }) => {
      lpPositions.push({
        token: syrupMapping[input.target],
        balance: output
      })
    })

    await sumTokens(balances.tvl, toaTvl, block, chain, transform)
    await sumTokens(balances.pool2, toaPool2, block, chain, transform)
    await sumTokens(balances.staking, toaStaking, block, chain, transform)
    await unwrapUniswapLPs(balances.tvl, lpPositions, block, chain, transform)
    return balances
  }

  function getTvlFunction(key) {
    return async (ts, _block, chainBlocks) => {
      if (!getTvl) getTvl = getAllTVL(ts, _block, chainBlocks)
      return (await getTvl)[key]
    }
  }

  const chainExports = {
    tvl: getTvlFunction('tvl'),
    pool2: getTvlFunction('pool2'),
    staking: getTvlFunction('staking'),
  }

  module.exports[chain] = chainExports
}

Object.keys(config).forEach(setChainTVL)