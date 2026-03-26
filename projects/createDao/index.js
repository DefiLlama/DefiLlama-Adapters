const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

const FACTORY = '0xc852E5Cb44C50614a82050163aB7170cB88EB5F9'
const deployedDAOs_ABI = 'function deployedDAOs(uint256) view returns (address token, address timelock, address governor, address creator, string daoName, uint256 createdAt)'
const coreTokens = [ADDRESSES.null, ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.DAI, ADDRESSES.ethereum.WBTC];

const tvl = async (api) => {
  const owners = [], blacklistedTokens = []
  const DAOs = await api.fetchList({ target: FACTORY, lengthAbi: 'uint256:getDAOCount', itemAbi: deployedDAOs_ABI })
  DAOs.forEach(d => { owners.push(d.timelock); blacklistedTokens.push(d.token) })
  return sumTokens2({ api, owners, tokens: coreTokens, blacklistedTokens })
}

module.exports = {
  methodology: 'Tvl counts all assets held in DAO treasury (TimelockController) contracts created through the CreateDAO v2 factory. Governance tokens created by each DAO are exported separately as ownTokens.',
  ethereum: { tvl }
}