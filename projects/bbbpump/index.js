const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');
const { stakingPricedLP } = require("../helper/staking");

// Contract addresses
const MegadropBBB = "0x37c00AE5C4b49Ab0F5fD2FFB1033588e9bC33B08";  // Megadrop BBB
const BBB = "0xfa4ddcfa8e3d0475f544d0de469277cf6e0a6fd1";          // BBB Token
const XDC_BBB_LP = "0xf8ca0db7eba5e0760b66d77cb83a15fde9ad0e20";   // XDC-BBB LP Token

module.exports = {
    start: '2024-10-10',
    xdc: {
        tvl: sumTokensExport({
            owners: [
                '0x2E24BFdE1EEDa0F1EA3E57Ba7Ff10ac6516ab5Ec', // BBBPump
            ],
            tokens: [
                nullAddress
            ]
        }),
        staking: stakingPricedLP(MegadropBBB, BBB, "xdc", XDC_BBB_LP, "wrapped-xdc"),
    },
};