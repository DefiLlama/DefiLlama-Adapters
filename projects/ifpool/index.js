const ADDRESSES = require('../helper/coreAssets.json')

const validatorContract = ADDRESSES.findora.FRA;
const validatorAddress = "0xb0dC7A676Ab09868eBef78E16e6AEA9e79F0f9Cf";

async function coinexTVL(api) {
  const validatorInfo = await api.call({
    target: validatorContract,
    abi: 'function getValidatorInfo(address validator) view returns (address, uint8, uint256, uint256, uint256, uint256, address[])',
    params: [validatorAddress],
  });
  api.add(ADDRESSES.findora.WCET, validatorInfo[2])
}

module.exports = {
  methodology: "Counts staked CET tokens.",
  timetravel: false,
  csc: {
    tvl: coinexTVL,
  },
};
