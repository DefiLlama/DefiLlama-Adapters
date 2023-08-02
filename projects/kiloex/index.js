const ADDRESSES = require("../helper/coreAssets.json");
const {sumTokens2} = require("../helper/unwrapLPs");

const contracts = ["0x1390f521A79BaBE99b69B37154D63D431da27A07"];

const tokens = [
    ADDRESSES.bsc.USDT,
];

async function tvl(timestamp, block) {
    return sumTokens2({owner: contracts[0], tokens: tokens, chain: 'bsc', block});
}

module.exports = {
    start: 1690971144,
    ethereum: {tvl},
};