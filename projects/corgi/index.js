const sdk = require("@defillama/sdk")
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const { getLPData, getTokenPrices } = require('../helper/unknownTokens')
const {  stakingPricedLP, stakingUnknownPricedLP } = require('../helper/staking')
const { pool2s , pool2} = require("../helper/pool2");
const chain = 'dogechain'
let totalTvl

const contract = '0xEfB1E90eF4D9672843e01Cb9d691175CB9404b5C'
const cog = '0xA8Fc6EF0B48557596D4a75FF85a288A982606707'

async function gettotalTvl(block) {
    if (!totalTvl) totalTvl = getTVL()
    return totalTvl

    async function getTVL() {
        const transform = await getChainTransform(chain)
        const balances = {
            tvl: {},


        }
        const { output: length } = await sdk.api.abi.call({
            target: contract,
            abi: abi.poolLength,
            chain,
            block,
        })

        const calls = []
        for (let i = 0; i < length; i++) calls.push({ params: [i] })
        const { output: data } = await sdk.api.abi.multiCall({
            target: contract,
            abi: abi.poolInfo2,
            calls,
            chain,
            block,
        })

        const tempBalances = {}
        const lps = []

        data.forEach(({ output }) => {
            const token = output.lpToken.toLowerCase()
            const amount = output.amount0
            sdk.util.sumSingleBalance(tempBalances, token, amount)
            lps.push(token)
        })




        const pairs = await getLPData({ lps, chain, block })

        const { updateBalances, } = await getTokenPrices({ lps: Object.keys(pairs), allLps: true, coreAssets: [], block, chain, minLPRatio: 0.001 })

        Object.entries(tempBalances).forEach(([token, balance]) => {
            if (pairs[token]) {
                const { token0Address, token1Address } = pairs[token]
                if (cog === token0Address || cog === token1Address) {
                    sdk.util.sumSingleBalance(balances.pool2, transform(token), balance)
                    return;
                }
            }
            sdk.util.sumSingleBalance(balances.tvl, transform(token), balance)
        })

        await updateBalances(balances.tvl)
        //await updateBalances(balances.pool2)

        return balances
    }
}

async function tvl(_, _b, {
    [chain]: block
}) {
    return (await gettotalTvl(block)).tvl
}
/*
async function pool2(_, _b, {
    [chain]: block
}) {
    return (await gettotalTvl(block)).pool2
}*/





module.exports = {
    dogechain: {
        tvl: () => ({}),
        // tvl: tvl,
        // pool2: pool2(contract, '0xd9a09a130f73626a6f6526a575f8e23170186b42', 'dogechain', addr=>`dogechain:${addr}` ),
        // staking: stakingUnknownPricedLP('0x69e1f7e60A83BF250E0a277f3711a1612279dD7E', cog, 'dogechain', '0xd9a09a130f73626a6f6526a575f8e23170186b42', addr=>`dogechain:${addr}`, 18 ),
    },
    hallmarks: [
        [1662859935, "Rug pull"],
    ]
}