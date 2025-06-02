const { stakings } = require("../helper/staking");
const KOM_TOKEN_CONTRACT_POLYGON = '0xC004e2318722EA2b15499D6375905d75Ee5390B8';
const KOM_STAKING_CONTRACT_POLYGON = [
    "0x453d0a593d0af91e77e590a7935894f7ab1b87ec",
    "0x8d37b12DB32E07d6ddF10979c7e3cDECCac3dC13",
    "0x8d34Bb43429c124E55ef52b5B1539bfd121B0C8D"
];
const KOM_TOKEN_CONTRACT_ARBITRUM = '0xA58663FAEF461761e44066ea26c1FCddF2927B80';
const KOM_STAKING_CONTRACT_ARBITRUM = ["0x5b63bdb6051CcB9c387252D8bd2364D7A86eFC70"];

module.exports = {
    polygon: {
        tvl: () => ({}),
        staking: stakings(KOM_STAKING_CONTRACT_POLYGON, KOM_TOKEN_CONTRACT_POLYGON)
    },
    arbitrum: {
        tvl: () => ({}),
        staking: stakings(KOM_STAKING_CONTRACT_ARBITRUM, KOM_TOKEN_CONTRACT_ARBITRUM)
    },
};
