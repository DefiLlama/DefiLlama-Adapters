const tokenAddresses = require('../constant');
const { vaults } = require('./vaults');
const { staking } = require('../../../helper/staking')
const ADDRESSES = require('../../../helper/coreAssets.json')

const getEthereumStaking = staking(tokenAddresses.sOnx, tokenAddresses.onx)

const getEthereumBorrows = async (api) => {
  api.add(ADDRESSES.null, await api.call({ target: tokenAddresses.pool, abi: 'uint256:totalBorrow' }))
}

async function getEthereumPoolTvl(api) {
  const pools = ['0xAdb6d1cB866a52C5E8C1e79Ff8e0559c12F4D7a3']
  const tokens = ['0x0652687e87a4b8b5370b05bc298ff00d205d9b5f']
  const bals = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: pools })
  api.addTokens(tokens, bals)
  return api.sumTokens({ owners: [tokenAddresses.onxFarm, tokenAddresses.onxTripleFarm], tokens: ['0x0652687e87a4b8b5370b05bc298ff00d205d9b5f', tokenAddresses.onxWethSushiPair] })
}

async function ethTvl(api) {
  await Promise.all([addFarmTvl, addOnePoolTvl, addVaultTvl, addOneVaultTvl, ethStakeTvl ].map(i => i()))

  async function ethStakeTvl() {
    let totalStake = await api.call({ target: tokenAddresses.pool, abi: 'uint256:totalStake' })
    let totalBorrow = await api.call({ target: tokenAddresses.pool, abi: 'uint256:totalPledge' })
    api.add(ADDRESSES.null, totalStake - totalBorrow)
  }


  async function addVaultTvl() {
    const pools = vaults.map(i => i[1])
    const tokens = vaults.map(i => i[0])
    const bals = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: pools })
    api.addTokens(tokens, bals)
  }

  async function addFarmTvl() {
    const farm = '0x168f8469ac17dd39cd9a2c2ead647f814a488ce9'
    const pools = await api.fetchList({ lengthAbi: 'uint256:poolLength', itemAbi: 'function poolInfo(uint256) view returns (address token, uint256,uint256,uint256)', target: farm })
    return api.sumTokens({ owner: farm, tokens: pools.map(i => i.token), blacklistedTokens: ['0x0652687e87a4b8b5370b05bc298ff00d205d9b5f', tokenAddresses.onxWethSushiPair] })
  }
  async function addOnePoolTvl() {
    const pools = tokenAddresses.onePools
    const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: pools })
    return api.sumTokens({ tokensAndOwners2: [tokens, pools] })
  }

  async function addOneVaultTvl() {
    const vault = tokenAddresses.oneVault
    const aETH = await api.call({ abi: 'address:aEth', target: vault })
    const aETHb = await api.call({ abi: 'address:aETHb', target: vault })
    return api.sumTokens({ tokens: [aETH, aETHb], owner: vault })
  }
}

module.exports = {
  getEthereumStaking,
  getEthereumPoolTvl,
  getEthereumBorrows,
  ethTvl,
}
