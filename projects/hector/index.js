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
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { unwrapCrv } = require("../helper/resolveCrvTokens");
const abi = require("./abi.json");
const { genericUnwrapCvx } = require("../helper/unwrapLPs");

async function walletBalances(chain, block, balances, transform) {
  const response = (await Promise.all(
    contracts.tokenHolders[chain].map(c =>
      axios.get(
        `https://api.covalenthq.com/v1/${contracts.chainMap[c.chain]
          .chainId}/address/${c.address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
      )
    )
  )).map(a => a.data.data.items);

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
      block,
      chain
    }),
    sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: calls.filter(c => c.target != contracts.chainMap[chain].gasToken),
      block,
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
async function deployedBalances(chain, block, balances, transform) {
  switch (chain) {
    case "bsc":
      await getPancakeDeposits(
        chain,
        block,
        "0xa5f8c5dbd5f286960b9d90548680ae5ebff07652",
        [2, 4, 14],
        "0x3cdf52cc28d21c5b7b91d7065fd6dfe6d426fcc5",
        balances,
        transform
      );
      return;
    case "fantom":
      await getBeefyDeposits(
        chain,
        block,
        [
          "0x8b92de822b121761a3caf894627a09a9f87864c0",
          "0xf723ae5478b1f03ca88c204f1ae5498d3576b78f"
        ],
        balances
      );
      return;
    case "ethereum":
      await getConvexDeposits(
        chain,
        block,
        "0xf403c135812408bfbe8713b5a23a04b3d48aae31",
        [61, 64],
        "0x4bfb33d65f4167ebe190145939479227e7bf2cb0",
        balances
      );
      return;
  }
}
async function getBeefyDeposits(chain, block, targets, balances) {
  const wants = (await sdk.api.abi.multiCall({
    calls: targets.map(t => ({
      target: t
    })),
    block,
    abi: abi.want,
    chain
  })).output;

  wants.map(t => {
    balances[`${chain}:${t.output.toLowerCase()}`] =
      balances[`${chain}:${t.input.target}`];
    delete balances[`${chain}:${t.input.target}`];
  });
}
async function getConvexDeposits(
  chain,
  block,
  target,
  poolIds,
  owner,
  balances
) {
  let poolInfos = (await sdk.api.abi.multiCall({
    abi: abi.poolInfo,
    target,
    calls: poolIds.map(i => ({
      params: [i]
    })),
    chain,
    block
  })).output;

  for (let i = 0; i < poolInfos.length; i++) {
    await genericUnwrapCvx(
      balances,
      owner,
      poolInfos[i].output.crvRewards,
      block,
      chain
    );
  }
}
async function getPancakeDeposits(
  chain,
  block,
  target,
  poolIds,
  owner,
  balances,
  transform
) {
  const [{ output: balance }, { output: lpToken }] = await Promise.all([
    sdk.api.abi.multiCall({
      abi: abi.userInfo,
      target,
      calls: poolIds.map(i => ({
        params: [i, owner]
      })),
      chain,
      block
    }),
    sdk.api.abi.multiCall({
      abi: abi.lpToken,
      target,
      calls: poolIds.map(i => ({
        params: [i]
      })),
      chain,
      block
    })
  ]);

  lpToken.map((t, i) => {
    sumSingleBalance(balances, transform(t.output), balance[i].output.amount);
  });
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
  const balance = +results.protocolMetrics[0].bankSupplied - (await borrowed());
  return toUSDTBalances(balance);
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
async function unwrap(balances, chain, block, transform) {
  if (chain in contracts.uniLPs) {
    await unwrapUniswapLPs(
      balances,
      contracts.uniLPs[chain].map(l => ({
        balance: balances[`${chain}:${l}`],
        token: l
      })),
      block,
      chain,
      transform
    );
  }

  if (chain in contracts.curveLPs) {
    for (let token of contracts.curveLPs[chain]) {
      await unwrapCrv(
        balances,
        token,
        balances[`${chain}:${token}`],
        block,
        chain,
        transform
      );
    }
  }
}
function tvl(chain) {
  return async (t, b, chainBlocks) => {
    let balances = {};
    const block = chainBlocks[chain];
    const transform = await getChainTransform(chain);

    await walletBalances(chain, block, balances, transform);
    await deployedBalances(chain, block, balances, transform);
    await unwrap(balances, chain, block, transform);

    delete balances["fantom:0x74e23df9110aa9ea0b6ff2faee01e740ca1c642e"];
    delete balances["bsc:0x1d6cbdc6b29c6afbae65444a1f65ba9252b8ca83"];
    delete balances["fantom:0x5c4fdfc5233f935f20d2adba572f770c2e377ab0"];
    delete balances["bsc:0x638eebe886b0e9e7c6929e69490064a6c94d204d"];

    return balances;
  };
}
const staking = async () => {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        totalValueLocked
      }
    }
  `;
  const results = await retry(async bail => await graphQLClient.request(query));
  return toUSDTBalances(+results.protocolMetrics[0].totalValueLocked);
};
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ethereum: {
    tvl: tvl("ethereum")
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([tvl("fantom"), hectorBank]),
    staking
  },
  bsc: {
    tvl: tvl("bsc")
  }
};
