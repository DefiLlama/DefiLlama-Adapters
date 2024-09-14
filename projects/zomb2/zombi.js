const { stakingUnknownPricedLP } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'
const { default: BigNumber } = require("bignumber.js");

function zombiTvl(token, share, rewardPool, rewardPool2, masonry, pool2LPs, listedTokenGeneris, chain = "ethereum", transform = undefined, tokensOnCoingecko = true, lpWithShare = undefined) {
    if (transform === undefined) transform = addr => `${chain}:${addr}`;

    const pool2 = async (timestamp, block, chainBlocks) => {
        let balances = {};
        token = token.toLowerCase();
        share = share.toLowerCase();
        block = chainBlocks[chain];
        const pool2Balances = (await sdk.api.abi.multiCall({
            calls: pool2LPs.map(p => ({
                target: p,
                params: rewardPool
            })),
            abi: "erc20:balanceOf",
            block,
            chain
        })).output;
        const supplies = (await sdk.api.abi.multiCall({
            calls: pool2LPs.map(p => ({
                target: p
            })),
            abi: "erc20:totalSupply",
            block,
            chain
        })).output;
        const pool2Token0 = (await sdk.api.abi.multiCall({
            calls: pool2LPs.map(p => ({
                target: p
            })),
            abi: token0Abi,
            block,
            chain
        })).output;
        const pool2Token1 = (await sdk.api.abi.multiCall({
            calls: pool2LPs.map(p => ({
                target: p
            })),
            abi: token1Abi,
            block,
            chain
        })).output;

        for (let i = 0; i < pool2LPs.length; i++) {
            let listedToken;
            const token0 = pool2Token0[i].output.toLowerCase();
            const token1 = pool2Token1[i].output.toLowerCase();
            if (token0 === token || token0 === share) {
                listedToken = token1;
            }
            else if (token1 === token || token1 === share) {
                listedToken = token0;
            }
            const listedTokenBalance = (await sdk.api.erc20.balanceOf({
                target: listedToken,
                owner: pool2LPs[i],
                block,
                chain
            })).output;
            const balance = BigNumber(pool2Balances[i].output).times(listedTokenBalance).div(supplies[i].output).times(2).toFixed(0);
            sdk.util.sumSingleBalance(balances, transform(listedToken), balance);
        }
        // get tvl generis pool
        for (let i = 0; i < listedTokenGeneris.length; i++) {
            const balance = (await sdk.api.erc20.balanceOf({
                target: listedTokenGeneris[i],
                owner: rewardPool2,
                block,
                chain
            })).output;
            sdk.util.sumSingleBalance(balances, transform(listedTokenGeneris[i]), balance);
        }
        return balances
    }

    return {
        [chain]: {
            tvl: async () => ({}),
            staking: stakingUnknownPricedLP(masonry, share, chain, lpWithShare),
            pool2
        }
    }
}

module.exports = {
    zombiTvl
}