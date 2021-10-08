const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const abi = require('./abi.json')

const graphUrls = [
  'https://graph.totemfi.com/subgraphs/name/totemfi/staking-v1'
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
const TOTM = "0x6FF1BFa14A57594a5874B37ff6AC5efbD9F9599A"
  async function tvl(timestamp, block) {
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
      let sumTOTM = BigNumber.from(0)
      for (let i = 0; i < allPrizePools.length; i++) {
        if (allPrizePools[i]["totalUnStaked"] == null) {
          allPrizePools[i]["totalUnStaked"] = 0
        }
        let balance = BigNumber.from(allPrizePools[i]["totalStaked"]).sub(BigNumber.from(allPrizePools[i]["totalUnStaked"]))
        sumTOTM = sumTOTM.add(balance)
      }
      balances[TOTM] = sumTOTM.toString()
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
  },
  tvl
}