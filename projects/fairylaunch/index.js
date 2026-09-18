const { nullAddress } = require('../helper/tokenMapping')

const FACTORY = '0x28163d7943AA6715a9559D468B29c0343412E236';

const getLaunchAbi = 'function getLaunch(uint256) view returns (tuple(uint256 launchId, address creator, address treasury, address token, address bondingCurve, bool graduated, uint256 createdAt, uint256 graduatedAt, string name, string symbol, string metadataUri))'

async function tvl(api) {
  const launches = await api.fetchList({ target: FACTORY, lengthAbi: 'uint:launchCounter', itemAbi: getLaunchAbi, startFromOne: true})
  const owners = launches.filter(l => !l.graduated && l.bondingCurve !== nullAddress).map(l => l.bondingCurve)
  return api.sumTokens({ owners, tokens: [nullAddress] })
}

module.exports = {
  bsc: { tvl },
};