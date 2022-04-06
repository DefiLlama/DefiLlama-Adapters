async function fetch() {
  const response = await fetch(
    "https://api.singularitydao.ai/value/totalValueLocked"
  );
  const data = await response.json();
  const tvl = Number(data.totalValueLockedUSD.TotalValueLockedUSD).toFixed(2);

  const slices = tvl.split(".");

  return slices[0];
}

module.exports = {
  fetch,
};
