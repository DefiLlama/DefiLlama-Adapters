const { stakings } = require('../helper/staking')

const {
    cryptexConfig,
} = require('./cryptex-config');

module.exports = {
    methodology: "TVL includes locked LP tokens and vested team tokens",
    bsc: {
        tvl: ()=>({}),
        staking: stakings([cryptexConfig.staking.V1, cryptexConfig.staking.V2, ], cryptexConfig.crxToken)
    }
};