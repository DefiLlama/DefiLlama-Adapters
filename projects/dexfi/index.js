const { abi } = require("./abi");
const { default: BigNumber } = require('bignumber.js')
const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs');

const CONFIG = {
  sonic: {
    factory: "0x095d35c49d2d0ea2eba3e2f9e377966db35af7e2",
    nativeToken: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
    start: '2025-05-03',
  },
  avax: {
    factory: "0x5764dad2fd4b6918949c6ae86081819ca8c19749",
    nativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    start: '2025-08-12',
  },
  bsc: {
    factory: "0xc9dc65aed28bdb016726d32d0f8c2cd5c9461961",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    start: '2025-10-03',
  },
  ethereum: {
    factory: "0x4c1a8a04577286ce58d0723b1a90160f380e550a",
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    start: '2026-01-29',
  },
  base: {
    factory: "0xcb34f261a5284554bb9fea8aa12a0578c4ba3fc6",
    nativeToken: "0x4200000000000000000000000000000000000006",
    start: '2025-04-12',
  },
  arbitrum: {
    factory: "0x061f8132b344cb2a32d3895eb3ebc2ff87455f79",
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    start: '2026-02-17',
  },
};

const GDEX_TOKEN = "0x53Cb59D32a8d08fC6D3f81454f150946A028A44d";
const STAKING_CONTRACT = "0xd7D11E2d4E8E7b65E905aa9d16E488C37195Ca62";
const POOL2_ADDRESS = "0x65B6ee9CaC744D4eed9886406EAD6bc4E5681068";

const TARGET_AMOUNT_MULTIPLIER = 50;

function estimatedAmountTo(tokensInAmount) {
  return BigNumber(tokensInAmount).div(TARGET_AMOUNT_MULTIPLIER).toFixed(0);
}

function estimatedAmountFrom(tokensOutAmount) {
  return BigNumber(tokensOutAmount).times(TARGET_AMOUNT_MULTIPLIER).toFixed(0);
}

const getVaults = async (api, factory) => {
  const vaults = await api.fetchList({ lengthAbi: abi.factory.vaultsLength, itemAbi: abi.factory.vaults, target: factory, permitFailure: true });
  const farmsAll = await api.fetchList({ lengthAbi: abi.vault.farmsLength, itemAbi: abi.vault.farms, targets: vaults, groupedByInput: true, permitFailure: true });

  return vaults.map((vault, i) => {
    const farms = farmsAll[i] || [];
    return farms.map(farm => ({ vault, farm }));
  }).flat();
};

const getVaultsConnectors = async (api, vaultFarms) => {
  const connectorsCalls = vaultFarms.map(({ farm, vault }) => ({ params: farm.beacon, target: vault }));
  const connectors = await api.multiCall({ abi: abi.vault.farmConnector, calls: connectorsCalls, permitFailure: true });

  return vaultFarms
    .map((item, i) => {
      const connector = connectors[i];
      if (!connector) return null;
      delete item.farm.data;
      return { ...item, connector };
    }).filter(item => item !== null);
};

const tvl = async (api) => {
  const { factory, nativeToken } = CONFIG[api.chain];
  const vaultFarms = await getVaults(api, factory);
  const vaultFarmsWithConnectors = await getVaultsConnectors(api, vaultFarms);

  const liquidityCalls = vaultFarmsWithConnectors.map(({ connector }) => ({
    target: connector, params: [connector],
  }));
  const liquidities = await api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity, permitFailure: true });

  // call to estimate a swapping a `1/TARGET_AMOUNT_MULTIPLIER` of locked tvl to native
  const nativeAmountCalls = vaultFarmsWithConnectors.map(({ connector }, i) => ({
    target: connector, params: [liquidities[i] ? estimatedAmountTo(liquidities[i]) : '0'],
  }));
  const nativeAmounts = await api.multiCall({
    calls: nativeAmountCalls,
    abi: 'function getAmountOutStakingTokenToNative(uint256 amountIn) returns (uint256 nativeAmount)',
    permitFailure: true,
  });

  const totalNativeAmount = nativeAmounts.reduce((acc, amount) => {
    if (amount && amount !== '0') return acc.plus(estimatedAmountFrom(amount));
    return acc;
  }, BigNumber(0)).toFixed(0);
  api.add(nativeToken, totalNativeAmount);
};

async function pool2(api) {
  const [token0, token1] = await Promise.all([
    api.call({ abi: 'address:token0', target: POOL2_ADDRESS }),
    api.call({ abi: 'address:token1', target: POOL2_ADDRESS }),
  ]);
  return sumTokens2({ api, ownerTokens: [[[token0, token1], POOL2_ADDRESS]] });
}

module.exports = {
  methodology: "TVL is calculated by converting locked staking token liquidity to native token equivalent via on-chain swap estimation across all vaults",
  hallmarks: [
    ['2025-04-12', "Launch on Base"],
    ['2025-05-03', "Launch on Sonic"],
    ['2025-08-12', "Launch on Avalanche"],
    ['2025-10-03', "Launch on BNB Chain"],
    ['2026-01-29', "Launch on Ethereum"],
    ['2026-02-17', "Launch on Arbitrum"],
  ],
  sonic:    { tvl, start: CONFIG.sonic.start },
  avax:     { tvl, start: CONFIG.avax.start },
  bsc:      { tvl, start: CONFIG.bsc.start },
  ethereum: { tvl, start: CONFIG.ethereum.start },
  base:     { tvl, start: CONFIG.base.start, staking: staking(STAKING_CONTRACT, GDEX_TOKEN), pool2, },
  arbitrum: { tvl, start: CONFIG.arbitrum.start },
};