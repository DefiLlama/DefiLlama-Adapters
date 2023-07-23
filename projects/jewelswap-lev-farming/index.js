const { toUSDTBalances } = require("../helper/balances");
const { sumTokens } = require("../helper/chain/elrond");
const { get } = require("../helper/http");
const { sumTokensExport } = require("../helper/chain/cardano");
const { getPrices } = require("../algofi/utils");
const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");
const axios = require("axios");
const BigNumber = require("bignumber.js");
const { ResultsParser, AbiRegistry, SmartContract, Address, OptionalValue } = require("@multiversx/sdk-core/out");
const { ProxyNetworkProvider } = require("@multiversx/sdk-network-providers/out");
const JEWEL_ONEDEX_FARM_SC_ABI = require("./jewel-onedex-farm.abi.json");

const JEWEL_ONEDEX_FARM_SC_ADDRESS = "erd1qqqqqqqqqqqqqpgqm7exdla3rzshywy99pvlxzkr45wt9kjsdfys7qqpn0";

const LENDING_POOL = "erd1qqqqqqqqqqqqqpgqhpauarfmx75nf4pwxh2fuy520ym03p8e8jcqt466up";
const LENDING_POOL_FARMS = "erd1qqqqqqqqqqqqqpgq96n4gxvmw8nxgxud8nv8qmms5namspc5vmusg930sh";
const FARMS = "erd1qqqqqqqqqqqqqpgqlnxy2hmvs8qxr6ezq2wmggn7ev62cjp6vmusvdral4";
const ASHSWAP_STAKE = "erd1qqqqqqqqqqqqqpgqhw2s04kx5crn2yvx5p253aa8fmganjjqdfysjvnluz";
const LIQUID_STAKE = "erd1qqqqqqqqqqqqqpgqx6833qjac6uqztgsa8jhlztexucke0hrdfys6wd7qt";


const ASHSWAP_API_GRAPHQL_URL = "https://api-v2.ashswap.io/graphql";
const ASHSWAP_API_GRAPHQL_PARAM = {
  "query": "\n                query ashBaseStateQuery($accAddress: String = \"\") {\n                    farms(address: $accAddress) {\n                        address\n                        farmToken {\n                            ...allTokenProps\n                        }\n                        rewardToken {\n                            ...allTokenProps\n                        }\n                        farmingToken {\n                            ...allTokenProps\n                        }\n                        farmTokenSupply\n                        rewardPerSec,\n                        rewardPerShare\n                        state\n                        lastRewardBlockTs\n                        divisionSafetyConstant\n                        farmingTokenBalance\n                        produceRewardEnabled\n                        account {\n                            slopeBoosted\n                        }\n                        shard\n                 }\n                    pools {\n                        address\n                        lpToken {\n                            ...allTokenProps\n                        }\n                        tokens {\n                            ...allTokenProps\n                        }\n                        reserves\n                        totalSupply\n                        swapFeePercent\n                        adminFeePercent\n                        ampFactor\n                        state\n                    }\n                    poolsV2 {\n                        address\n                        lpToken {\n                            ...allTokenProps\n                        }\n                        totalSupply\n                        reserves\n                        priceScale\n                        ampFactor\n                        gamma\n                        xp\n                        futureAGammaTime\n                        d\n                        midFee\n                        outFee\n                        feeGamma\n                    }\n                    tokens {\n                        ...allTokenProps\n                    }\n                    votingEscrows(address: $accAddress) {\n                        address\n                        lockedToken {\n                            ...allTokenProps\n                        }\n                        totalLock\n                        veSupply\n                        account {\n                            locked {\n                                amount\n                                end\n                            }\n                        }\n                    }\n                    feeDistributor(address: $accAddress) {\n                        address\n                        rewardToken {\n                            ...allTokenProps\n                        }\n                        account {\n                            reward\n                        }\n                    }\n                    blockchain {\n                        blockShards {\n                            shard\n                            nonce\n                        }\n                    }\n\n                    \n\n\n\n\n\n\n        ashSupply\n    \n\n\n\n        rewarder {\n            address\n            rewardPerSec\n        }\n    \n                }\n\n                fragment allTokenProps on Token {\n                    id\n                    price\n                }\n            ",
  "variables": {
    "accAddress": "erd1f0dwxpl3vxe936cla2mkky7nym4g3xn4vgfz497dpupqul8uktzshxqj5l"
  },
  "operationName": "ashBaseStateQuery"
};
const jewelOnedexFarmAbiRegistry = AbiRegistry.create(JEWEL_ONEDEX_FARM_SC_ABI);
const jewelOnedexFarmSmartContract = new SmartContract({
  address: new Address(JEWEL_ONEDEX_FARM_SC_ADDRESS),
  abi: jewelOnedexFarmAbiRegistry
});


const networkConfigs = {
  devnet: {
    id: "devnet",
    chainId: "D",
    apiUrl: "https://devnet-api.multiversx.com",
    gatewayUrl: "https://devnet-gateway.multiversx.com",
    explorerUrl: "https://devnet-explorer.multiversx.com",
    apiTimeout: 10000
  },

  testnet: {
    id: "testnet",
    chainId: "T",
    apiUrl: "https://testnet-api.multiversx.com",
    gatewayUrl: "https://testnet-gateway.multiversx.com",
    explorerUrl: "https://testnet-explorer.multiversx.com",
    apiTimeout: 10000
  },

  mainnet: {
    id: "mainnet",
    chainId: "1",
    apiUrl: "https://api.multiversx.com",
    gatewayUrl: "https://proxy.jewelswap.io",
    explorerUrl: "https://explorer.multiversx.com",
    apiTimeout: 10000
  }
};


