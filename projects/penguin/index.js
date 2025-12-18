const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking');
const abi = require('./abi.json')
const abiGeneral = require('../helper/abis/masterchef.json');
const { default: BigNumber } = require('bignumber.js');

const nest = '0xD79A36056c271B988C5F1953e664E61416A9820F'
const pefiToken = '0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c'
const nestv2 = '0xE9476e16FE488B90ada9Ab5C7c2ADa81014Ba9Ee'

const masterChef = "0x256040dc7b3CECF73a759634fc68aA60EA0D68CB"

const ACC_PEFI_PRECISION = 1e18;

async function getTokensInMasterChef(api) {
  const ignoreAddresses = [pefiToken].map(i => i.toLowerCase())
  const poolInfo = await api.fetchList({ lengthAbi: abiGeneral.poolLength, itemAbi: abi.poolInfo, target: masterChef })

  poolInfo.forEach((pool) => {
    const token = pool[0].toLowerCase()
    if (ignoreAddresses.some(addr => addr === token))
      return;
    const balance = BigNumber(pool.totalShares).times(pool.lpPerShare).div(ACC_PEFI_PRECISION).toFixed(0)
    api.add(token, balance)
  })
  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  avax: {
    staking: staking([nest, nestv2], pefiToken),
    tvl: getTokensInMasterChef,
  }
}
