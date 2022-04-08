const { request, gql } = require("graphql-request");
const { fetchURL } = require("../helper/utils");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://mantle.terra.dev/'
const query = gql`
query __bAssetMarket($bAssetTokenBalanceQuery: String!, $bEthTokenBalanceQuery: String!) {
  ubLunaBalance: WasmContractsContractAddressStore(
    ContractAddress: "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
    QueryMsg: $bAssetTokenBalanceQuery
  ) {
    Result
    __typename
  },
  ubEthBalance: WasmContractsContractAddressStore(
    ContractAddress: "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun"
    QueryMsg: $bEthTokenBalanceQuery
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
    "bAssetTokenBalanceQuery": '{"balance":{"address":"terra1ptjp2vfjrwh0j0faj9r6katm640kgjxnwwq9kn"}}',
    "bEthTokenBalanceQuery": '{"balance":{"address":"terra10cxuzggyvvv44magvrh3thpdnk9cmlgk93gmx2"}}'
  })
  const ust = Number(result.balances.Result[0].Amount) / 1e6;
  const luna = Number(JSON.parse(result.ubLunaBalance.Result).balance) / 1e6
  const beth = Number(JSON.parse(result.ubEthBalance.Result).balance) / 1e6
  return {
    "staked-ether": beth,
    "terra-luna": luna,
    "terrausd": ust
  }
}

async function borrowed() {
  const data = await fetchURL("https://api.anchorprotocol.com/api/v1/borrow")
  return {
    "terrausd": Number(data.data.total_borrowed) / 1e6
  }
}

async function avalancheTVL(timestamp, ethBlock, chainBlocks) {
  const chain = "avax"
  const wormholeAnchorUST = "0xaB9A04808167C170A9EC4f8a87a0cD781ebcd55e"
  const block = chainBlocks[chain]
  const { output: aUSTBalance } = await sdk.api.erc20.totalSupply({ target: wormholeAnchorUST, block, chain })
  return {
    "anchorust": BigNumber(aUSTBalance).dividedBy(10 ** 6)
  }
}

module.exports = {
  timetravel: false,
  methodology: `We use the Anchor subgraph to get the amount of bLUNA and bETH used as collateral on anchor and the UST that is on anchor but has not been lent, we then use Coingecko to price the tokens in USD.`,
  terra: {
      tvl,
      borrowed
  },
  avalanche: {
    tvl: avalancheTVL
  }
}