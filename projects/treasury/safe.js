const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports } = require("../helper/utils");

const SAFE = ADDRESSES.ethereum.SAFE;
const VESTING_ID = "0xF7EED36776C9DC083FA957E459DD07F5ABF4D77A97ED1E3356C553368C174762"
const VESTING_ADDRESS = '0x96b71e2551915d98d22c448b040a3bc4801ea4ff'
const VESTING_ABI = "function vestings(bytes32) view returns (address account, uint8 curveType, bool managed, uint16 durationWeeks, uint64 startDate, uint128 amount, uint128 amountClaimed, uint64 pausingDate, bool cancelled)"

const vesting = async (api) => {
  const vestingData = await api.call({ target: VESTING_ADDRESS, params: [VESTING_ID], abi: VESTING_ABI })
  api.add(SAFE, vestingData.amount - vestingData.amountClaimed)
}

module.exports = mergeExports(
  treasuryExports({
    optimism: {
      tokens: [nullAddress, ADDRESSES.optimism.OP],
      owners: ["0x3EDf6868d7c42863E44072DaEcC16eCA2804Dea1"],
    },
    ethereum: {
      tokens: [nullAddress],
      owners: [
        "0x1d4f25bc16b68c50b78e1040bc430a8097fd6f45",
        "0x0b00b3227a5f3df3484f03990a87e02ebad2f888",
        "0xd28b432f06cb64692379758B88B5fCDFC4F56922",
      ],
      ownTokens: [SAFE],
    },
  }),
  {
    ethereum: { vesting },
  }
)
