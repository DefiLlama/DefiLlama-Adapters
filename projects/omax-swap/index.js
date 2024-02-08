const { uniTvlExport } = require('../helper/unknownTokens')
const { staking } = require("../helper/staking");
const ADDRESSES = require("../helper/coreAssets.json");


const stakingContractAddress = 0x3A2DcDc705031eDBD94254ef7CEFB93D8066cC8D

module.exports = {
  polygon: {
    tvl: uniTvlExport('omax', '0x441b9333D1D1ccAd27f2755e69d24E60c9d8F9CF'),
    staking: staking(stakingContractAddress, ADDRESSES.null, "omax")
  }
}