const abi = {
    "latestRoundData": "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
    "priceDecimals": "function decimals() view returns (uint8)"
  };

const MI4_ADDRESSES = {
  mantle: {
    token: '0x671642Ac281C760e34251d51bC9eEF27026F3B7a',
    priceFeed: '0x24c8964338Deb5204B096039147B8e8C3AEa42Cc'
  }
};

async function tvl(api) {
  const { chain } = api;
  const chainAddresses = MI4_ADDRESSES[chain];

  if (!chainAddresses) {
    console.log(`No MI4 addresses configured for chain: ${chain}`);
    return {};
  }

  // Get total supply of MI4 tokens
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: chainAddresses.token,
  });

  api.add(chainAddresses.token, totalSupply);

  return api.getBalances();
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of MI4 tokens multiplied by the price of MI4 from the price feed contract.',
  mantle: { tvl },
};