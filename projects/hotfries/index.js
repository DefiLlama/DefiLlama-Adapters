const {staking} = require('../helper/staking')

module.exports={
    bsc:{
        tvl: staking("0x849741B79bc1618b46CF9ec600E94E771DEde601", "0xe9e7cea3dedca5984780bafc599bd69add087d56", "bsc")
    }
}