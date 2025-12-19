const abi = require('./abi.json');

// stac token addresses for different chains
const stacAddresses = {
  ethereum: {
    token: '0x51C2d74017390CbBd30550179A16A1c28F7210fc',
    priceFeed: '0xEdC6287D3D41b322AF600317628D7E226DD3add4'
  }
};

async function tvl(api) {
  const { chain } = api;
  const chainAddresses = stacAddresses[chain];

  if (!chainAddresses) {
    console.log(`No stac addresses configured for chain: ${chain}`);
    return api.getBalances();
  }

  // Get the total supply of stac tokens
  const totalSupply = await api.call({
    abi: abi.totalSupply,
    target: chainAddresses.token,
  });

  // Get token decimals
  const tokenDecimals = await api.call({
    abi: abi.decimals,
    target: chainAddresses.token,
  });

  // Get price from the price feed on Ethereum
  const priceData = await api.call({
    abi: abi.latestRoundData,
    target: stacAddresses.ethereum.priceFeed,
    chain: 'ethereum',
  });
console.log(`Price Data: ${JSON.stringify(priceData)}`);
  const priceDecimals = await api.call({
    abi: abi.priceDecimals,
    target: stacAddresses.ethereum.priceFeed,
    chain: 'ethereum',
  });

  console.log(`stac Total Supply on ${chain}: ${totalSupply} (decimals: ${tokenDecimals})`);
  console.log(`stac Price: ${priceData.answer} (decimals: ${priceDecimals})`);

  // Calculate TVL in USD
  // totalSupply has tokenDecimals, price has priceDecimals
  // TVL = (totalSupply / 10^tokenDecimals) * (price / 10^priceDecimals)
  const tvlUsd = (BigInt(totalSupply) * BigInt(priceData.answer)) / (10n ** BigInt(tokenDecimals));

  console.log(`stac TVL in USD: ${tvlUsd / (10n ** BigInt(priceDecimals))}`);

  // Add USD value directly
  api.addUSDValue(Number(tvlUsd) / (10 ** Number(priceDecimals)));

  return api.getBalances();
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of stac tokens across all supported chains. Price data is retrieved from the Ethereum price feed contract and applied to all chains. stac is a multi-chain RWA token with a shared price/token across chains.',
  ethereum: { tvl }
};