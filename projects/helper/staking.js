const sdk = require('@defillama/sdk');
const { getBlock } = require('./getBlock');
const getReserves = require('./abis/getReserves.json');

function staking(stakingContract, stakingToken, chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {
    return async (timestamp, _ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks)
        const bal = await sdk.api.erc20.balanceOf({
            target: stakingToken,
            owner: stakingContract,
            chain,
            block,
        })
        let address = stakingToken;
        if (transformedTokenAddress) {
            address = transformedTokenAddress
        } else if (chain !== "ethereum") {
            address = `${chain}:${stakingToken}`
        }
        if (decimals !== undefined) {
            return {
                [address]: Number(bal.output) / (10 ** decimals)
            }
        }
        return {
            [address]: bal.output
        }
    }
}

function stakingPricedLP(stakingContract, stakingToken, chain, lpContract, coingeckoIdOfPairedToken, stakedTokenIsToken0 = false, decimals = 18) {
    return async (timestamp, _ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks, true)
        const [bal, reserveAmounts] = await Promise.all([
            sdk.api.erc20.balanceOf({
                target: stakingToken,
                owner: stakingContract,
                chain,
                block,
            }),
            sdk.api.abi.call({
                target: lpContract,
                abi: getReserves,
                chain,
                block
            })
        ])
        const price = stakedTokenIsToken0 ?
            Number(reserveAmounts.output[1]) / Number(reserveAmounts.output[0]) : Number(reserveAmounts.output[0]) / Number(reserveAmounts.output[1])
        return {
            [coingeckoIdOfPairedToken]: (Number(bal.output) / (10 ** decimals)) * price
        }
    }
}

module.exports = {
    staking,
    stakingPricedLP
}
