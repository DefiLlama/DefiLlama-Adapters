const { sumTokens, queryAddresses } = require('../helper/chain/radixdlt');
const { getConfig } = require('../helper/cache')
const { get, post } = require('../helper/http')
const sdk = require('@defillama/sdk')

const pools = [
    'component_rdx1cq8mm5z49x6lyet44a0jd7zq52flrmykwwxszq65uzfn6pk3mvm0k4',
    'component_rdx1cq7qd9vnmmu5sjlnarye09rwep2fhnq9ghj6eafj6tj08y7358z5pu',
]

async function tvl() {

    let tvl = {}

    const data = await queryAddresses({
        addresses: pools
    })

    data.forEach((item) => {
        tvl['radixdlt:' + item.fungible_resources.items[0].resource_address] = parseFloat(item.fungible_resources.items[0].amount) + parseFloat(item.details.state.fields[1].value)
    })

    console.log('tvl', tvl)

    return tvl
}


async function borrowed() {

    let borrowed = {}

    const data = await queryAddresses({
        addresses: pools
    })

    data.forEach((item) => {
        borrowed['radixdlt:' + item.fungible_resources.items[0].resource_address] = parseFloat(item.details.state.fields[1].value)
    })

    console.log(borrowed)

    return borrowed
}

module.exports = {
    radixdlt: { tvl, borrowed },
    timetravel: true
}
