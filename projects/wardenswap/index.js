const {staking} = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')
const masterchefAddress = '0xde866dD77b6DF6772e320dC92BFF0eDDC626C674'; // WardenSwap's MasterChef contract
const wardenTokenAddress = '0x0fEAdcC3824E7F3c12f40E324a60c23cA51627fc'; // WardenSwap token contract

module.exports = {
  methodology: "TVL is calculated from total liquidity of WardenSwap's active pools listed on our farm page https://farm.wardenswap.finance/?t=1&s=1/#/farm, excluding pools at PancakeSwap and inactive pools are not included, plus total warden staked in Warden pool",
  bsc:{
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0x3657952d7bA5A0A4799809b5B6fdfF9ec5B46293',
      coreAssets: [
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // wbnb
        '0xe9e7cea3dedca5984780bafc599bd69add087d56', // busd
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
        '0x55d398326f99059ff775485246999027b3197955', // USDT
        '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH
        wardenTokenAddress,
      ],
    }),
    staking: staking(masterchefAddress, wardenTokenAddress, "bsc")
  },
};
