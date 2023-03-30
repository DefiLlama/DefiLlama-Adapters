const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { tvl } = require("./helper/index");
const {
  LP_STAKING,
  JPEG,
  STAKING_CONTRACT,
  JPEG_WETH_SLP,
} = require("./helper/addresses");

module.exports = {
  methodology: `Counts the floor value of all NFTs supplied in the protocol vaults`,
  ethereum: {
    tvl,
    staking: staking(STAKING_CONTRACT, JPEG, "ethereum"),
    pool2: pool2(LP_STAKING, JPEG_WETH_SLP, "ethereum"),
  },
  hallmarks: [
    [1666003500, "pETH borrows"],
    [1669551000, "JPEG LTV boost"],
    [1670518800, "APE staking"],
    [1674669600, "Autoglyphs & Fidenza support"],
  ],
};
