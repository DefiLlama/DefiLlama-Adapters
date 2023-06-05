const { toUSDTBalances } = require("../helper/balances");
var abiFile = require("./farms.abi.json");
var {
  AbiRegistry,
  ContractFunction,
  ResultsParser,
  SmartContract,
  // SmartContractAbi,
  Address,
} = require("@multiversx/sdk-core/out");
var {
  ProxyNetworkProvider,
} = require("@multiversx/sdk-network-providers");
var axios = require("axios");
var BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk')

//provider
const provider = new ProxyNetworkProvider("https://api.multiversx.com", {
  timeout: 30000,
});

// api
const BASE_URL = "https://api.multiversx.com";
const api = axios.create({
  baseURL: BASE_URL,
});

// fetch multiversx economics for egld info
const getEconomics = async () => {
  return await api.get("/economics");
};
// fetch tokens info
const getFromAllTokens = async ({
  size = 10000,
  name = undefined,
  identifier = undefined,
  identifiers = undefined,
  search = undefined,
}) => {
  return await api.get("/tokens", {
    params: {
      identifier,
      identifiers,
      name,
      size,
      search,
    },
  });
};
// api to fetch lp prices
const fetchLpPrices = async () => {
  const { data } = await axios.get("https://eldar.solutions/api/lpapi.php");
  return data;
};
const getMexPairs = async () => {
  return await api.get("/mex/pairs?size=150");
};

/* ---------------- UTILS  ------------------------ */
const getRealBalance = (balance1, decimal) => {
  const divider = Math.pow(10, decimal ?? 18);
  const balance = new BigNumber(balance1);
  const real = balance.dividedBy(divider, 10);
  return real.toNumber();
};
const formatBalanceDolar = (token, price) => {
  if (token && token.balance) {
    const strBalance = token.balance;

    const intBalance = Number(strBalance);
    const intBalanceDolar = intBalance * Number(price);
    const realDollarAmount = getRealBalance(intBalanceDolar, token.decimals);
    return realDollarAmount;
  }
  return 0;
};

// fetch info from sc
const scQuery = async (funcName, args) => {
  try {
    const abiRegistry = await AbiRegistry.create(abiFile);
    // const abi = new SmartContractAbi(abiRegistry, ["Farms"]);
    const contract = new SmartContract({
      address: new Address(
        "erd1qqqqqqqqqqqqqpgql6dxenaameqn2uyyru3nmmpf7e95zmlxu7zskzpdcw"
      ),
      abi: abiRegistry,
    });

    const query = contract.createQuery({
      func: new ContractFunction(funcName),
      args: args,
    });
    const queryResponse = await provider.queryContract(query);
    const endpointDefinition = contract.getEndpoint(funcName);
    const parser = new ResultsParser();
    const data = parser.parseQueryResponse(queryResponse, endpointDefinition);

    return data;
  } catch (error) {
    console.log(`query error for ${funcName}  : `, error);
  }
};

// get Tvl
const tvl = async () => {
  // tvl
  let tvlDollar = 0;

  try {
    sdk.log("getting all farms");
    const scFarmsRes = await scQuery("getAllFarms", []);
    const allFarmsFirstValue = scFarmsRes?.firstValue?.valueOf();
    if (allFarmsFirstValue) {
      // get all farms from sc
      const allFarms = allFarmsFirstValue.map((farm) => {
        // sdk.log(farm);
        return {
          farm: {
            farmId: farm.field0.id.toNumber(),
            creationEpoch: farm.field0.creation_epoch.toNumber(),
            stakingToken: farm.field0.staked_token,
            rewardToken: farm.field0.reward_token,
            creator: farm.field0.creator.bech32(),
          },
          stakedBalance: farm.field2.toNumber(),
          totalRewardsLeft: farm.field3.toNumber(),
        };
      });

      // array of tokens identifiers
      const tokensIdentifiers = allFarms.map((f) => f.farm.stakingToken);
      // all tokens info
      let tokensInfo = [];

      // get the info of tokens in array from multiversx api
      sdk.log("\n\ngetting all tokens info");
      const { data: tokensData } = await getFromAllTokens({
        identifiers: tokensIdentifiers.join(","),
      });
      // add info of the returned tokens to the array of info
      tokensInfo = [...tokensData];
      // sdk.log(tokensInfo);

      // if egld is include in tokens indentifeirs, we need to get the data of egld for price
      const isEgldonTokens = tokensIdentifiers.includes("EGLD");
      if (isEgldonTokens) {
        // fetch egld data
        sdk.log("getting egld data");

        const { data: egldData } = await getEconomics();
        sdk.log("egldData", egldData);

        tokensInfo.unshift({
          type: "FungibleESDT",
          identifier: "EGLD",
          name: "EGLD",
          ticker: "EGLD",
          decimals: 18,
          price: egldData.data.price,
          marketCap: egldData.data.marketCap,
          supply: egldData.data.totalSupply,
          circulatingSupply: egldData.data.circulatingSupply,
        });
      }

      sdk.log("\n\ngetting lp prices");
      const lptokensInfo = await fetchLpPrices();
      // sdk.log(lptokensInfo);

      sdk.log("\n\ngetting mex pairs");
      const { data: mexPairs } = await getMexPairs();

      const pools = mexPairs
        ? allFarms.filter(
            (farm) =>
              mexPairs.findIndex(
                (mexPair) => mexPair.id === farm.farm.stakingToken
              ) === -1
          )
        : [];
      const farms = mexPairs
        ? allFarms.filter(
            (farm) =>
              mexPairs.findIndex(
                (mexPair) => mexPair.id === farm.farm.stakingToken
              ) !== -1 || farm.farm.stakingToken == "RAREWEGLD-b29251"
          )
        : [];

      // sdk.log(pools);
      // sdk.log(farms.length);

      // get tvl in dollar for farms
      for (let i = 0; i < farms.length; i++) {
        // info from sc about the farm
        const farm = farms[i];

        const stakingToken = tokensInfo.find(
          (token) => token.identifier === farm.farm.stakingToken
        );
        const lpPrice =
          lptokensInfo.find(
            (lpToken) => lpToken.token === farm.farm.stakingToken
          )?.tokenvalue || 0;

        tvlDollar += formatBalanceDolar(
          {
            balance: farm.stakedBalance,
            decimals: stakingToken.decimals,
          },
          Number(lpPrice)
        );
        // sdk.log(stakingToken?.identifier);
        // sdk.log(farm.stakedBalance);
        // sdk.log(tvlDollar);
      }

      //   // get tvl in dollar for pools
      for (let i = 0; i < pools.length; i++) {
        const farm = pools[i];

        const stakingToken = tokensInfo.find(
          (token) => token.identifier === farm.farm.stakingToken
        );

        if (stakingToken?.identifier != "BONEZ-ff9a73" 
        && stakingToken?.identifier != "RAREWEGLD-b29251"
        && farm.farm.farmId != 36
        && farm.farm.farmId != 41) {
          tvlDollar += formatBalanceDolar(
            {
              balance: farm.stakedBalance,
              decimals: stakingToken.decimals,
            },
            stakingToken?.price
          );
          // sdk.log(stakingToken?.identifier);
          // sdk.log(tvlDollar);
          // sdk.log(farm);
        }
      }

      sdk.log("\n\nTotal calculated: ", tvlDollar);
      return toUSDTBalances(tvlDollar);
    }
  } catch (err) {
    sdk.log("Exeption error : ", err);
  }
  return tvlDollar;
};

module.exports = {
  methodology: "It counts the TVL from the Staking Farms/Pools of QuantumX.",
  elrond: {
    tvl,
  },
};
