const { abi } = require("./abi");
const { default: BigNumber } = require('bignumber.js')

const CONFIG = {
  sonic: {
    factory: "0x095d35c49d2d0ea2eba3e2f9e377966db35af7e2",
    nativeToken: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // wS
  },
  avax: {
    factory: "0x5764dad2fd4b6918949c6ae86081819ca8c19749",
    nativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
  },
  manta: {
    factory: "0x6752a5d88bcbf1af7c95dda0659df81bc26314a8",
    nativeToken: "0x0Dc808adcE2099A9F62AA87D9670745AbA741746", // WETH on Manta
  },
  bsc: {
    factory: "0xc9dc65aed28bdb016726d32d0f8c2cd5c9461961",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  },
  ethereum: {
    factory: "0x4c1a8a04577286ce58d0723b1a90160f380e550a",
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  },
  base: {
    factory: "0xcb34f261a5284554bb9fea8aa12a0578c4ba3fc6",
    nativeToken: "0x4200000000000000000000000000000000000006", // WETH on Base
  },
  arbitrum: {
    factory: "0x061f8132b344cb2a32d3895eb3ebc2ff87455f79",
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH on Arbitrum
  },
};

const getVaults = async (api, factory) => {
  const vaults = await api.fetchList({ lengthAbi: abi.factory.vaultsLength, itemAbi: abi.factory.vaults, target: factory, permitFailure:true });
  const farmsAll = await api.fetchList({ lengthAbi: abi.vault.farmsLength, itemAbi: abi.vault.farms, targets: vaults, groupedByInput: true, permitFailure:true })

  return vaults.map((vault, i) => {
    const farms = farmsAll[i] || [];
    return farms.map(farm => ({ vault, farm }));
  }).flat();
};

const getVaultsConnectors = async (api, vaultFarms) => {
  console.log('🚀 ~ vaultFarms:', vaultFarms);
  const connectorsCalls = vaultFarms.map(({ farm, vault }) => ({ params: farm.beacon, target: vault }));
  const connectors = await api.multiCall({ abi: abi.vault.farmConnector, calls: connectorsCalls, permitFailure: true });

  return vaultFarms
    .map((item, i) => {
      const connector = connectors[i]
      if (!connector) return null;
      delete item.farm.data;
      return { ...item, connector };
    }).filter(item => item !== null);
};

const tvl = async (api) => {
    console.log('🚀 ~ api:', api);
  const { factory, nativeToken } = CONFIG[api.chain];
  const vaultFarms = await getVaults(api, factory);
  const vaultFarmsWithConnectors = await getVaultsConnectors(api, vaultFarms);

  const liquidityCalls = vaultFarmsWithConnectors.map(({ connector }) => ({
    target: connector, params: [connector],
  }));
  const liquidities = await api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity, permitFailure: true });
  console.log('🚀 ~ liquidities:', liquidities);

  const nativeAmountCalls = vaultFarmsWithConnectors.map(({ connector }, i) => ({
    target: connector, params: [targetAmountTo(liquidities[i]) || '0'],
  }));
  const nativeAmounts = await api.multiCall({
    calls: nativeAmountCalls,
    abi: 'function getAmountOutStakingTokenToNative(uint256 amountIn) returns (uint256 nativeAmount)',
    permitFailure: true,
  });

  const totalNativeAmount = nativeAmounts.reduce((acc, amount) => {
    if (amount && amount !== '0') return acc.plus(targetAmountFrom(amount));
    return acc;
  }, BigNumber(0)).toFixed(0);
  api.add(nativeToken, totalNativeAmount);
};

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl };
})

const TARGET_AMOUNT_MULTIPLIER = 30
function targetAmountTo(tokensInAmount) {
  const adjustedBalance = BigNumber(tokensInAmount).div(TARGET_AMOUNT_MULTIPLIER).toFixed(0);
  return adjustedBalance;
};

function targetAmountFrom(tokensOutAmount) {
  const adjustedBalance = BigNumber(tokensOutAmount).times(TARGET_AMOUNT_MULTIPLIER).toFixed(0);
  return adjustedBalance;
};
