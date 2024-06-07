const { stakings } = require("../helper/staking");

const GRACY_TOKEN = "0x7c95e7ad2b349dc2f82d0f1117a44b561fa2699a";
const STAKING_CONTRACT_SEASON_1 = "0x76A2A3ebeCc73871cc24e4807C4cBA57D03b0b2c";
const STAKING_CONTRACT_SEASON_2 = "0xa0EE760C52b10d2A21E563526248CA389D9C47E6";
const STAKING_CONTRACT_SEASON_3 = "0xAb6aD663b42c7031b52737cbcBF9f70cb88fD9FC";
const STAKING_CONTRACT_SEASON_4 = "0x4f1043ABb51648E817b8e62EcABc157F91E61c52";

module.exports = {
    ethereum: {
        tvl: () => ({}),
        staking: stakings([
            STAKING_CONTRACT_SEASON_1,
            STAKING_CONTRACT_SEASON_2,
            STAKING_CONTRACT_SEASON_3,
            STAKING_CONTRACT_SEASON_4,
        ], GRACY_TOKEN),
    },
};
