const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");

const historicalVolumeEndpoint =
  "https://s.klayswap.com/stat/klayswapInfo.json";

const klaytn = async () => {
  const historicalVolume = (await fetchURL(historicalVolumeEndpoint))?.data
    .dayVolume;

  const totalVolume = historicalVolume
    .reduce((acc, { amount }) => acc.plus(amount), new BigNumber(0))
    .toString();

  return {
    totalVolume,
    dailyVolume: historicalVolume[historicalVolume.length - 1].amount,
  };
};

module.exports = {
  klaytn,
};
