const ADDRESSES = require('../helper/coreAssets.json')
const {staking} = require("../helper/staking");

module.exports = {
    methodology: 'allspark counts the staking values as tvl',
    zklink:{
        tvl: staking(
            ["0xD06B5A208b736656A8F9cD04ed43744C738BD8A9"],
            [ADDRESSES.null]
        )
    }
};
