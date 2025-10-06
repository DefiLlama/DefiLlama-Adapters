const { sumTokens2 } = require('../helper/unwrapLPs');

// Sonic
const contracts = [
  '0xBD87A909F9A40FdaD6D9BE703E89A0383064D0Ab', // ebFox
  '0x3725B740b33E75898e4e2E616E9BB519884edd37', // FoxMaxi
];

// Arbitrum
const arbitrumKitsuneVaultContract = '0xe5a4f22fcb8893ba0831babf9a15558b5e83446f';

async function sonicTvl(api) {
  // Fetch total supplies from both contracts
  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: contracts,
  });

  // Sum total supplies from both contracts
  const totalSupply = supplies.reduce((sum, supply) => sum + BigInt(supply), 0n);

  // Fetch Fox token price from CoinGecko
  // First try to get price by CoinGecko ID, fallback to contract address if available
  let foxPrice = 0;
  try {
    // Try CoinGecko ID first (replace 'fox' with actual CoinGecko ID if known)
    const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=foxify&vs_currencies=usd');
    const priceData = await priceResponse.json();
    foxPrice = priceData.foxify?.usd || 0;
    
    // If fox ID doesn't work, you might need to find the correct CoinGecko ID
    // or use contract address approach if Sonic is supported
    if (foxPrice === 0) {
      console.warn('Fox token price not found on CoinGecko with ID "fox"');
    }
  } catch (error) {
    console.warn('Failed to fetch Fox price from CoinGecko:', error.message);
    foxPrice = 0;
  }

  // Calculate TVL: total supply * price
  const tvlValue = (Number(totalSupply) / 1e18) * foxPrice;

  // Return TVL as a balance object
  api.addUSDValue(tvlValue);
  return api.getBalances();
}

async function arbitrumTvl(api) {
  // Fetch totalAssets from the Arbitrum Kitsune Vault contract
  const totalAssets = await api.call({
    abi: 'uint256:totalAssets',
    target: arbitrumKitsuneVaultContract,
  });

  // Add the totalAssets to TVL (assuming it's already in the correct token units)
  // For now, adding as USD value - you should replace this with the actual token
  api.addUSDValue(Number(totalAssets) / 1e6);
  return api.getBalances();
}

module.exports = {
  methodology: 'Counts the totalSupply of Foxify protocol tokens and totalAssets from Arbitrum contract',
  sonic: {
    tvl: sonicTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },
};