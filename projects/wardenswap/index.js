const {staking} = require('../helper/staking')
const {calculateUniTvl} = require('../helper/calculateUniTvl')
const masterchefAddress = '0xde866dD77b6DF6772e320dC92BFF0eDDC626C674'; // WardenSwap's MasterChef contract
const wardenTokenAddress = '0x0fEAdcC3824E7F3c12f40E324a60c23cA51627fc'; // WardenSwap token contract

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = await calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks.bsc, 'bsc', '0x3657952d7bA5A0A4799809b5B6fdfF9ec5B46293', 0, true)
  return balances;
};

module.exports = {
  methodology: "TVL is calculated from total liquidity of WardenSwap's active pools listed on our farm page https://farm.wardenswap.finance/?t=1&s=1/#/farm, excluding pools at PancakeSwap and inactive pools are not included, plus total warden staked in Warden pool",
  bsc:{
    tvl: bscTvl,
    staking: staking(masterchefAddress, wardenTokenAddress, "bsc")
  },
};
