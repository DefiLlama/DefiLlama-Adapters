const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");

const historicalVolumeEndpoint =
  "https://api-osmosis.imperator.co/volume/v1/historical/chart";
const dailyVolumeEndpoint = "https://api-osmosis.imperator.co/volume/v1/actual";

const graphs = async () => {
  const historicalVolume = (await fetchURL(historicalVolumeEndpoint))?.data;
  const dailyVolume = (await fetchURL(dailyVolumeEndpoint))?.data.value;

  const totalVolume = historicalVolume
    .reduce((acc, { value }) => acc.plus(value), new BigNumber(0))
    .plus(dailyVolume)
    .toString();

  return {
    totalVolume,
    dailyVolume,
  };
};

module.exports = {
  cosmos: graphs,
};
