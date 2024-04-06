const abi = require('./abi.json')
const { staking } = require('../helper/staking');

const steakMasterChef = '0xddBfBd5dc3BA0FeB96Cb513B689966b2176d4c09';

async function tvl(api) {
  const poolInfos = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: steakMasterChef})
  poolInfos.forEach(i => api.add(i.lpToken, i.totalLpSupply))
  return api.getBalances()
}

const steakToken = "0xb279f8DD152B99Ec1D84A489D32c35bC0C7F5674"

module.exports = {
  start: 14003811,
  methodology: 'Counts the value of JLP tokens staked into SteakMasterChef.',
  avax: {
    tvl,
    staking: staking(steakMasterChef, steakToken),
  }
}; 
