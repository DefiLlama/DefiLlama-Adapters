const Caver = require("caver-js");
const { toUSDTBalances } = require("../helper/balances");
const { RPC_ENDPOINT_URL, SCNR, KLAY, ABIs } = require("./constants");
const { getTokenPriceCoinGecko } = require("../config/bella/utilities.js");

const tvl = async () => {
  const caver = new Caver(RPC_ENDPOINT_URL);
  const lp = new caver.klay.Contract(ABIs.LP, SCNR.lp.KLAY);

  const getStakedReserves = async () => {
    const { 0: reservesForSCNR, 1: reservesForKLAY } = await lp.methods
      .getReserves()
      .call();
    return { reservesForSCNR, reservesForKLAY };
  };

  const getTokenPrice = (staked, klayPrice) => {
    const { reservesForSCNR, reservesForKLAY } = staked;
    const amountOfSCNRStaked = reservesForSCNR / 10 ** SCNR.decimals;
    const amountOfKLAYStaked = reservesForKLAY / 10 ** KLAY.decimals;

    const exchangeRatio = amountOfKLAYStaked / amountOfSCNRStaked;
    return exchangeRatio * klayPrice;
  };

  // For now, SCNR/KLAY LP exists only on Swapscanner
  const getStakedInLPs = (staked) => Number(staked.reservesForSCNR);

  const getStakedInGovernance = async (address) => {
    const staking = new caver.klay.Contract(ABIs.Staking, SCNR.staking);
    const stakedBalance = await staking.methods
      .totalStakedBalanceOf(address)
      .call();
    return Number(stakedBalance);
  };

  const [staked, stakedInGovernance, klayPrice] = await Promise.all([
    getStakedReserves(),
    getStakedInGovernance(SCNR.address),
    getTokenPriceCoinGecko("usd")("klay-token"),
  ]);
  const tokenPrice = getTokenPrice(staked, klayPrice);

  const totalStakedByProtocols = [getStakedInLPs(staked), stakedInGovernance];
  const totalStaked =
    totalStakedByProtocols.reduce((acc, staked) => acc + staked, 0) /
    10 ** SCNR.decimals;

  return toUSDTBalances(totalStaked * tokenPrice);
};

module.exports = {
  klaytn: {
    tvl,
  },
};
