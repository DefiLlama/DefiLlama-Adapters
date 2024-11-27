const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const MARKET_CONTRACT = '0x4B9dE260e4283FEEb53F785AabeAa895eC5d46F9';
const TOKENS = [
    ADDRESSES.scroll.USDC, // USDC
    ADDRESSES.scroll.USDT, // USDT
    ADDRESSES.scroll.WETH, // WETH
    "0x3c1bca5a656e69edcd0d4e36bebb3fcdaca60cf1", // WBTC
    "0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32", // WSTETH
];

module.exports = {
    methodology: 'counts the token deposited in market contract',
    scroll: {
        tvl: sumTokensExport({ owner: MARKET_CONTRACT, tokens: TOKENS}),
    }
}; 