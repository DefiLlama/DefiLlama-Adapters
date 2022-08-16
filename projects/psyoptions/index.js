const { getAllTvlTokenMap } = require("@mithraic-labs/psy-metrics");
const { getCoingeckoId, getProvider, } = require("../helper/solana");

const mintToCoinGeckoIdMap = {
  "9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh": "arb-protocol"
}

async function tvl() {
  const anchorProvider = getProvider();
  const getCg = await getCoingeckoId();

  const mintAmountMap = await getAllTvlTokenMap(anchorProvider);

  const tvl = {};

  Object.keys(mintAmountMap).forEach(mintAddress => {
    let coingeckoId = getCg(mintAddress);
    if (!coingeckoId) {
      coingeckoId = mintToCoinGeckoIdMap[mintAddress];
    }
    tvl[coingeckoId] = mintAmountMap[mintAddress];
  })
  return tvl
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
