const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');

const ernToken = '0xBBc2AE13b23d715c30720F079fcd9B4a74093505';
const stonesFarm = '0xEdFE9aC42a511e1C523E067DB8345711419d4f14';
const ernLPFarm = '0x34a77Aa9AE42ff9a9B2078E450651D112D5BE908';
const ernLP = '0x570febdf89c07f256c75686caca215289bb11cfc';

async function tvl(timestamp, block) {
    const balances = {};

    const balanceStones = await sdk.api.erc20.balanceOf({
        target: ernToken,
        owner: stonesFarm,
        block: block,
    });
    balances[ernToken] = balanceStones.output;

    //get balance of LP tokens on ern farm
    const balanceErnLP = await sdk.api.erc20.balanceOf({
        target: ernLP,
        owner: ernLPFarm,
        block: block,
    });

    //unrwap the lp tokens to get the amount of each coin in the lp
    await unwrapUniswapLPs(balances, [{
        token: ernLP,
        balance: balanceErnLP.output,
    }],
        block);

    return balances;
}


module.exports = {
    ethereum:{
        tvl
    },
    tvl
}
