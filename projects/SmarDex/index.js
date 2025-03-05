const sdk = require("@defillama/sdk");
const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");
const { usdnProtocolAbi, rebalancerAbi } = require("./abis");

const config = {
  bsc: "0xA8EF6FEa013034E62E2C4A9Ec1CDb059fE23Af33",
  polygon: "0x9A1e1681f6D59Ca051776410465AfAda6384398f",
  arbitrum: "0x41A00e3FbE7F479A99bA6822704d9c5dEB611F22",
  base: "0xdd4536dD9636564D891c919416880a3e250f975A",
};

const ethereumFactory = "0xB878DC600550367e14220d4916Ff678fB284214F";
const USDN_PROTOCOL_ADDRESS = "0x656cB8C6d154Aad29d8771384089be5B5141f01a";
const WSTETH_TOKEN_ADDRESS = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const REBALANCER_ADDRESS = "0xaebcc85a5594e687f6b302405e6e92d616826e03";

async function fetchUSDNData(api, block) {
  const { chain } = api;

  const getBalanceVaultCall = sdk.api.abi.call({
    target: USDN_PROTOCOL_ADDRESS,
    abi: usdnProtocolAbi.find((m) => m.name === "getBalanceVault"),
    chain,
    block,
  });

  const getBalanceLongCall = sdk.api.abi.call({
    target: USDN_PROTOCOL_ADDRESS,
    abi: usdnProtocolAbi.find((m) => m.name === "getBalanceLong"),
    chain,
    block,
  });

  const rebalancerCurrentStateDataCall = sdk.api.abi.call({
    target: REBALANCER_ADDRESS,
    abi: rebalancerAbi.find((m) => m.name === "getCurrentStateData"),
    chain,
    block,
  });

  const [balanceVault, balanceLong, rebalancerCurrentStateData] = await Promise.all([
    getBalanceVaultCall,
    getBalanceLongCall,
    rebalancerCurrentStateDataCall,
  ]);

  return {
    getBalanceVault: BigInt(balanceVault.output),
    getBalanceLong: BigInt(balanceLong.output),
    rebalancerPendingAssets: BigInt(rebalancerCurrentStateData.output[0]),
  };
}

const getEthereumTVL = async (api, block, chainBlocks) => {
  const usdnData = await fetchUSDNData(api, block);

  const usdnWstEthLocked = Number(usdnData.getBalanceLong + usdnData.getBalanceVault + usdnData.rebalancerPendingAssets);

  const uniTVL = await getUniTVL({ factory: ethereumFactory, fetchBalances: true, useDefaultCoreAssets: false })(
    api,
    block,
    chainBlocks
  );

  return {
    ...uniTVL,
    [`ethereum:${WSTETH_TOKEN_ADDRESS}`]: usdnWstEthLocked,
  };
};

Object.keys(config).forEach((chain) => {
  const factory = config[chain];
  module.exports[chain] = {
    tvl: getUniTVL({ factory, fetchBalances: true, useDefaultCoreAssets: false }),
  };
});

module.exports["ethereum"] = {
  timetravel: false,
  tvl: getEthereumTVL,
  staking: stakings(
    ["0xB940D63c2deD1184BbdE059AcC7fEE93654F02bf", "0x80497049b005Fd236591c3CD431DBD6E06eB1A31"],
    "0x5de8ab7e27f6e7a1fff3e5b337584aa43961beef"
  ),
};
