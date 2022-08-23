const { staking } = require("../helper/staking");

const MasterChefContract = "0xdfAa0e08e357dB0153927C7EaBB492d1F60aC730";
const BABY = "0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657";

// node test.js projects/babyswap/index.js

/*
module.exports = {
  timetravel: true,
  bsc: {
    staking: staking(MasterChefContract, BABY, "bsc"),
    tvl: bscTvl,
  },
  methodology:
    "We count liquidity on the Farms (LP tokens) and Pools (single tokens) seccions threw MasterChef Contract",
};*/
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
module.exports = {
    methodology: `Uses factory(0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    doublecounted: false,
    timetravel: true,
    incentivized: true,
    bsc: {
        tvl: calculateUsdUniTvl(
            "0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da",
            "bsc",
            "0x55d398326f99059ff775485246999027b3197955",
            [
                "0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657",
                "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
                "0xe9e7cea3dedca5984780bafc599bd69add087d56",
                "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
                "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
                "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
                "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
                "0xba2ae424d960c26247dd6c32edc70b295c744c43"
            ],
            "tether"
        ),
        staking: staking(MasterChefContract, BABY, "bsc"),
    }
};


