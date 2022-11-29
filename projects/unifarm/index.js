const sdk = require("@defillama/sdk");
const erc20Abi = require("./erc20.json");
const BigNumber = require("bignumber.js");
const _ = require("lodash");
const {
  getCohortTokensByChainName,
  getCohortsAndProxiesByChain,
  createMulticalls,
  createMulticallForV2,
  getV2Cohorts,
  getBigNumberBalance,
  createCallForSetu,
  getFormattedBalance,
} = require("../helper/unifarm");
const {
  transformBscAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens");
// node test.js projects/unifarm/index.js
const _tvl = async (
  timestamp,
  ethBlock,
  chainBlocks,
  chain,
  transform = (a) => a
) => {
  const block = chainBlocks[chain];
  const tokens = await getCohortTokensByChainName(chain);
  const cohortAndProxies = await getCohortsAndProxiesByChain(chain);

  let calls = createMulticalls(cohortAndProxies, tokens);

  const multiCallResult = await sdk.api.abi.multiCall({
    abi: erc20Abi[0],
    calls,
    chain,
    block,
  });

  var balances = {};
  let decimalsWithChainV1 = {};

  for (var e = 0; e < tokens.length; e++) {
    const token = tokens[e];
    const balancesArray = multiCallResult.output.filter((element) => {
      return (
        String(element.input.target).toLowerCase() ===
        String(token.address).toLowerCase()
      );
    });

    var cohortBalances = [];

    if (balancesArray[0] !== undefined) {
      let j = 0;
      while (j < balancesArray.length) {
        var x = new BigNumber(balancesArray[j].output);
        var parseBalance = Number(
          String(x.dividedBy(new BigNumber(10 ** token.decimals)))
        );
        if (Number(parseBalance) > 0) {
          cohortBalances.push(parseBalance);
        }
        j++;
      }
    }

    decimalsWithChainV1[`${chain}:${token.address}`] = token.decimals;
    balances[`${chain}:${token.address}`] = new BigNumber(
      cohortBalances.reduce((a, b) => a + b, 0)
    )
      .multipliedBy(new BigNumber(10).pow(token.decimals))
      .toFixed(0);
  }

  return { balanceV1: balances, decimalsWithChainV1 };
};

const _tvl_v2 = async (
  timestamp,
  ethBlock,
  chainBlocks,
  chain,
  transform = (a) => a
) => {
  const block = chainBlocks[chain];
  const v2Cohorts = await getV2Cohorts(chain);

  let calls = createMulticallForV2(v2Cohorts);

  const multiCallResult = await sdk.api.abi.multiCall({
    abi: erc20Abi[0],
    calls,
    chain,
    block,
  });

  let balances = {};
  let decimalsWithChainV2 = {};
  for (var e = 0; e < v2Cohorts.length; e++) {
    const token = v2Cohorts[e];
    const balance = multiCallResult.output.map((element) => {
      for (let i = 0; i < token.tokens.length; i++) {
        if (
          String(element.input.target).toLowerCase() ===
          String(token.tokens[i].farmToken).toLowerCase()
        ) {
          return {
            ...element,
            decimals: token.tokens[i].decimals,
          };
        }
      }
    });

    const balancesArray = balance.filter((e) => e != undefined);
    var cohortBalances = [];

    if (balancesArray[0] !== undefined) {
      let j = 0;
      while (j < balancesArray.length) {
        var x = new BigNumber(balancesArray[j].output);
        var parseBalance = Number(
          x.dividedBy(new BigNumber(10 ** Number(balancesArray[j].decimals)))
        );

        cohortBalances.push({
          token: balancesArray[j].input.target,
          balance: parseBalance,
          decimals: Number(balancesArray[j].decimals),
        });

        j++;
      }
    }

    let sumOfBalances = {};
    let decimalsOfToken = {};

    for (let i = 0; i < cohortBalances.length; i++) {
      sumOfBalances[`${cohortBalances[i].token}`] = _.add(
        sumOfBalances[`${cohortBalances[i].token}`] >= 0
          ? sumOfBalances[`${cohortBalances[i].token}`]
          : 0,
        Number(cohortBalances[i].balance)
      );
      decimalsOfToken[`${cohortBalances[i].token}`] =
        cohortBalances[i].decimals;
    }

    Object.entries(sumOfBalances).map((item) => {
      balances[`${chain}:${item[0]}`] = new BigNumber(item[1])
        .multipliedBy(new BigNumber(10).pow(decimalsOfToken[item[0]]))
        .toFixed(0);
    });

    Object.entries(decimalsOfToken).map((item) => {
      decimalsWithChainV2[`${chain}:${item[0]}`] = item[1];
    });
  }
  return { balancesV2: balances, decimalsWithChainV2 };
};

const fetchBridgeTVL = async (timestamp, ethBlock, chainBlocks, chain) => {
  const block = chainBlocks[chain];
  const calls = createCallForSetu(chain);

  const multiCallResult = await sdk.api.abi.multiCall({
    abi: erc20Abi[0],
    calls,
    chain,
    block,
  });

  const setuBalance = {};
  multiCallResult.output.map((element) => {
    setuBalance[`${chain}:${element.input.target}`] = element.output;
  });

  return setuBalance;
};

const chainTVL = async (chain, timestamp, ethBlock, chainBlocks) => {
  let balance = {};
  const setuBalance = await fetchBridgeTVL(
    timestamp,
    ethBlock,
    chainBlocks,
    chain
  );

  Object.entries(setuBalance).map((item) => {
    balance[item[0]] = item[1];
  });

  let { balancesV2, decimalsWithChainV2 } = await _tvl_v2(
    timestamp,
    ethBlock,
    chainBlocks,
    chain
  );

  Object.entries(balancesV2).map((item) => {
    if (balance[item[0]]) {
      const getFormatBalance1 = getFormattedBalance(
        balance[item[0]],
        decimalsWithChainV2[item[0]]
      );
      const getFormatBalance2 = getFormattedBalance(
        item[1],
        decimalsWithChainV2[item[0]]
      );
      const sumOfBalace = Number(getFormatBalance1) + Number(getFormatBalance2);
      balance[item[0]] = getBigNumberBalance(
        sumOfBalace,
        decimalsWithChainV2[item[0]]
      );
    } else {
      balance[item[0]] = item[1];
    }
  });

  let { balanceV1, decimalsWithChainV1 } = await _tvl(
    timestamp,
    ethBlock,
    chainBlocks,
    chain
  );

  Object.entries(balanceV1).map((item) => {
    if (balance[item[0]]) {
      const getFormatBalance1 = getFormattedBalance(
        balance[item[0]],
        decimalsWithChainV1[item[0]]
      );
      const getFormatBalance2 = getFormattedBalance(
        item[1],
        decimalsWithChainV1[item[0]]
      );
      const sumOfBalace = Number(getFormatBalance1) + Number(getFormatBalance2);
      balance[item[0]] = getBigNumberBalance(
        sumOfBalace,
        decimalsWithChainV1[item[0]]
      );
    } else {
      balance[item[0]] = item[1];
    }
  });

  console.log({ balance });
  return balance;
};

const ethereum = async (timestamp, ethBlock, chainBlocks) => {
  const transform = await transformBscAddress();
  let balance = await chainTVL(
    timestamp,
    ethBlock,
    chainBlocks,
    "ethereum",
    transform
  );
  return balance;
};

const bsc = async (timestamp, ethBlock, chainBlocks) => {
  const transform = await transformBscAddress();
  let balance = await chainTVL(
    timestamp,
    ethBlock,
    chainBlocks,
    "bsc",
    transform
  );
  return balance;
};

const polygon = async (timestamp, ethBlock, chainBlocks) => {
  const transform = await transformPolygonAddress();
  let balance = await chainTVL(
    timestamp,
    ethBlock,
    chainBlocks,
    "polygon",
    transform
  );
  return balance;
};

module.exports = {
  ethereum: {
    tvl: ethereum,
  },
  bsc: {
    tvl: bsc,
  },
  polygon: {
    tvl: polygon,
  },
  tvl: sdk.util.sumChainTvls([ethereum, bsc, polygon]),
  methodology: "We count tvl from the cohort contracts.",
};