const ELROND_NETWORK = "mainnet";
const networkConfig = networkConfigs[ELROND_NETWORK];

const proxyProvider = new ProxyNetworkProvider(networkConfig.gatewayUrl, {
  timeout: networkConfig.apiTimeout
});


async function getTvlLiquid() {
  const egldPrice = (await getPriceFromXex("WEGLD-bd4d79")).price;
  const data = await getAshSwapTokens();
  const tokens = data.data.tokens;

  const farms = await getAccountNftsByCollectionId(FARMS);
  let totalPrice = new BigNumber(0);

  //assigning LPs
  for (let farm in farms) {
    if (farms[farm]["collection"] === "FARM-e5ffde") {
      farms[farm]["lp_token_id"] = "ALP-2d0cf8";
    }
    if (farms[farm]["collection"] === "FARM-9ed1f9") {
      farms[farm]["lp_token_id"] = "ALP-5f9191";
    }
    if (farms[farm]["collection"] === "FARM-ccefc2") {
      farms[farm]["lp_token_id"] = "ALP-0fe50a";
    }
    if (farms[farm]["collection"] === "FARM-795466") {
      farms[farm]["lp_token_id"] = "ALP-afc922";
    }
  }

  for (let farm in farms) {
    for (let token in tokens) {
      if (farms[farm]["lp_token_id"] === tokens[token]["id"]) {
        const farmValue = new BigNumber(farms[farm]["balance"]).multipliedBy(tokens[token]["price"]).toFixed();
        totalPrice = totalPrice.plus(farmValue);
      }
    }
  }
  let total = convertWeiToEsdt(totalPrice);

  const onedexValue = await getOneDexFarm(egldPrice);
  total = total.plus(onedexValue);
  return toUSDTBalances(total);
}

async function getOneDexFarm(egldPrice) {
  const farms = await oneDexFarm();

  let totalOneDex = new BigNumber(0);
  for (const farm of farms) {
    const value = (new BigNumber(farm.lp_token_amount).multipliedBy(farm.second_token_reserve).dividedBy(farm.lp_token_supply));
    let secondTokenValue = convertWeiToEsdt(value, getTokenDecimal(farm.second_token_id));
    if (farm.second_token_id != "USDT-f8c08c") {
      secondTokenValue = secondTokenValue.multipliedBy(new BigNumber(egldPrice));
    }
    totalOneDex = totalOneDex.plus(secondTokenValue.multipliedBy(new BigNumber(2)));
  }
  return totalOneDex;
}

async function oneDexFarm() {

  try {
    const interaction =
      jewelOnedexFarmSmartContract.methodsExplicit.viewFarms();
    const query = interaction.check().buildQuery();
    const queryResponse =
      await proxyProvider.queryContract(query);
    const endpointDefinition = interaction.getEndpoint();
    const { firstValue, returnCode, returnMessage } =
      new ResultsParser().parseQueryResponse(
        queryResponse,
        endpointDefinition
      );

    if (!firstValue || !returnCode.isSuccess()) {
      throw Error(returnMessage);
    }

    const values = firstValue.valueOf();
    const decoded = values.map((value) => ({
      first_token_id: value.first_token_id.toString(),
      second_token_id: value.second_token_id.toString(),
      lp_token_amount: value.lp_token_amount.toFixed(0),
      lp_token_supply: value.lp_token_supply.toFixed(0),
      first_token_reserve: value.first_token_reserve.toFixed(0),
      second_token_reserve: value.second_token_reserve.toFixed(0),
    }));
    return decoded;
  } catch (e) {

    return [];
  }
}

async function getAccountNftsByCollectionId(address) {
  try {
    const url = `https://api.multiversx.com/accounts/${address}/nfts?size=200`;

    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    this.logger.error("getAccountNftsByCollectionId: failed", error);
    return [];
  }
}

async function getAshSwapTokens() {
  try {
    const { data } = await axios.post(ASHSWAP_API_GRAPHQL_URL, ASHSWAP_API_GRAPHQL_PARAM);
    return data;
  } catch (error) {
    this.logger.error("getAshswapTokens: failed", error);
  }
}


module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl: () => getTvlLiquid()
  }
};

async function getPriceFromXex(identifier) {
  const configUrl = `https://api.multiversx.com/mex/tokens/${identifier}`;
  try {
    const { data } = await axios.get(configUrl);
    return data;
  } catch (e) {

  }
  return null;
}

function getTokenDecimal(tokenId) {
  console.log(tokenId);
  if (tokenId === "EGLD") {
    return 18;
  }

  if (tokenId.includes("-")) {
    const tokenTicker = tokenId.split("-")[0];

    if (tokenTicker === "WEGLD") return 18;
    if (tokenTicker === "USDT") return 6;
    if (tokenTicker === "USDC") return 6;
    if (tokenTicker === "BUSD") return 18;
    if (tokenTicker === "ASH") return 18;
    if (tokenTicker === "ALP") return 18;
    if (tokenTicker === "JWLASH") return 18;
  }
}

function convertWeiToEsdt(amount, decimals, precision) {
  if (!amount) amount = "0";
  return new BigNumber(amount).shiftedBy(decimals == null ? -18 : -decimals).decimalPlaces(precision == null ? 4 : precision, BigNumber.ROUND_FLOOR);
}

