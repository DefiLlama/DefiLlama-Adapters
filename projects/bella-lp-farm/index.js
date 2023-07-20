const { api } = require("@defillama/sdk");

const era = "era";
const eth = "ethereum";
const BEL_USDC_POOL = "0x9FB6Ca27D20E569E5c8FeC359C9d33D468d2803C";
const BEL = "0xa91ac63d040deb1b7a5e4d4134ad23eb0ba07e14";
const USDC = "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4";
const IZI = "0x16A9494e257703797D747540f01683952547EE5b";

const getMiningContractInfo = (miningContract) =>
  api.abi.call({
    target: miningContract,
    abi: "function getMiningContractInfo() external view returns (address tokenX_, address tokenY_, uint24 fee_, address iziTokenAddr_, uint256 lastTouchTime_, uint256 totalVLiquidity_, uint256 totalTokenX_, uint256 totalTokenY_, uint256 totalNIZI_, uint256 startTime_, uint256 endTime_)",
    chain: era,
  });

module.exports = {
  era: {
    tvl: async () => {
      const {
        output: { totalTokenX_, totalNIZI_, totalTokenY_ },
      } = await getMiningContractInfo(BEL_USDC_POOL);

      return {
        [`${eth}:${BEL}`]: totalTokenY_,
        [`${era}:${USDC}`]: totalTokenX_,
        [`${era}:${IZI}`]: totalNIZI_,
      };
    },
  },
};
