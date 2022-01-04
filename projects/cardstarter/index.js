const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');

const cardsStakeAddr = "0xad2fd18932c39fa5085429853e1f0d39a65a438e";
const lpStakeAddr = "0x7Dca3372A0a236A305FdEC3D48d52B09dff82E14";
const cardsAddr = "0x3d6f0dea3ac3c607b3998e6ce14b6350721752d9";

//cards, c3, and gero in that order
const lpPoolAddrs = ["0x94ae6d2390680ac6e6ee6069be42067d6ad72e2a", "0x984A3eAB3Cf2Fc2b4ca6E4A3768624a8272fe2a3",
"0x5b6be21c4d1f2c1c5A3d6Af3599f3BB0a785AE2F"];

async function tvl(timestamp, block){
    const balances = {};

    const cardsBalance = await sdk.api.erc20.balanceOf({
        target: cardsAddr,
        owner: cardsStakeAddr,
        block: block,
    });

    balances[cardsAddr] = cardsBalance.output;

    for(i = 0; i < lpPoolAddrs.length; i++){
        let curr = lpPoolAddrs[i];

        const balance = await sdk.api.erc20.balanceOf({
            target: curr,
            owner: lpStakeAddr,
            block: block,
        });

        await unwrapUniswapLPs(balances, [{
            token: curr,
            balance: balance.output,
        }],
            block);
    }
    return balances;
}

module.exports = {
    tvl
}

