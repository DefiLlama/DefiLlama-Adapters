const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const { sumTokens2, } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const { default: BigNumber } = require('bignumber.js')

const aelin_data = {
  'ethereum': {
    logConfig: [
      { target: '0x2c0979b0de5f99c2bde1e698aeca13b55695951e', fromBlock: 13996006 },
      { target: '0x5541da82549d732878c4104c9887c408790397af', fromBlock: 13846412 },
    ],
    'graphUrl': 'https://api.thegraph.com/subgraphs/name/aelin-xyz/aelin',
    'AELIN_ETH_LP': '0x974d51fafc9013e42cbbb9465ea03fe097824bcc',
    'AELIN_ETH_staking': '0x944cb90082fc1416d4b551a21cfe6d7cc5447c80',
    'AELIN': '0xa9c125bf4c8bb26f299c00969532b66732b1f758'
  },
  'optimism': {
    logConfig: [
      { target: '0x9219f9f65b007fd3ba0b53762861f54062531a31', fromBlock: 2266169 },
      { target: '0x87525307974a312AF13a78041F88B0BAe23ebb10', fromBlock: 1487918 },
      { target: '0x914ffc8dc0678911aae77f51b8489d6e214da20f', fromBlock: 1971285 },
    ],
    'graphUrl': 'https://api.thegraph.com/subgraphs/name/aelin-xyz/optimism',
    'AELIN': '0x61BAADcF22d2565B0F471b291C475db5555e0b76',
    'AELIN_staking': '0xfe757a40f3eda520845b339c698b321663986a4d',
    'AELIN_ETH_LP': '0x665d8D87ac09Bdbc1222B8B9E72Ddcb82f76B54A',
    'AELIN_ETH_staking': '0x4aec980a0daef4905520a11b99971c7b9583f4f8',
    'vAELIN': '0x780f70882fF4929D1A658a4E8EC8D4316b24748A',
  },
}

function tvl(chain) {
  return async (api) => {
    const { logConfig } = aelin_data[chain]
    const logs = (await Promise.all(logConfig.map(({ target, fromBlock }) => getLogs({
      api,
      target,
      topics: ['0x2f9902ccfa1b25adff84fa12ff5b7cbcffcb5578f08631567f5173b39c3004fe'],
      fromBlock,
      eventAbi: 'event CreatePool(address indexed poolAddress, string name, string symbol, uint256 purchaseTokenCap, address indexed purchaseToken, uint256 duration, uint256 sponsorFee, address indexed sponsor, uint256 purchaseDuration, bool hasAllowList)'
    })
    ))).flat()

    return sumTokens2({ api, tokensAndOwners: logs.map(i => ([i.args.purchaseToken, i.args.poolAddress])) })
  }
}

function stakingTVL(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    if (chain === 'ethereum') {
      return {}
    }

    const staked = await staking(
      aelin_data[chain]['AELIN_staking'],
      aelin_data[chain]['AELIN'],
      chain
    )(timestamp, ethBlock, chainBlocks)
    return staked
  }
}

function pool2TVL(chain) {
  return async (api) => {
    const stakingContract = aelin_data[chain]['AELIN_ETH_staking']
    const lpToken = aelin_data[chain]['AELIN_ETH_LP']

    if (chain === 'ethereum') {
      const staked = await pool2(stakingContract, lpToken, chain)(api)
      const aelin_addr = `ethereum:${aelin_data[chain]['AELIN']}`
      staked['AELIN'] = BigNumber(staked[aelin_addr]).div(1e18).toFixed(0)
      staked[aelin_addr] = 0
      return staked
    }
    else if (chain === 'optimism') {
      const bal = await api.call({ abi: 'erc20:balanceOf', target: lpToken, params: stakingContract, })
      const supply = await api.call({ abi: 'erc20:totalSupply', target: lpToken, })
      const token0 = await api.call({ abi: 'address:token0', target: lpToken, })
      const token1 = await api.call({ abi: 'address:token1', target: lpToken, })
      const { bal0, bal1 } = await api.call({ abi: 'function getUnderlyingBalances() view returns (uint256 bal0, uint256 bal1)', target: lpToken, })
      const ratio = bal/supply
      api.add(token0, ratio*bal0)
      api.add(token1, ratio*bal1)

      return api.getBalances()
    }
  }
}

module.exports = {
  ethereum: {
    tvl: tvl('ethereum'),
    pool2: pool2TVL('ethereum'),
  },
  optimism: {
    tvl: tvl('optimism'),
    staking: stakingTVL('optimism'),
    pool2: pool2TVL('optimism'),
  },
  methodology: 'Aelin TVL consists of purchaseTokens held by pools, as well as AELIN token (staking) and LP (pool2) staked to receive a share of the revenue',
}
