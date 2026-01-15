const { staking } = require('../helper/staking')

module.exports = {
    methodology: "TVL counts GRT tokens deposited on the Staking contracts.",
    start: '2023-06-25',
    ethereum: {
        staking: staking('0xF55041E37E12cD407ad00CE2910B8269B01263b9', '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'),
        tvl: () => ({})
    },
    arbitrum: {
        staking: staking('0x00669A4CF01450B64E8A2A20E9b1FCB71E61eF03', '0x9623063377AD1B27544C965cCd7342f7EA7e88C7'),
    }
}