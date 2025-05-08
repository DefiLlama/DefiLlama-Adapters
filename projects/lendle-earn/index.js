async function tvl(api) {
  const chainId = api.chainId;

  const response = await fetch('https://lendle-vaults-api-184110952121.europe-west4.run.app/tvl');
  const allData = await response.json();

  const data = allData[5000];
  if (!data) {
    throw new Error(`No data found for chain ID ${chainId}`);
  }

  const total = await Object.values(data).reduce((sum, val) => sum + parseFloat(val), 0);
  return {
    tether: total
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL accounts for all assets deposited into the Vaults.',
  mantle: { tvl },
};