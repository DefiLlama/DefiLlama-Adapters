const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require("../helper/unwrapLPs");

const swapFlashLoan = '0x2D027B49B8960810F84D5fE172d07FFf62311852';

const tokens = {
    DAI: {
        boba: ADDRESSES.boba.DAI,
        eth: ADDRESSES.ethereum.DAI
    },
    USDT: {
        boba: ADDRESSES.boba.USDT,
        eth: ADDRESSES.ethereum.USDT
    },
    USDC: {
        boba: ADDRESSES.boba.USDC,
        eth: ADDRESSES.ethereum.USDC
    }
};

function transform(address) {
    for (let token of Object.keys(tokens)) {
        if (tokens[token].boba == address) {
            return tokens[token].eth;
        }
    }
    
    return address;
}

async function tvl(timestamp, block, chainBlocks) {
    block = chainBlocks.boba;
    const balances = {};

    await sumTokens(
        balances,
        [
            [tokens.DAI.boba, swapFlashLoan],
            [tokens.USDT.boba , swapFlashLoan],
            [tokens.USDC.boba , swapFlashLoan],
        ],
        block,
        "boba",
        transform
    );

    return balances;
}

module.exports = {
    boba: {
        tvl
    }
};
// node test.js projects/zencha/index.js