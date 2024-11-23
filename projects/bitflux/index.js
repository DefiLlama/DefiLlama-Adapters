const { sumTokensExport } = require("../helper/unwrapLPs");

const swapFlashLoan = '0x4bcb9Ea3dACb8FfE623317E0B102393A3976053C';

const ADDRESSES = {
    'WBTC': "0x5832f53d147b3d6Cd4578B9CBD62425C7ea9d0Bd",
    "solvBTCb": "0x5b1fb849f1f76217246b8aaac053b5c7b15b7dc3",
    "solvBTCcore": "0x9410e8052bc661041e5cb27fdf7d9e9e842af2aa"
}

module.exports = {
    core: {
        tvl: sumTokensExport(
            {
                owner: swapFlashLoan,
                tokens: [ADDRESSES.WBTC, ADDRESSES.solvBTCb, ADDRESSES.solvBTCcore]
            }),
    }
}