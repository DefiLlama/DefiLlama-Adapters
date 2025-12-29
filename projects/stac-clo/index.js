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

  // Get the total supply of STAC tokens using erc20:totalSupply
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: chainAddresses.token,
  });

  // Add the STAC token balance
  api.add(chainAddresses.token, totalSupply);

  return api.getBalances();
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of stac tokens across all supported chains. Price data is retrieved from the Ethereum price feed contract and applied to all chains. stac is a multi-chain RWA token with a shared price/token across chains.',
  ethereum: { tvl }
};