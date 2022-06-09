const { ContractFactory, ethers, providers, BigNumber } = require("ethers");
const { request, gql } = require("graphql-request");
const { toUSDTBalances, usdtAddress } = require("../helper/balances");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const BigNumberJs = require("bignumber.js");

const DEBUG = false;

const SUBGRAPH_HONEYSWAP_V2 =
  "https://api.thegraph.com/subgraphs/name/1hive/honeyswap-v2";
const SUBGRAPH_HONEYSWAP_XDAI =
  "https://api.thegraph.com/subgraphs/name/1hive/honeyswap-xdai";
const SUBGRAPH_GARDENS_XDAI =
  "https://api.thegraph.com/subgraphs/name/1hive/gardens-xdai";

const XDAI_NODE = "https://rpc.xdaichain.com";
const abiFundManager = [
  "function balance(address _token) public view returns (uint256)",
];

function _log(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

const ALL_ORGS_GQL = gql`
  query allOrgs($lastID: ID) {
    organizations(first: 1000, where: { id_gt: $lastID, active: true }) {
      id
      token {
        name
        id
      }
      config {
        conviction {
          requestToken {
            id
            name
          }
          fundsManager
        }
      }
      proposalCount
      active
    }
  }
`;

const ALL_TOKEN_PRICE_QUERY = gql`
  query pricesTokens($tokenAddress: [ID]) {
    tokens(where: { id_in: $tokenAddress }) {
      id
      derivedETH
      tradeVolume
      tradeVolumeUSD
      untrackedVolumeUSD
      totalLiquidity
    }
  }
`;
const TOKEN_CHART = gql`
  query tokenDayDatas($tokenAddr: String!, $skip: Int!) {
    tokenDayDatas(
      first: 1000
      skip: $skip
      orderBy: date
      orderDirection: asc
      where: { token: $tokenAddr }
    ) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityNativeCurrency
      dailyVolumeNativeCurrency
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`;

async function getAllOrgs() {
  let allFound = false;
  let lastID = "";
  let data = [];

  try {
    while (!allFound) {
      const orgs = await request(
        SUBGRAPH_GARDENS_XDAI,
        ALL_ORGS_GQL,
        { lastID }
      );


      const numOrgs = orgs.organizations.length;
      
      if (numOrgs < 1000) {
        allFound = true;
      }
      lastID = orgs.organizations[numOrgs-1].id;
      data = data.concat(orgs.organizations);
    }
  } catch (error) {
    console.error(error);
  }
  _log("numOrgs", data.length);
  return data;
}

async function tvl(timestamp, block, chainBlocks) {
  let listTokens = {};

  const orgs = await getAllOrgs();
  for (const org of orgs) {
    let fundManagerContract = org.config.conviction?.fundsManager;
    let token = org.config.conviction?.requestToken.id;
    let name = org.config.conviction?.requestToken.name;
    if (!fundManagerContract || !token) {
      continue;
    }

    const fundManager = ContractFactory.getContract(
      fundManagerContract,
      abiFundManager,
      new providers.StaticJsonRpcProvider(XDAI_NODE)
    );
    const output = await fundManager.balance(token);

    _log(
      `Name: ${name} Balance: ${ethers.utils.formatEther(output)} OrgID: ${
        org.id
      }`
    );
    const data = await getTokenChartData(token);
    if (data) {
      const liquidity = data[data.length - 1].totalLiquidityUSD ?? 0;
      _log("sumup", liquidity);

      listTokens[token] = {
        name,
        org: org.id,
        balance: output,
        liquidityUSD: new BigNumberJs(liquidity),
        liquidityUSDString: new BigNumberJs(liquidity).valueOf(),
      };
    } else {
      console.error(`Cannnot find token chart data of token: ${token}`);
    }
  }

  return getUSDBalancesFromTokens(listTokens);
}

async function getTokenChartData(tokenAddress) {
  let allFound = false;
  let skip = 0;
  let data = [];

  const utcEndTime = dayjs.utc();
  let utcStartTime = utcEndTime.subtract(1, "year");
  let startTime = utcStartTime.startOf("minute").unix() - 1;
  try {
    tokenAddress = tokenAddress.toLowerCase();
    while (!allFound) {
      const tokenDayDatas = await request(
        SUBGRAPH_HONEYSWAP_XDAI,
        TOKEN_CHART,
        { tokenAddr: tokenAddress, skip }
      );

      _log("tokenDayDatas", tokenDayDatas.tokenDayDatas.length);

      if (tokenDayDatas.tokenDayDatas.length < 1000) {
        allFound = true;
      }
      skip += 1000;
      data = data.concat(tokenDayDatas.tokenDayDatas);
    }

    let dayIndexSet = new Set();
    let dayIndexArray = [];
    const oneDay = 24 * 60 * 60;
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
    });

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime;
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD;
    let latestPriceUSD = data[0] && data[0].priceUSD;
    let index = 1;
    while (timestamp < utcEndTime.startOf("minute").unix() - oneDay) {
      const nextDay = timestamp + oneDay;
      let currentDayIndex = (nextDay / oneDay).toFixed(0);
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
        });
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
        latestPriceUSD = dayIndexArray[index].priceUSD;
        index = index + 1;
      }
      timestamp = nextDay;
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));

    _log("data.length: ", data.length);
  } catch (error) {
    console.error(error);
  }
  return data;
}

