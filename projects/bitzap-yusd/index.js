const ADDRESSES = require('../helper/coreAssets.json')

const controller = '0x487e869353977411142de3a776bc2cd9f3197164'

const abis = {
  nLoans: 'function n_loans() view returns (uint256)',
  loans: 'function loans(uint256 arg0) view returns (address)',
  userState: 'function user_state(address user) view returns (uint256[4])'
}

const tvl = async (api) => {
  const users = await api.fetchList({ target: controller, itemAbi: abis.loans, lengthAbi: abis.nLoans })
  const userInfos = await api.multiCall({ calls: users.map((user) => ({ target: controller, params: [user] })), abi: abis.userState })
  userInfos.forEach(([coll]) => { api.add(ADDRESSES.ethereum.WBTC, coll / 1e10, { skipChain: true })})
}

module.exports = {
  btr: { tvl }
}
