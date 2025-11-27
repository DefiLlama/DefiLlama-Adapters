const axios = require("axios");
const sdk = require("@defillama/sdk");

async function tvl() {
  try {
    const response = await axios.get(
      "https://api.eigenexplorer.com/avs/0x875B5ff698B74B26f39C223c4996871F28AcDdea?withTvl=true&withCuratedMetadata=false&withRewards=false",
      {
        headers: {
          "X-API-Token": "03206c8747af0dbc8aa2b351838cb1dcf6dbadc15cf4c5e9e80e8af3adc3d28a",
        },
      }
    );

    // Extract the TVL value in ETH
    let totalTvlInEth = 0;
    
    if (response.data?.tvl) {
      if (typeof response.data.tvl === 'object') {
        totalTvlInEth = response.data.tvl.total || response.data.tvl.tvl || 0;
      } else {
        totalTvlInEth = response.data.tvl;
      }
    }

    // Get current ETH price in USD from DefiLlama
    const priceResponse = await axios.get(
      'https://coins.llama.fi/prices/current/ethereum:0x0000000000000000000000000000000000000000'
    );
    
    const ethPriceUSD = priceResponse.data?.coins?.['ethereum:0x0000000000000000000000000000000000000000']?.price || 0;

    // Calculate total staked amount in USD
    const totalStakedUSD = totalTvlInEth * ethPriceUSD;

    // Format the output
    const formattedUSD = totalStakedUSD >= 1e9 
      ? (totalStakedUSD / 1e9).toFixed(2) + "B"
      : totalStakedUSD >= 1e6
      ? (totalStakedUSD / 1e6).toFixed(2) + "M"
      : totalStakedUSD.toFixed(2);

    console.log("\n========================================");
    console.log("     TOTAL STAKED AMOUNT (USD)");
    console.log("========================================");
    console.log(`  Total: $${formattedUSD}`);
    console.log(`  (${totalTvlInEth.toFixed(2)} ETH @ $${ethPriceUSD.toFixed(2)})`);
    console.log("========================================\n");

    // Convert ETH to wei for DefiLlama (REQUIRED)
    const tvlInWei = Math.floor(totalTvlInEth * 1e18);

    // MUST return with ethereum: prefix for the chain
    return {
      "ethereum:0x0000000000000000000000000000000000000000": tvlInWei.toString(),
    };
  } catch (error) {
    console.error("Error fetching TVL:", error.message);
    throw error; // Re-throw so DefiLlama knows there was an error
  }
}

module.exports = {
  methodology: "Total staked amount in USD represents total staked assets across all chains for TriggerX AVS on EigenLayer, fetched from EigenExplorer API and converted using current ETH price",
  timetravel: false,
  hallmarks: [],
  ethereum: {
    tvl,
  },
};
