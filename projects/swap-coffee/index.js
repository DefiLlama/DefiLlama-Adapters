const { call, sumTokensExport, getTokenRates, getJettonBalances } = require('../helper/chain/ton')
const {sleep} = require("../helper/utils");

const CES_MASTER = "0:a5d12e31be87867851a28d3ce271203c8fa1a28ae826256e73c506d94d49edad"
const STAKING_CONTRACT = "0:29f90533937d696105883b981e9427d1ae411eef5b08eab83f4af89c495d27df"
const DEDUST_TON_CES_POOL = "0:123e245683bd5e93ae787764ebf22291306f4a3fcbb2dcfcf9e337186af92c83"
const STONFI_CES_TON_POOL = "0:6a839f7a9d6e5303d71f51e3c41469f2c35574179eb4bfb420dca624bb989753"

async function getTokenSupply(addr) {
    return (await call({ target: addr, abi: "get_jetton_data"}))[0] / 1e9
}

function calcVolume(reserve, supply, rate) {
    return ((reserve / 1e9) / supply) * rate
}

module.exports = {
    methodology: "Counts swap.coffee smartcontract balance as TVL.",
    timetravel: false,
    ton: {
        tvl: () => { },
        staking: sumTokensExport({ owners: [STAKING_CONTRACT], tokens: [CES_MASTER]}),
        pool2: async (api) => {
            const dedustPoolReserves = await call({ target: DEDUST_TON_CES_POOL, abi: "get_reserves" })
            const dedustLpSupply = await getTokenSupply(DEDUST_TON_CES_POOL)

            // toncenter api is rate limited
            await sleep(3000)

            const stonfiPoolReserves = await call({ target: STONFI_CES_TON_POOL, abi: "get_pool_data" })
            const stonfiLpSupply = await getTokenSupply(STONFI_CES_TON_POOL)

            const rates = await getTokenRates({ tokens: ["TON", CES_MASTER] })

            const stonLpPrice = calcVolume(stonfiPoolReserves[0], stonfiLpSupply, rates[CES_MASTER]) +
                calcVolume(stonfiPoolReserves[1], stonfiLpSupply, rates["TON"])
            const dedustLpPrice = calcVolume(dedustPoolReserves[0], dedustLpSupply, rates["TON"]) +
                calcVolume(dedustPoolReserves[1], dedustLpSupply, rates[CES_MASTER])

            const balances = await getJettonBalances(STAKING_CONTRACT)

            return api.addUSDValue((stonLpPrice * balances[STONFI_CES_TON_POOL].balance / 1e9) +
                (dedustLpPrice * balances[DEDUST_TON_CES_POOL].balance / 1e9))
        }
    }
}