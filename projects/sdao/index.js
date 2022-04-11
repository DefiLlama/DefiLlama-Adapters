const { default: axios } = require("axios");
const utils = require("../helper/utils");

const fetch = async function () {
  const data = await axios.get(
    "https://api.singularitydao.ai/value/totalValueLocked"
  );
  const response = data.data;
  console.log(response);
  const tvl = Number(response.totalValueLockedUSD.TotalValueLockedUSD).toFixed(
    2
  );

  const slices = tvl.split(".");

  return slices[0];
};

module.exports = {
  fetch,
};
