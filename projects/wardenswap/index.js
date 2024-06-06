const {staking} = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')
const masterchefAddress = '0xde866dD77b6DF6772e320dC92BFF0eDDC626C674'; // WardenSwap's MasterChef contract
const wardenTokenAddress = '0x0fEAdcC3824E7F3c12f40E324a60c23cA51627fc'; // WardenSwap token contract

module.exports = {
  methodology: "TVL is calculated from total liquidity of WardenSwap's active pools listed on our farm page https://farm.wardenswap.finance/?t=1&s=1/#/farm, excluding pools at PancakeSwap and inactive pools are not included, plus total warden staked in Warden pool",
  bsc:{
    tvl: getUniTVL({
      factory: '0x3657952d7bA5A0A4799809b5B6fdfF9ec5B46293',
      useDefaultCoreAssets: true,
    }),
    staking: staking(masterchefAddress, wardenTokenAddress)
  },
  hallmarks:[
    [1629910800, `Announcement 2 week left before pool's rewards end`],
    [1630083600, `Start pool's reward 100x warden pool`],
    [1631293200, `Pool's rewards end`]
  ]
};
