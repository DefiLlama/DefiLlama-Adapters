const abi = {
    "balanceOf": "function balanceOf(address account) view returns (uint256)",
    "totalSupply": "function totalSupply() view returns (uint256)",
    "name": "function name() view returns (string)",
    "symbol": "function symbol() view returns (string)",
    "decimals": "function decimals() view returns (uint8)",
    "cap": "function cap() view returns (uint256)",
    "totalIssued": "function totalIssued() view returns (uint256)",
    "isPaused": "function isPaused() view returns (bool)",
    "latestAnswer": "function latestAnswer() view returns (int256)",
    "latestRoundData": "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
    "description": "function description() view returns (string)",
    "priceDecimals": "function decimals() view returns (uint8)"
  };

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