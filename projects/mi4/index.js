const abi = require('./abi.json');

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

  try {
    // Get total supply of MI4 tokens
    const totalSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: chainAddresses.token,
    });

    // Get price from price feed using your custom ABI
    const priceData = await api.call({
      abi: abi.latestRoundData,
      target: chainAddresses.priceFeed,
    });

    // Get price decimals from the feed
    const priceDecimals = await api.call({
      abi: abi.priceDecimals,
      target: chainAddresses.priceFeed,
    });

    // Get token decimals
    const tokenDecimals = await api.call({
      abi: 'erc20:decimals',
      target: chainAddresses.token,
    });

    console.log(`MI4 Total Supply on ${chain}: ${totalSupply}`);
    console.log(`MI4 Latest Price: ${priceData.answer} (decimals: ${priceDecimals})`);
    console.log(`Token decimals: ${tokenDecimals}, Price decimals: ${priceDecimals}`);

    // Calculate the price per token in USD
    const pricePerTokenUsd = Number(priceData.answer) / (10 ** Number(priceDecimals));
    
    // Calculate actual token supply
    const tokenSupplyFloat = Number(totalSupply) / (10 ** Number(tokenDecimals));
    
    // Calculate TVL in USD
    const tvlUsd = tokenSupplyFloat * pricePerTokenUsd;
    
    console.log(`Price per MI4 token: $${pricePerTokenUsd}`);
    console.log(`Token supply: ${tokenSupplyFloat.toLocaleString()} MI4`);
    console.log(`Calculated TVL: $${tvlUsd.toLocaleString()}`);

    // Return TVL as USD value
    api.addUSDValue(tvlUsd);

  } catch (error) {
    console.error(`Error calculating TVL for ${chain}:`, error.message);
  }

  return api.getBalances();
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of MI4 tokens multiplied by the price of MI4 from the price feed contract.',
  mantle: { tvl },
};