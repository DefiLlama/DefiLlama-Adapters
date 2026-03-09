const { stakings } = require("../helper/staking");
const KOM_TOKEN_CONTRACT_POLYGON = '0xC004e2318722EA2b15499D6375905d75Ee5390B8';
const KOM_STAKING_CONTRACT_POLYGON = [
    "0x453d0a593d0af91e77e590a7935894f7ab1b87ec",
    "0x8d37b12DB32E07d6ddF10979c7e3cDECCac3dC13",
    "0x8d34Bb43429c124E55ef52b5B1539bfd121B0C8D"
];
const KOM_TOKEN_CONTRACT_ARBITRUM = '0xA58663FAEF461761e44066ea26c1FCddF2927B80';
const KOM_STAKING_CONTRACT_ARBITRUM = ["0x5b63bdb6051CcB9c387252D8bd2364D7A86eFC70"];
const KOM_TOKEN_CONTRACT_BSC = '0x3cd886be588685484528cbf6494729922e4e89c6';
const KOM_STAKING_CONTRACT_BSC = ["0x47fEAab70363fBE9eD3eb5E3037c18361FA7Bb74"];

module.exports = {
    polygon: {
        tvl: () => ({}),
        staking: () => ({}), // old KOM token staking contract
    },
    arbitrum: {
        tvl: () => ({}),
        staking: () => ({}), // old KOM token staking contract
    },
    bsc: {
        staking: stakings(KOM_STAKING_CONTRACT_BSC, KOM_TOKEN_CONTRACT_BSC)
    }
};
