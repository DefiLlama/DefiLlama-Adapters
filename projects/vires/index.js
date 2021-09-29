const {wavesAdapter} = require('../helper/wavesAdapter')

const endpoint = "http://51.158.191.108:8002/api/v1/history/vires"

module.exports={
    tvl: wavesAdapter(endpoint, item => {
        let tvl = 0;
        item.meta.forEach(market=> tvl += market.currentTotalDepositUsd - market.currentTotalDebtUsd)
        return tvl
    })
}