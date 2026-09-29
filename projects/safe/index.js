const ADDRESSES = require('../helper/coreAssets.json')

const SAFE = ADDRESSES.ethereum.SAFE;
const VESTING_ID = "0xF7EED36776C9DC083FA957E459DD07F5ABF4D77A97ED1E3356C553368C174762"
const VESTING_ADDRESS = '0x96b71e2551915d98d22c448b040a3bc4801ea4ff'
const VESTING_ABI = "function vestings(bytes32) view returns (address account, uint8 curveType, bool managed, uint16 durationWeeks, uint64 startDate, uint128 amount, uint128 amountClaimed, uint64 pausingDate, bool cancelled)"

const vesting = async (api) => {
  const vestingData = await api.call({ target: VESTING_ADDRESS, params: [VESTING_ID], abi: VESTING_ABI })
  api.add(SAFE, vestingData.amount - vestingData.amountClaimed)
}

module.exports = {
  ethereum : {
    tvl: () => ({  }),
    vesting
  }
}