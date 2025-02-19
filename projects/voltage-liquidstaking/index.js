const ADDRESSES = require('../helper/coreAssets.json')

const FUSE_STAKING_ADDRESS = "0xa3dc222eC847Aac61FB6910496295bF344Ea46be".toLowerCase()

async function tvl(api) {
  const bal = await api.call({ abi: 'uint256:systemTotalStaked', target: FUSE_STAKING_ADDRESS })
  api.add(ADDRESSES.fuse.WFUSE, bal)
  return api.getBalances()
}

module.exports = {
  fuse: { tvl }
}