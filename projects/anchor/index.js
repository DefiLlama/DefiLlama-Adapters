const { request, gql } = require("graphql-request");

const graphUrl = 'https://mantle.anchorprotocol.com/'
const query = gql`
query __bAssetMarket($bAssetTokenBalanceQuery: String!) {
  ubLunaBalance: WasmContractsContractAddressStore(
    ContractAddress: "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
    QueryMsg: $bAssetTokenBalanceQuery
  ) {
    Result
    __typename
  },
  balances: BankBalancesAddress(Address: "terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s") {
    Result {
      Denom
      Amount
      __typename
    }
    __typename
  }
}
`

async function tvl(timestamp, block) {
    const result = await request(graphUrl, query, {
        "bAssetTokenBalanceQuery": '{"balance":{"address":"terra1ptjp2vfjrwh0j0faj9r6katm640kgjxnwwq9kn"}}'
    })
    const ust = Number(result.balances.Result[0].Amount) / 1e6;
    const luna = Number(JSON.parse(result.ubLunaBalance.Result).balance) / 1e6
    return {
        "terra-luna": luna,
        "terrausd": ust
    }
}


module.exports = {
    tvl,
    methodology: `We use the Anchor subgraph to get the amount of bLUNA used as collateral on anchor and the UST that is on anchor but has not been lent, we then use Coingecko to price the tokens in USD.`,
    terra: {
        tvl,
    }
}