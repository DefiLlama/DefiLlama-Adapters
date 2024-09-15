const { ResultsParser, AbiRegistry, SmartContract, Address, OptionalValue } = require("@multiversx/sdk-core/out");
const { ProxyNetworkProvider } = require("@multiversx/sdk-network-providers/out");
const NFT_LENDING_SC_ABI_JSON = require("./jewel-nft-lending.abi.json");
const { sumTokens } = require("../helper/chain/elrond");
const { nullAddress } = require("../helper/tokenMapping");


const LENDING_POOL = "erd1qqqqqqqqqqqqqpgqhpauarfmx75nf4pwxh2fuy520ym03p8e8jcqt466up";

const abi = AbiRegistry.create(NFT_LENDING_SC_ABI_JSON);
const nftLendingSmartContract = new SmartContract({
  address: new Address(LENDING_POOL),
  abi: abi
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


module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl: () => sumTokens({ owners: [LENDING_POOL] }),
    borrowed,
  }
};

async function borrowed(api) {
  const commonSettings = await queryNFTDataFromSc();
  api.add(nullAddress, commonSettings.total_loan_amount)

  return api.getBalances()
}

async function queryNFTDataFromSc() {
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
    total_collateral_amount: value.total_collateral_amount.toFixed(),
    total_loan_amount: value.total_loan_amount.toFixed(),
  };
  return decoded;
}
