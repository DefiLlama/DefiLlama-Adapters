const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require("bignumber.js");

const graphUrls = [
  'https://graph.totemfi.com/subgraphs/name/totemfi/predictor'
]
const graphQuery = gql`
  query GET_POOLS($block: Int,$timestamp: BigInt) {
    stakingPools(
      block: { number: $block },where:{startDate_lte:$timestamp}
    ) {
     totalStaked
     totalUnStaked
    }
  }
  `;
const TOTM = "bsc:0x6FF1BFa14A57594a5874B37ff6AC5efbD9F9599A"
async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks["bsc"];
  let balances = {};
  try {
    let allPrizePools = []
    for (const graphUrl of graphUrls) {
      const { stakingPools } = await request(
        graphUrl,
        graphQuery,
        {
          block,
          timestamp
        }
      );
      allPrizePools = allPrizePools.concat(stakingPools)
    }
    for (let i = 0; i < allPrizePools.length; i++) {
      if (allPrizePools[i]["totalUnStaked"] == null) {
        allPrizePools[i]["totalUnStaked"] = 0
      }
      sdk.util.sumSingleBalance(balances, TOTM, BigNumber(allPrizePools[i]["totalStaked"]).minus(allPrizePools[i]["totalUnStaked"]).toFixed(0))
    }
    return balances
  } catch (error) {
    if (error.message !== undefined) {
      if (error.message.includes("decode") && error.response?.status == 200) {
        balances[TOTM] = "0"
        return balances
      }
    }
    throw error
  }
}


module.exports = {
  bsc: {
    tvl,
  }
}