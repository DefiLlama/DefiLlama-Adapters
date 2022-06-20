const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

const contracts = {
    "staking": "0xfc30fE377f7E333cC1250B7768107a7Da0277c44",
};
const wkava = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";

async function tvl(_time, _ethBlock, chainBlocks) {
    let balances = {};

    balances[`kava:${wkava}`] = (await sdk.api.erc20.balanceOf({
        target: wkava,
        owner: contracts.staking,
        chain: 'kava',
        block: chainBlocks.kava
    })).output;
};

module.exports = {
    methodology: "WKAVA staked in contract",
    kava: {
        tvl
    }
};
