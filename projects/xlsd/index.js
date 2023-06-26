const { sumTokensExport } = require("../helper/unwrapLPs");

const LSD_TOKENS = ['0x22aB6bC52CAD84AAe84bD5781258677a6E0cFaB0', '0xce3a75572bc375476438206f6F29f46F8466EcC2', '0xC56dC613C8EF3C57314171d73EAEFE87Aa469186'];
const STAKING_POOL_ADDRESS = ['0x675B74A939fF8b16bA90Af9Cc9e6981a7975401E', '0x7931bfCeeD6FC04D35de75608F2977F3d3a69bc5', '0x77b16981d200dFe89Dd3AD5dc3238967646DDB28'];

module.exports = {
  methodology: "TVL of Staked ETH & LSD tokens in the StakingPool contracts",
  arbitrum: {
    tvl: () => ({}),
    staking: sumTokensExport({ tokensAndOwners2: [LSD_TOKENS, STAKING_POOL_ADDRESS], }),
  },
};
