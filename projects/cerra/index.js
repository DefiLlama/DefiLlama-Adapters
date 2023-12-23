const { post } = require('../helper/http')

async function tvl() {
    const res = await post('https://pab.cerra.io/', {
        endpoint: 'getTvl'
    })
    return {cardano: Number(res.tvl.ADA)}
}

module.exports={
    timetravel: false,
    cardano: {
        tvl
    }
}