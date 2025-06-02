const abi = require("./abi.json");
const config = require("./config");
const { sumTokensExport, sumTokens2, } = require("../helper/unwrapLPs");

function setChainTVL(chain) {
  const { masterchef, pools, vaults_json, LPs, token, } = config[chain]
  const stakingOwners = [masterchef]
  const pool2Owners = [masterchef]
  if (vaults_json) {
    vaults_json.forEach(pool => {
      const symbol = pool.stakingToken?.symbol?.toLowerCase()
      const addr = pool.stakingToken.address.toLowerCase()
      if (symbol === 'mcrn')
        stakingOwners.push(addr)
      else if (symbol.includes('mcrn') && symbol.endsWith('lp')) {
        LPs.push(addr)
        pool2Owners.push(pool.contractAddress.toLowerCase())
      }
    })
  }

  const blacklistedTokens = [...LPs, token]
  async function tvl(api) {
    const tokensAndOwners = []

    const masterchefPools = await api.fetchList({ target: masterchef, lengthAbi: abi.poolLength, itemAbi: abi.poolInfo })

    const toaSyrup = []
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
      tokensAndOwners.push([addr, masterchef])
    })

    // handle chocochef and boost pools
    if (vaults_json)
      pools.push(...vaults_json)

    pools.forEach(pool => {
      const masterchef = pool.contractAddress
      const addr = pool.stakingToken.address
      tokensAndOwners.push([addr, masterchef])
    })


    const balanceCalls = toaSyrup.map(([token, address]) => ({ target: token, params: [address] }))
    const syrupBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls, })

    syrupBalances.forEach((bal, i) => {
      api.add(syrupMapping[toaSyrup[i][0]], bal)
    })

    return sumTokens2({ api, tokensAndOwners, blacklistedTokens, resolveLP: true })
  }

  module.exports[chain] = {
    tvl,
    pool2: sumTokensExport({ tokens: LPs, owners: pool2Owners, resolveLP: true }),
    staking: sumTokensExport({ token, owners: stakingOwners, }),
  }
}

Object.keys(config).forEach(setChainTVL)