const { get, } = require("../helper/http")
const config = require("./config");
const { sumTokens, unwrapUniswapLPs, } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { getChainTransform, } = require("../helper/portedTokens");

module.exports = {}

function setChainTVL(chain) {
  const { masterchef, masterchefPools, chocochef, vaults, chainId, treasury, erc20s } = config[chain]
  let getTvl

  async function getAllTVL(ts, _block, chainBlocks) {
    const transform = await getChainTransform(chain)
    const block = chainBlocks[chain]
    const balances = {
      treasury: {},
      tvl: {},
      staking: {},
      pool2: {},
    }

    if (treasury) {
      let toa = erc20s.map(token => [token, treasury])
      balances.treasury = await sumTokens({}, toa, block, chain)
    }

    const toaTvl = []
    const toaSyrup = []
    const toaPool2 = []
    const toaStaking = []
    const syrupMapping = {}

    // handle masterchef
    let pools = await get(masterchefPools)
    pools.forEach(pool => {
      const symbol = pool.lpSymbol?.toLowerCase()
      const addr = pool.lpAddresses[chainId].toLowerCase()
      if (pool.isCLP) {
        const syrup = pool.magicAddresses[chainId].toLowerCase()
        toaSyrup.push([syrup, masterchef])
        syrupMapping[syrup] = addr
        return;
      }
      if (symbol === 'mcrn')
        toaStaking.push([addr, masterchef])
      else if (symbol.includes('mcrn') && symbol.endsWith('lp'))
        toaPool2.push([addr, masterchef])
      else
        toaTvl.push([addr, masterchef])
    })

    // handle chocochef and boost pools
    pools = await get(chocochef)

    if (vaults)
      pools.push(...(await get(vaults)))

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

    await sumTokens(balances.tvl, toaTvl, block, chain, transform, { resolveLP: true })
    await sumTokens(balances.pool2, toaPool2, block, chain, transform, { resolveLP: true })
    await sumTokens(balances.staking, toaStaking, block, chain, transform, { resolveLP: false })
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
    treasury: getTvlFunction('treasury'),
    staking: getTvlFunction('staking'),
  }

  module.exports[chain] = chainExports
}

Object.keys(config).forEach(setChainTVL)