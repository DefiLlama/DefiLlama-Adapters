const ADDRESSES = require('../helper/coreAssets.json')

const stateContract = "0x4e908F706f8935f10C101Ea3D7B2DEfc78df284e"

async function tvl(api) {
  const bals = await api.call({ abi: 'uint256:getTotalDaiReserves', target: stateContract })
  api.add(ADDRESSES.arbitrum.DAI, bals)
}

module.exports = {
  arbitrum: {
    tvl
  }
}