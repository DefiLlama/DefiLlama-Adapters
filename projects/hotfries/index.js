const ADDRESSES = require('../helper/coreAssets.json')
const {staking} = require('../helper/staking')

module.exports={
    bsc:{
        tvl: staking("0x849741B79bc1618b46CF9ec600E94E771DEde601", ADDRESSES.bsc.BUSD)
    }
}