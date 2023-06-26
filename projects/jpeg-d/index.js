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
    // [1670518800, "APE staking"], not that much impact on TVL
    //[1674669600, "Autoglyphs & Fidenza support"], not that much impact on TVL
    //[1675166400, "Ringers & Chromie Squiggle support"], not that much impact on TVL
    //[1675598400, "70% LTV for CryptoPunks & BAYC"], not that much impact on TVL
    //[1678665600, "Otherdeeds & Meebits support"], 
   // [1679529600, "BAKC support"], not that much impact on TVL
    [1683662400, "P2P Ape Staking"],
    //[1684108800, "Milady support"],
  ],
};
