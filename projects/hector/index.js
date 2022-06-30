const axios = require("axios");
const sdk = require("@defillama/sdk");
const { GraphQLClient, gql } = require("graphql-request");
const {
  sumMultiBalanceOf,
  sumSingleBalance
} = require("@defillama/sdk/build/generalUtil");
const { getChainTransform } = require("../helper/portedTokens");
const contracts = require("./contracts.json");
const { default: BigNumber } = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");
const retry = require("async-retry");
async function walletBalances(chain, chainBlocks, balances) {
  const response = (await Promise.all(
    contracts.tokenHolders[chain].map(c =>
      axios.get(
        `https://api.covalenthq.com/v1/${contracts.chainMap[c.chain]
          .chainId}/address/${c.address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
      )
    )
  )).map(a => a.data.data.items);

  const transform = await getChainTransform(chain);

  const calls = [];
  response.map((c, i) => {
    calls.push(
      ...c.map(t => ({
        target: t.contract_address,
        params: [contracts.tokenHolders[chain][i].address]
      }))
    );
  });

  const [gasBalances, erc20Balances] = await Promise.all([
    sdk.api.eth.getBalances({
      targets: calls
        .filter(c => c.target == contracts.chainMap[chain].gasToken)
        .map(c => c.params[0]),
      block: chainBlocks[chain],
      chain
    }),
    sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: calls.filter(c => c.target != contracts.chainMap[chain].gasToken),
      block: chainBlocks[chain],
      chain
    })
  ]);

  sumMultiBalanceOf(balances, erc20Balances, true, transform);
  sumSingleBalance(
    balances,
    contracts.chainMap[chain].wrappedGasToken,
    gasBalances.output
      .reduce((a, b) => a.plus(new BigNumber(b.balance)), new BigNumber("0"))
      .toFixed(0)
  );
}
async function deployedBalances(chain, chainBlocks, balances) {
  // curve
  // spooky
  // beefy
  // pancake
  // convex

  return;
}
async function hectorBank() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        bankSupplied
      }
    }
  `;
  const results = await retry(async bail => await graphQLClient.request(query));

  let a = +results.protocolMetrics[0].bankSupplied - (await borrowed());
  return toUSDTBalances(a);
}
async function borrowed() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        bankBorrowed
      }
    }
  `;
  const results = await retry(async bail => await graphQLClient.request(query));

  return results.protocolMetrics[0].bankBorrowed;
}
function tvl(chain) {
  return async (t, b, chainBlocks) => {
    let balances = {};

    await walletBalances(chain, chainBlocks, balances);
    //await deployedBalances(chain, chainBlocks, balances);

    delete balances["fantom:0x74e23df9110aa9ea0b6ff2faee01e740ca1c642e"];
    delete balances["bsc:0x1d6cbdc6b29c6afbae65444a1f65ba9252b8ca83"];

    delete balances["fantom:0x5c4fdfc5233f935f20d2adba572f770c2e377ab0"];
    delete balances["bsc:0x638eebe886b0e9e7c6929e69490064a6c94d204d"];

    return balances;
  };
}
// node test.js projects/hector/index.js
module.exports = {
  ethereum: {
    tvl: tvl("ethereum")
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([tvl("fantom"), hectorBank])
  },
  bsc: {
    tvl: tvl("bsc")
  }
};
