const { sumTokensExport } = require("../helper/unwrapLPs");

const native_staking_contract = "0x9212456Da7804245BDF02e7294E4f36D27f9c2B1";
const usdc_staking_contract = "0xa8CD01322Ad632c9656879e99Fd7FbC11ca8E3BB";
const sydx_staking_contract = "0xB2bD1427b04d84eA14214582C59CB16D4F1d676E";
const native_usdc_farming_contract = "0x3F90A802B5D6E984A6f296F697AB847C5fE23F31";
const native_sydx_farming_contract = "0xDA24F9528102A5A126Cd7eeE8c6e22A786cAE844";
const sydx_usdc_farming_contract = "0x75aC887df149076b7DF4deAA0267711475b71572";

const assets = [
  "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
  "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
  "0x0000000000000000000000000000000000000000" // This is address of native token (ETH), you can check native_staking_contract
];
const SYNC_DEX = '0x3a34FA9a1288597Ad6C1Da709f001D37FeF8b19e'

const owners = [native_staking_contract, usdc_staking_contract, sydx_staking_contract, native_usdc_farming_contract, native_sydx_farming_contract, sydx_usdc_farming_contract]

module.exports = {
  era: {
    tvl: sumTokensExport({ owners, tokens: assets }),
    staking: sumTokensExport({ owners, tokens: [SYNC_DEX] }),
  },
};
