const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const abi = require('./abi.json')

const graphUrls = [
    'https://graph.totemfi.com/subgraphs/name/totemfi/staking'
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
  
  async function tvl(timestamp, block) {
    try {
      let balances = {};
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
          continue
        }
        let balance = BigNumber.from(allPrizePools[i]["totalStaked"]).sub(BigNumber.from(allPrizePools[i]["totalUnStaked"]))
        sumTOTM = sumTOTM.add(balance)
      }
      balances['TOTM'] = sumTOTM.toString()
      return balances
    } catch (error) {
      console.error(error)
    }
  }


module.exports = {
    bsc: {
        tvl,
    },
    tvl
}