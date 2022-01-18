const sdk = require("@defillama/sdk");

const tokens = {
    BNB: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    IBFR: "0xa296aD1C47FE6bDC133f39555C1D1177BD51fBc5"
};

async function tvl(_timestamp, ethBlock) {
    const bscV1 = (await sdk.api.eth.getBalance({
        target: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
        owner: '0x7338ee5535F1E0f1a210a6Ef6dB34f5357EB9860',
        block: ethBlock,
    })).output;
    const ibfrV1 = (await sdk.api.erc20.balanceOf({
        target: tokens.IBFR,
        owner: '0xE6C2cDD466Eb1Fa6bDFDb8af1BD072d4A57734C2',
        block: ethBlock,
    })).output;

    const balances = {
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': bscV1,
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': ibfrV1,
    }

    return balances
};


module.exports = {
    tvl,
    methodology: `TVL for Buffer is calculated using BNB, deposited for liquidity`
}