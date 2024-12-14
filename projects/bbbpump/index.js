const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');
const { stakings } = require("../helper/staking");

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
        staking: stakings(
            ['0x37c00AE5C4b49Ab0F5fD2FFB1033588e9bC33B08'], // Megadrop BBB
            "0xfa4ddcfa8e3d0475f544d0de469277cf6e0a6fd1" ///BBB
        ),
    },
};