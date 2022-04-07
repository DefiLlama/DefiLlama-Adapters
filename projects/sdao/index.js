const fetchTvl = async function () {
  const response = await fetch(
    "https://api.singularitydao.ai/value/totalValueLocked"
  );
  const data = await response.json();
  const tvl = Number(data.totalValueLockedUSD.TotalValueLockedUSD).toFixed(2);

  const slices = tvl.split(".");

  return await slices[0];
  console.log(slices[0]);
};

fetchTvl();

module.exports = {
  fetchTvl,
};
