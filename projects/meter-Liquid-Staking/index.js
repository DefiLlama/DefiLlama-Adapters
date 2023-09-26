const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { BigNumber,utils } = require('ethers');

const stMTRG = '0x215d603293357ca222bE92A1bf75eEc38DeF0aad';
async function tvl(timestamp, _, { meter: block }) {
    const stMTRGStaking = await sdk.api.abi.call({
        target: stMTRG,
        abi: 'erc20:totalSupply',
        chain: "meter", block,
    });
    return {
        meter: stMTRGStaking.output / 1e18
    };
}

module.exports = {
    meter: {
        tvl,
    }
}