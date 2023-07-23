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
const JEWEL_ONEDEX_FARM_SC_ABI = require("../jewelswap-lev-farming/jewel-onedex-farm.abi.json");
const NFT_LENDING_SC_ABI_JSON = require("./jewel-nft-lending.abi.json");

const JEWEL_ONEDEX_FARM_SC_ADDRESS = "erd1qqqqqqqqqqqqqpgqm7exdla3rzshywy99pvlxzkr45wt9kjsdfys7qqpn0";

const LENDING_POOL = "erd1qqqqqqqqqqqqqpgqhpauarfmx75nf4pwxh2fuy520ym03p8e8jcqt466up";
const LENDING_POOL_FARMS = "erd1qqqqqqqqqqqqqpgq96n4gxvmw8nxgxud8nv8qmms5namspc5vmusg930sh";
const FARMS = "erd1qqqqqqqqqqqqqpgqlnxy2hmvs8qxr6ezq2wmggn7ev62cjp6vmusvdral4";
const ASHSWAP_STAKE = "erd1qqqqqqqqqqqqqpgqhw2s04kx5crn2yvx5p253aa8fmganjjqdfysjvnluz";
const LIQUID_STAKE = "erd1qqqqqqqqqqqqqpgqx6833qjac6uqztgsa8jhlztexucke0hrdfys6wd7qt";

const abi = AbiRegistry.create(NFT_LENDING_SC_ABI_JSON);
const nftLendingSmartContract = new SmartContract({
  address: new Address(LENDING_POOL),
  abi: abi
});

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


module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl: () => getNftsTvl()
  }
};

async function getNftsTvl() {
  const egldPrice = (await getPriceFromXex("WEGLD-bd4d79")).price;
  const commonSettings = await queryNFTDataFromSc();
  const lendingTvl = convertWeiToEsdt(new BigNumber(commonSettings.total_lending_amount).plus(commonSettings.total_collateral_amount));
  const lendingTvl1InUsd = lendingTvl.multipliedBy(new BigNumber(egldPrice));
  return toUSDTBalances(lendingTvl1InUsd);
}

async function queryNFTDataFromSc() {

  try {
    const args = [
      OptionalValue.newMissing()
    ];
    const interaction = nftLendingSmartContract.methodsExplicit.viewCommonSettings(args);
    const query = interaction.check().buildQuery();
    const queryResponse = await proxyProvider.queryContract(query);
    const endpointDefinition = interaction.getEndpoint();
    const {
      firstValue,
      returnCode,
      returnMessage
    } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);

    if (!firstValue || !returnCode.isSuccess()) {
      console.error(returnMessage);
      return undefined;
    }

    const value = firstValue.valueOf();
    const decoded = {
      total_lending_amount: value.total_lending_amount.toFixed(),
      total_collateral_amount: value.total_collateral_amount.toFixed()
    };
    return decoded;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

async function getPriceFromXex(identifier) {
  const configUrl = `https://api.multiversx.com/mex/tokens/${identifier}`;
  try {
    const { data } = await axios.get(configUrl);
    return data;
  } catch (e) {
    return null;
  }
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

