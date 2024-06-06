const { staking } = require("../helper/staking");
const { tvl, stakingJPEGD } = require("./helper/index");
const { LP_STAKING, JPEG_WETH_SLP } = require("./helper/addresses");

module.exports = {
  methodology: `Counts the floor value of all NFTs supplied in the protocol vaults`,
  ethereum: {
    tvl,
    staking: stakingJPEGD,
    pool2: staking(LP_STAKING, [JPEG_WETH_SLP]),
  },
  hallmarks: [
    [1666003500, "pETH borrows"],
    [1669551000, "JPEG LTV boost"],
    [1670518800, "APE staking"],
    [1674669600, "Autoglyphs & Fidenza support"],
    [1675166400, "Ringers & Chromie Squiggle support"],
    [1675598400, "70% LTV for CryptoPunks & BAYC"],
    [1678665600, "Otherdeeds support"],
    [1678665600, "Meebits support"],
    [1679529600, "BAKC support"],
    [1683662400, "P2P Ape Staking"],
    [1684108800, "Milady support"],
    [1690730000, "pETH-ETH Curve pool drained"],
    [1692651600, "pETH-WETH relaunch"],
    [1694680200, "pETH Citadel relaunch"],
  ],
};
