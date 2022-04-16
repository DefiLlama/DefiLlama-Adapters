const Caver = require("caver-js");
const { toUSDTBalances } = require("../helper/balances");
const { RPC_ENDPOINT_URL, SCNR, KLAY, ABIs } = require("./constants");
const { getTokenPriceCoinGecko } = require("../config/bella/utilities.js");

const getTokenPrice = (staked, klayPrice) => {
  const { reservesForSCNR, reservesForKLAY } = staked;
  const amountOfSCNRStaked = reservesForSCNR / 10 ** SCNR.decimals;
  const amountOfKLAYStaked = reservesForKLAY / 10 ** KLAY.decimals;

  const exchangeRatio = amountOfKLAYStaked / amountOfSCNRStaked;
  return exchangeRatio * klayPrice;
};

const getStakedReserves = async (provider) => {
  const lp = new provider.klay.Contract(ABIs.LP, SCNR.lp.KLAY);
  const { 0: reservesForSCNR, 1: reservesForKLAY } = await lp.methods
    .getReserves()
    .call();
  return { reservesForSCNR, reservesForKLAY };
};

const tvl = async () => {
  const caver = new Caver(RPC_ENDPOINT_URL);

  // For now, SCNR/KLAY LP exists only on Swapscanner
  const getStakedInLPs = (staked) => Number(staked.reservesForSCNR);

  const [staked, klayPrice] = await Promise.all([
    getStakedReserves(caver),
    getTokenPriceCoinGecko("usd")("klay-token"),
  ]);

  const tokenPrice = getTokenPrice(staked, klayPrice);
  const totalStaked = getStakedInLPs(staked) / 10 ** SCNR.decimals;
  return toUSDTBalances(totalStaked * tokenPrice);
};

const staking = async () => {
  const caver = new Caver(RPC_ENDPOINT_URL);

  const getStakedInGovernance = async (address) => {
    const staking = new caver.klay.Contract(ABIs.Staking, SCNR.staking);
    const stakedBalance = await staking.methods
      .totalStakedBalanceOf(address)
      .call();
    return Number(stakedBalance);
  };

  const [stakedInLP, totalStakedInGovernance, klayPrice] = await Promise.all([
    getStakedReserves(caver),
    getStakedInGovernance(SCNR.address),
    getTokenPriceCoinGecko("usd")("klay-token"),
  ]);

  const tokenPrice = getTokenPrice(stakedInLP, klayPrice);
  return toUSDTBalances(totalStakedInGovernance * tokenPrice);
};

module.exports = {
  klaytn: {
    tvl,
    staking,
    methodology:
      "TVL of Swapscanner consists of the SCNR tokens held in governance staking and SCNR/KLAY LP",
  },
};
