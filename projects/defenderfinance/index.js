const { pool2s } = require("../helper/pool2");

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

module.exports = {
    bsc: {
        pool2: pool2s(farmContractsBSC, lpPairContractsBSC),
        tvl: () => 0,
    },
    methodology:
        "Counts liquidity on the Farms through Defender Finance Contracts",
};
