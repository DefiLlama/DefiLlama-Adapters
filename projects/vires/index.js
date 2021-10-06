const {wavesAdapter} = require('../helper/wavesAdapter')

const endpoint = "http://51.158.191.108:8002/api/v1/history/vires"

module.exports={
    methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
    tvl: wavesAdapter(endpoint, item => {
        let tvl = 0;
        item.meta.forEach(market=> tvl += market.currentTotalDepositUsd - market.currentTotalDebtUsd)
        return tvl
    }),
    borrowed: wavesAdapter(endpoint, item => {
        let tvl = 0;
        item.meta.forEach(market=> tvl += market.currentTotalDebtUsd)
        return tvl
    }),
}
