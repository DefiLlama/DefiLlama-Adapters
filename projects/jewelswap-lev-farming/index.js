const { getNFTs, sumTokens } = require("../helper/chain/elrond");
const { ResultsParser, AbiRegistry, SmartContract, Address, } = require("@multiversx/sdk-core/out");
const { ProxyNetworkProvider } = require("@multiversx/sdk-network-providers/out");
const JEWEL_ONEDEX_FARM_SC_ABI = require("./jewel-onedex-farm.abi.json");


const JEWEL_ONEDEX_FARM_SC_ADDRESS = "erd1qqqqqqqqqqqqqpgqm7exdla3rzshywy99pvlxzkr45wt9kjsdfys7qqpn0";
const LENDING_POOL_FARMS = "erd1qqqqqqqqqqqqqpgq96n4gxvmw8nxgxud8nv8qmms5namspc5vmusg930sh";

const FARMS = "erd1qqqqqqqqqqqqqpgqlnxy2hmvs8qxr6ezq2wmggn7ev62cjp6vmusvdral4";
const FARMS2 = "erd1qqqqqqqqqqqqqpgqx6833qjac6uqztgsa8jhlztexucke0hrdfys6wd7qt";

const jewelOnedexFarmAbiRegistry = AbiRegistry.create(JEWEL_ONEDEX_FARM_SC_ABI);
const jewelOnedexFarmSmartContract = new SmartContract({
  address: new Address(JEWEL_ONEDEX_FARM_SC_ADDRESS),
  abi: jewelOnedexFarmAbiRegistry
});


const networkConfigs = {
  mainnet: {
    id: "mainnet",
    chainId: "1",
    apiUrl: "https://api.multiversx.com",
    gatewayUrl: "https://gateway.multiversx.com",
    explorerUrl: "https://explorer.multiversx.com",
    apiTimeout: 10000
  }
};


const ELROND_NETWORK = "mainnet";
const networkConfig = networkConfigs[ELROND_NETWORK];

const proxyProvider = new ProxyNetworkProvider(networkConfig.gatewayUrl, {
  timeout: networkConfig.apiTimeout
});


async function tvl(api) {

  addNfts(await getNFTs(FARMS))
  addNfts(await getNFTs(FARMS2))
  await oneDexFarm(api)
  return sumTokens({ owners: [LENDING_POOL_FARMS, ], balances: api.getBalances() })

  function addNfts(nfts) {
    nfts.forEach(nft => {
      let lpToken
      switch (nft.collection) {
        case "FARM-e5ffde": lpToken = "ALP-2d0cf8"; break;
        case "FARM-9ed1f9": lpToken = "ALP-5f9191"; break;
        case "FARM-ccefc2": lpToken = "ALP-0fe50a"; break;
        case "FARM-795466": lpToken = "ALP-afc922"; break;
        case "FARM-b637f0": lpToken = "ALP-713ae8"; break;
        case "FARM-83c131": lpToken = "ALP-f7dee1"; break;
        default: lpToken = null;
      }
      if (lpToken) api.add(lpToken, nft.balance)
    })
  }
}

async function oneDexFarm(api) {
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
    token0: value.first_token_id.toString(),
    token1: value.second_token_id.toString(),
    lpAmount: value.lp_token_amount.toFixed(0),
    lpSupply: value.lp_token_supply.toFixed(0),
    token0Supply: value.first_token_reserve.toFixed(0),
    token1Supply: value.second_token_reserve.toFixed(0)
  }));
  decoded.forEach(({ token0, token1, lpAmount, lpSupply, token0Supply, token1Supply}) => {
    const ratio = lpAmount / lpSupply
    api.add(token0, token0Supply * ratio)
    api.add(token1, token1Supply * ratio)
  })
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl
  }
};
