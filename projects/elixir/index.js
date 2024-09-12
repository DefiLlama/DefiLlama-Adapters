const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const DEUSD_LP_STAKING = "0xC7963974280261736868f962e3959Ee1E1B99712";
const COMMITS = "0x4265f5D6c0cF127d733EeFA16D66d0df4b650D53";
const FOUNDATION = "0x4B4EEC1DDC9420a5cc35a25F5899dC5993f9e586";
const deUSD = "0x15700b564ca08d9439c58ca5053166e8317aa138"

const tokens = [
  "0xb478Bf40dD622086E0d0889eeBbAdCb63806ADde", // DEUSD/DAI Curve LP
  "0x88DFb9370fE350aA51ADE31C32549d4d3A24fAf2", // DEUSD/FRAX Curve LP
  "0x5F6c431AC417f0f430B84A666a563FAbe681Da94", // DEUSD/USDC Curve LP
  "0x7C4e143B23D72E6938E06291f705B5ae3D5c7c7C", // DEUSD/USDT Curve LP
];

const tvl = async (api) => {
  const deusdSupply = await api.call({ target: deUSD, abi: "erc20:totalSupply" })
  api.sumTokens({ owners: [COMMITS, FOUNDATION], tokens: [ADDRESSES.ethereum.STETH, ADDRESSES.null] })
  api.add(deUSD, deusdSupply);
};

module.exports = {
  ethereum: {
    tvl,
    pool2: sumTokensExport({ owner: DEUSD_LP_STAKING, tokens })
  },
};
