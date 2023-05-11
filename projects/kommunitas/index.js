const { stakings } = require("../helper/staking");
const KOM_TOKEN_CONTRACT = '0xC004e2318722EA2b15499D6375905d75Ee5390B8';
const KOM_STAKING_CONTRACT = [
    "0x453d0a593d0af91e77e590a7935894f7ab1b87ec",
    "0x8d37b12DB32E07d6ddF10979c7e3cDECCac3dC13"
];

module.exports = {
    polygon: {
        tvl: () => ({}),
        staking: stakings(
            KOM_STAKING_CONTRACT,
            KOM_TOKEN_CONTRACT,
            "polygon",
            `polygon:${KOM_TOKEN_CONTRACT}`
        )
    }
};