const { staking, stakingUnknownPricedLP } = require("./staking");
const { pool2Exports } = require("./pool2");
const sdk = require("@defillama/sdk");
const token0Abi = require("./abis/token0.json");
const token1Abi = require("./abis/token1.json");
const { default: BigNumber } = require("bignumber.js");

function tombTvl(token, share, rewardPool, masonry, pool2LPs, chain = "ethereum", transform = undefined, tokensOnCoingecko = true, lpWithShare = undefined) {
    if (transform === undefined) transform = addr => `${chain}:${addr}`;
    if (tokensOnCoingecko) {
        return {
            [chain === "avax" ? "avalanche" : chain]: {
                tvl: async () => ({}),
                staking: staking(masonry, share, chain),
                pool2: pool2Exports(rewardPool, pool2LPs, chain, transform)
            }
        }
    }
    else if (!tokensOnCoingecko) {
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
            return balances
        }

        return {
            [chain === "avax" ? "avalanche" : chain]: {
                tvl: async () => ({}),
                staking: stakingUnknownPricedLP(masonry, share, chain, lpWithShare),
                pool2
            }
        }
    }
}

module.exports = {
    tombTvl
}