const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");


const MM3BasePool = "0x61bB2F4a4763114268a47fB990e633Cb40f045F8";
const DAI = "0xF2001B145b43032AAF5Ee2884e456CCd805F677D";
const USDT = ADDRESSES.cronos.USDT;
const USDC = ADDRESSES.cronos.USDC;


async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    await sumTokensAndLPsSharedOwners(
        balances,
        [
            [USDT, false],
            [USDC, false],
            [DAI, false],
        ],
        [MM3BasePool],
        chainBlocks["cronos"],
        'cronos',
        addr=>`cronos:${addr}`,
    );

    return balances;
}

module.exports = {
    doublecounted: true,
    cronos:{
        tvl,
    },
    methodology: "Counts DAI, USDC, & USDT tokens on the 3MM Base Pool for tvl",
};
