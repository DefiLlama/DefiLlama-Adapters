const abi = {
    "getAllFarms": "function getAllFarms() view returns (tuple(address stakeToken, uint256 allocationPoint, uint256 lastUpdateBlock, uint256 rewardPerStakeWithBuffer)[])",
    "symbol": "string:symbol",
    "getIBPrice": "function getIBPrice(address originToken) view returns (uint256 ibPriceWithPrecision, uint256 precision)",
    "getNativeIBPrice": "function getNativeIBPrice() view returns (uint256 ibPriceWithPrecision, uint256 precision)"
  };
const { sumTokens2 } = require("../helper/unwrapLPs");

const farmContract = "0x1aF28E7b1A03fA107961897a28449F4F9768ac75";

const bscTvl = async (api) => {
  const getAllFarms = (await api.call({ abi: abi.getAllFarms, target: farmContract, })).map((st) => st.stakeToken);
  return sumTokens2({ api, resolveLP: true, owner: farmContract, tokens: getAllFarms})
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "We count liquidity on the Farms through Farm Contract",
};
