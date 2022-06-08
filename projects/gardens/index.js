const sdk = require("@defillama/sdk");
const { ContractFactory, ethers, providers, BigNumber } = require("ethers");
const { request, gql } = require("graphql-request");
const { toUSDTBalances, usdtAddress } = require("../helper/balances");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const BigNumberJs = require("bignumber.js");

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

const TOKEN_PRICE_QUERY = gql`
  query tokenPrice($tokenAddress: String) {
    token(id: $tokenAddress) {
      derivedETH
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

const XDAI_NODE = "https://rpc.xdaichain.com";
const abiFundManager = [
  "function balance(address _token) public view returns (uint256)",
];

async function tvl(timestamp, block, chainBlocks) {
  // let balances = BigNumber.from(0)
  let balances = {};
  let listTokens = {};

  const orgs = await request(
    "https://api.thegraph.com/subgraphs/name/1hive/gardens-xdai",
    ALL_ORGS_GQL,
    { lastID: "" }
  );

  console.log(orgs.organizations.length);
  let i = 0;
  for (const org of orgs.organizations) {
    let fundManagerContract = org.config.conviction?.fundsManager;
    let token = org.config.conviction?.requestToken.id;
    let name = org.config.conviction?.requestToken.name;
    if (!fundManagerContract || !token) {
      continue;
    }

    // let fundManagerContract = "0x4ba7362F9189572CbB1216819a45aba0d0B2D1CB";
    // let token = "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9";

    const fundManager = ContractFactory.getContract(
      fundManagerContract,
      abiFundManager,
      new providers.StaticJsonRpcProvider(XDAI_NODE)
    );
    const output = await fundManager.balance(token);

    console.log(
      `Name: ${name} Balance: ${ethers.utils.formatEther(output)} OrgID: ${
        org.id
      }`
    );
    const data = await getTokenChardData(token);
    if (data) {
      const liquidity = data[data.length - 1].totalLiquidityUSD ?? 0;
      console.log("sumup", liquidity);

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
    // if (i++ == 3) {
    //   break;
    // }
  }

  return getUSDBalancesFromTokens(listTokens);
}

async function getTokenChardData(tokenAddress) {
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
        "https://api.thegraph.com/subgraphs/name/1hive/honeyswap-xdai",
        TOKEN_CHART,
        { tokenAddr: tokenAddress, skip }
      );

      console.log("tokenDayDatas", tokenDayDatas.tokenDayDatas.length);

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

    console.log("data.length: ", data.length);
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
      "https://api.thegraph.com/subgraphs/name/1hive/honeyswap-v2",
      ALL_TOKEN_PRICE_QUERY,
      { tokenAddress: tokensIDLowerCase }
    );

    console.log("resultTokenPrice", resultTokenPrice);
    let totalPrices = new BigNumberJs(0);
    let tokensUsedInTheSum =[];
    for (const token of resultTokenPrice.tokens) {
      let objToken = tokens[token.id];

      const tokenPrice = token.derivedETH;
      const priceBN = new BigNumberJs(tokenPrice);
      // const price = Number(parseFloat(tokenPrice).toFixed(2));

      const tokenUnits = parseFloat(
        ethers.utils.formatEther(objToken.balance)
      ).toFixed(2);

      const totalUSD = priceBN.times(new BigNumberJs(tokenUnits));

      objToken = {
        ...objToken,
        totalUSD,
        totalUSDString: totalUSD.valueOf(),
        tokenPrice,
        // price,
        priceBN,
        tokenUnits,
      };
      tokens[token.id] = objToken;

      console.log(
        `Price: ${priceBN}, tokenUnits:${tokenUnits} totalUSD: ${totalUSD} token.id: ${token.id} LiquidityUSD: ${objToken.liquidityUSD}`
      );
      if (objToken.liquidityUSD.valueOf() > 10000) {
        totalPrices = totalPrices.plus(objToken.liquidityUSD);
        console.log(`Token: ${token.id} have more 10k`);
        // totalPrices  = totalPrices.plus(totalUSD) ;
        tokensUsedInTheSum.push({
          token: token.id,
          liquidityUSDString: objToken.liquidityUSDString,
        });
      }
    }
    // console.log("AllTokens", tokens);
    console.log("tokensUsedInTheSum:", tokensUsedInTheSum);
    // let usdBal = toUSDTBalances(totalPrices)[usdtAddress];
    let usdBal = toUSDTBalances(totalPrices)[usdtAddress];
    console.log(`usdBal: ${usdBal}`);
    balances[usdtAddress] = usdBal;
  } catch (error) {
    console.error(error);
  }
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl,
  },
};