async function getUSDBalancesFromTokens(tokens) {
  let balances = {};
  balances[usdtAddress] = BigNumberJs(0);

  try {
    tokensIDLowerCase = Object.keys(tokens).map((token) => token.toLowerCase());

    const resultTokenPrice = await request(
      SUBGRAPH_HONEYSWAP_V2,
      ALL_TOKEN_PRICE_QUERY,
      { tokenAddress: tokensIDLowerCase }
    );

    _log("resultTokenPrice", resultTokenPrice);
    let totalPrices = new BigNumberJs(0);
    let tokensUsedInTheSum = [];
    for (const token of resultTokenPrice.tokens) {
      let objToken = tokens[token.id];

      const tokenPrice = token.derivedETH;
      const tokenPriceBN = new BigNumberJs(tokenPrice);

      const tokenUnits = parseFloat(
        ethers.utils.formatEther(objToken.balance)
      ).toFixed(2);

      const totalUSD = tokenPriceBN.times(new BigNumberJs(tokenUnits));

      objToken = {
        ...objToken,
        totalUSD,
        totalUSDString: totalUSD.valueOf(),
        tokenPrice,
        tokenPriceBN,
        tokenUnits,
      };
      tokens[token.id] = objToken;

      _log(
        `Price: ${tokenPriceBN}, tokenUnits:${tokenUnits} totalUSD: ${totalUSD} token.id: ${token.id} LiquidityUSD: ${objToken.liquidityUSD}`
      );
      if (objToken.liquidityUSD.valueOf() > 10000) {
        _log(`Token: ${token.id} have more 10k`);
        totalPrices = totalPrices.plus(totalUSD);
        tokensUsedInTheSum.push({
          ...objToken,
          token: token.id,
          liquidityUSDString: objToken.liquidityUSDString,
        });
      }
    }
    _log("tokensUsedInTheSum:", tokensUsedInTheSum);
    let usdBal = toUSDTBalances(totalPrices)[usdtAddress];
    _log(`usdBal: ${usdBal}`);
    balances[usdtAddress] = usdBal;
  } catch (error) {
    console.error(error);
  }
  return balances;
}

module.exports = {
  methodology:
    '"Uses Gardens and Honeyswap Subgraph to finds USD value of Common Pool treasuries for tokens with greater than $10k of liquidity on Honeyswap"',
  misrepresentedTokens: true,
  xdai: {
    tvl,
  },
};
