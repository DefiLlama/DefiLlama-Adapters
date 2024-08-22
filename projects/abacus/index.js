const { staking } = require("../helper/staking");

// Abacus contracts
// arbitrum
const abcRAM = '0x9EfCFc5b49390FC3fb9B58607D2e89445Bb380BF';
const abcRAMStake = '0xBD8a830f4Ae6B2355E12E9714FeDB5aE9d71c81D';

// avalanche
const abcPHAR = '0xd5d0A9b3f2C264b955Ae7161cfA6D38A7aEa60a7';
const abcPHARStake = '0x541AdD99620d1294900851dCa2eca06a5c797c3e';

// mantle
const abcCLEO = '0xCffbE0E73c750731EdB38C14Bc81A39dAc91819d';
const abcCLEOStake = '0x498126eDEA7FBb4626585ebc98a8230B8fFa1cC9';

// bsc
const liveTHE = '0xCdC3A010A3473c0C4b2cB03D8489D6BA387B83CD';
const liveTHEStake = '0xD8C61EDe8CD9EE7B93855c3f110191e95eDF2979';

// polygon
const liveRETRO = '0xCaAF554900E33ae5DBc66ae9f8ADc3049B7D31dB';
const liveRETROStake = '0x1de28CB80428C265e7f40A05066B68c31e8d7D0e';

module.exports = {
    misrepresentedTokens: true,
    arbitrum: {
        tvl: staking(abcRAMStake, abcRAM, "arbitrum"),
    },
    avax: {
        tvl: staking(abcPHARStake, abcPHAR, "avax"),
    },
    mantle: {
        tvl: staking(abcCLEOStake, abcCLEO, "mantle"),
    },
    bsc: {
        tvl: staking(liveTHEStake, liveTHE, "bsc"),
    },  
    polygon: {
        tvl: staking(liveRETROStake, liveRETRO, "polygon"),
    },
    methodology: "Counts tokens staked in the Abacus staking contracts across multiple chains",
};