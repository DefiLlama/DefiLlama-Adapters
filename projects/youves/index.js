const axios = require('axios')
const { GraphQLClient, gql } = require("graphql-request");
const { default: BigNumber } = require('bignumber.js');
const retry = require('../helper/retry')

const indexer = "http://youves-indexer.prod.gke.papers.tech/v1/graphql"
var query = gql`
{
    vault_aggregate {
      aggregate {
      sum {balance}
      }
    }
  }
`
async function fetch() {
    const priceData = await retry(async req => await axios.get("https://api.better-call.dev/v1/contract/mainnet/KT1RC22chBZGJtWv82e5pSeyqyBLEyDRqobz/storage"))
    const graphQLClient = new GraphQLClient(indexer);
    const oracleData = await retry(async req => await graphQLClient.request(query))

    result = new BigNumber(0)
    for (const val of priceData.data[0].children){
            if (val["name"] === "price"){
                price = val["value"]
                break
            }
        }

    return price * oracleData["vault_aggregate"]["aggregate"]["sum"]["balance"] / 1000000 / 1000000
}

module.exports = {
    fetch
}
