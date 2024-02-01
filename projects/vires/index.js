const { wavesAdapter } = require('../helper/chain/wavesAdapter')

const endpoint = "/vires"

module.exports = {
    timetravel: false,
    methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
    waves: {
        tvl: wavesAdapter(endpoint, item => {
            let tvl = 0;
            item.meta.forEach(market => tvl += market.currentTotalDepositUsd - market.currentTotalDebtUsd + market.protectedSupply * market.assetPriceUsd)
            return tvl
        }),
        borrowed: wavesAdapter(endpoint, item => {
            let tvl = 0;
            item.meta.forEach(market => tvl += Number(market.currentTotalDebtUsd))
            return tvl
        }),
    },
    hallmarks:[
        [1659092400, "Bad debt settlement in USDN"],
    ],
}
