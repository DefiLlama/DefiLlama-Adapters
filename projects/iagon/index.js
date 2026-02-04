const { sumTokens2 } = require("../helper/chain/cardano")
const { get } = require("../helper/http")
const iagTokenAddress = "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114494147"
const iagStakingOld = 'addr1w9k25wa83tyfk5d26tgx4w99e5yhxd86hg33yl7x7ej7yusggvmu3'
const iagStakingNew = 'addr1zxkrtm5fcf43ukp8w8kstt65kelawutmht4a0aezl06rp43y2c4s7gthspjk2c4557c9zltqcssl4qz7x5syzf7yknhqma7zxx'
const iagStakingOperators = 'addr1zxkrtm5fcf43ukp8w8kstt65kelawutmht4a0aezl06rp43y2c4s7gthspjk2c4557c9zltqcssl4qz7x5syzf7yknhqma7zxx'
const iagStakingDelegated = 'addr1z8awewqwaek2m7w6c5vyycldf5tykw87w820da273a4smgpy2c4s7gthspjk2c4557c9zltqcssl4qz7x5syzf7yknhq6uv6j0'

const owners = [iagStakingOld, iagStakingOperators, iagStakingDelegated]

async function pool2() {
    const poolValue = await get('https://api.iagon.com/api/v1/pools/tvl/total')
    return {
        cardano: parseFloat(poolValue.data.tvl)
    }
}

async function stake() {
    const stakedTokens = await sumTokens2({
        owners: owners,
        tokens: [iagTokenAddress]
    })

    return stakedTokens
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl: () => ({}),
        pool2,
        staking: stake
    }
}
