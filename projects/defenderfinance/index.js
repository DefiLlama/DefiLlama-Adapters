const { pool2s } = require("../helper/pool2");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");


/*** BSC Addresss ***/
const SWDB_TOKEN = "0xc91324601B20ea0e238B63c9fAfca18d32600722";

const farmContractsBSC = [
    //Share Rewards Pool 
    "0xDFfD5c4FA736f696ebdbbB68ff1D5a4Ca0E70d48",
];

const lpPairContractsBSC = [
    //SWDB_ETH_LP
    "0x4a931BD6Ab3ab804ae392223C5920426C153DA25",
    //SHARE_WBNB_LP
    "0x3f344fcA3EB75a745878355E065b58B4EfDE2575"
]

const treasuryContractsBSC = [
    "0x3068405d5A640028463856D0dbDAE13B41AccE1f",
];

async function bscTreasury(chainBlocks) {
    const balances = {};

    let transform = await transformBscAddress();
    await sumTokensAndLPsSharedOwners(
        balances,
        [[SWDB_TOKEN, false]],
        treasuryContractsBSC,
        chainBlocks["bsc"],
        "bsc",
        transform
    );

    return balances;
}

module.exports = {
    bsc: {
        treasury: bscTreasury,
        pool2: pool2s(farmContractsBSC, lpPairContractsBSC, "bsc"),
    },
    tvl: async => ({}),
    methodology:
        "Counts liquidity on the Farms through AlpacaFarm Contracts; and there are Staking and Pool2 parts only. We export the comunity amount as Treasury Part",
};
