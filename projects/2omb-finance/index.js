const { staking } = require('../helper/staking');
const { pool2Exports } = require('../helper/pool2');

const token = "0x7a6e4E3CC2ac9924605DCa4bA31d1831c84b44aE";
const shares = "0xc54a1684fd1bef1f077a336e6be4bd9a3096a6ca";
const masonry = "0x627A83B6f8743c89d58F17F994D3F7f69c32F461";
const rewardPool = "0x8D426Eb8C7E19b8F13817b07C0AB55d30d209A96";

const pool2LPs = [
    "0xbdC7DFb7B88183e87f003ca6B5a2F81202343478", // 2OMB-FTM spLP
    "0x6398ACBBAB2561553a9e458Ab67dCFbD58944e52" // 2SHARE-WFTM spLP
]

module.exports = {
    fantom: {
        tvl: async () => ({}),
        staking: staking(masonry, shares, "fantom"),
        pool2: pool2Exports(rewardPool, pool2LPs, "fantom")
    }
}