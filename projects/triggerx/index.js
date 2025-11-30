const axios = require("axios");
const sdk = require("@defillama/sdk");

async function tvl() {
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

  // Convert ETH to wei for DefiLlama (REQUIRED)
  const tvlInWei = Math.floor(totalTvlInEth * 1e18);

  // Return ETH (in wei)
  return {
    "ethereum:0x0000000000000000000000000000000000000000": tvlInWei.toString(),
  };
}

module.exports = {
  methodology: "TVL represents total staked amount across all chains for TriggerX AVS on EigenLayer, fetched from EigenExplorer API.",
  timetravel: false,
  hallmarks: [],
  doublecounted: true,
  ethereum: {
    tvl,
  },
};