const sdk = require("@defillama/sdk")
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const { getLPData, getTokenPrices, } = require('../helper/unknownTokens')
const chain = 'klaytn'
let totalTvl

const contract = '0x0D2C835C56BE5830FAd8082732B43efe30C958f3'
const sak = '0x37CDC46C78Cf403F1Da8a1eeBCffB3ed1DD01868'

async function gettotalTvl(block) {

    if (!totalTvl) totalTvl = getTVL()
    return totalTvl

    async function getTVL() {
        const transform = await getChainTransform(chain)
        const balances = {
            tvl: {},
            pool: {}, //
            staking: {},
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
            abi: abi.poolInfo, //
            calls,
            chain,
            block,
        })

        const tempBalances = {}
        const lps = []

        data.forEach(({ output }) => {
            const token = output.lpToken.toLowerCase()
            const amount = output.amount
            sdk.util.sumSingleBalance(tempBalances, token, amount)
            lps.push(token)
        })


        balances.staking['bsc:' + sak] = tempBalances[sak]
        delete tempBalances[sak]

        const pairs = await getLPData({ lps, chain, block })

        const { updateBalances, } = await getTokenPrices({ lps: Object.keys(pairs), allLps: true, coreAssets: [], block, chain, minLPRatio: 0.001 })
        Object.entries(tempBalances).forEach(([token, balance]) => {
            if (pairs[token]) {
                const { token0Address, token1Address } = pairs[token]
                if (sak === token0Address || sak === token1Address) {
                    sdk.util.sumSingleBalance(balances.pool, transform(token), balance)
                    return;
                }
            }
            sdk.util.sumSingleBalance(balances.tvl, transform(token), balance)
        })

        await updateBalances(balances.tvl)
        await updateBalances(balances.pool)

        return balances

    }
}

async function tvl(_, _b, {
    [chain]: block
}) {
    return (await gettotalTvl(block)).tvl
}

async function pool2(_, _b, {
    [chain]: block
}) {
    return (await gettotalTvl(block)).pool
}

async function staking(_, _b, {
    [chain]: block
}) {
    return (await gettotalTvl(block)).staking
}



module.exports = {
    klaytn: {
        tvl,
        pool2,
        staking,
    }
}