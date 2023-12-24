const { post } = require('../helper/http')

async function tvl() {
    const { tvl } = await post('https://pab.cerra.io/', {
        endpoint: 'getTvl'
    })
    return {cardano: Number(tvl.ADA)}
}

module.exports={
    timetravel: false,
    cardano: {
        tvl
    }
}