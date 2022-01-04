const {wavesAdapter} = require('../helper/wavesAdapter')

const endpoint = "http://51.158.191.108:8002/api/v1/history/waves-exchange"

module.exports={
    tvl: wavesAdapter(endpoint, item => item.investmentsLocked + item.ordersLocked)
}