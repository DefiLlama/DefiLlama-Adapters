const axios = require("axios");

async function getStakedAmount() {
  try {
    // Fetch TVL data in ETH
    const response = await axios.get(
      "https://api.eigenexplorer.com/avs/0x875B5ff698B74B26f39C223c4996871F28AcDdea?withTvl=true&withCuratedMetadata=false&withRewards=false",
      {
        headers: {
          "X-API-Token": "03206c8747af0dbc8aa2b351838cb1dcf6dbadc15cf4c5e9e80e8af3adc3d28a",
        },
      }
    );

    let totalTvlInEth = 0;
    
    if (response.data?.tvl) {
      if (typeof response.data.tvl === 'object') {
        totalTvlInEth = response.data.tvl.total || response.data.tvl.tvl || 0;
      } else {
        totalTvlInEth = response.data.tvl;
      }
    }

    // Get current ETH price in USD
    const priceResponse = await axios.get(
      'https://coins.llama.fi/prices/current/ethereum:0x0000000000000000000000000000000000000000'
    );
    
    const ethPriceUSD = priceResponse.data?.coins?.['ethereum:0x0000000000000000000000000000000000000000']?.price || 0;

    // Calculate total staked amount in USD
    const totalStakedUSD = totalTvlInEth * ethPriceUSD;

    // Format number with B/M suffix
    const formatted = totalStakedUSD >= 1e9 
      ? (totalStakedUSD / 1e9).toFixed(2) + "B"
      : totalStakedUSD >= 1e6
      ? (totalStakedUSD / 1e6).toFixed(2) + "M"
      : totalStakedUSD >= 1e3
      ? (totalStakedUSD / 1e3).toFixed(2) + "K"
      : totalStakedUSD.toFixed(2);

    console.log("\nTotal Staked Amount (USD)");
    console.log(`Total: $${formatted}\n`);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

getStakedAmount();