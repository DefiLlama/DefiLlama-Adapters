const { abi } = require("./abi");
const { getConfig } = require('../helper/cache')

const IPOR_GITHUB_ADDRESSES_URL = "https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/refs/heads/main/mainnet/addresses.json";

const V2DeploymentBlockNumber = 18333744
async function tvlEthereum(api) {
  const { block } = api

  if (!block || block >= V2DeploymentBlockNumber) {
    return await calculateTvlForV2(api);
  } else {
    return await calculateTvlForV1(api);
  }
}

async function calculateTvlForV2(api) {
  const chain = api.chain;
  const {[chain]: { IporProtocolRouter, pools }} = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);

  // pools with swaps
  const poolsWithSwaps = pools.filter(pool => pool.swapsAvailable);
  const assets = [...new Set(poolsWithSwaps.map(pool => pool.asset))];

  const [balances, decimals] = await Promise.all([
    api.multiCall({ abi: abi.getBalancesForOpenSwap, calls: assets, target: IporProtocolRouter }),
    api.multiCall({ abi: 'erc20:decimals', calls: assets })
  ]);

  balances.forEach(({ totalCollateralPayFixed, totalCollateralReceiveFixed, liquidityPool }, i) => {
    const balance = +totalCollateralPayFixed + +totalCollateralReceiveFixed + +liquidityPool;
    api.add(assets[i], balance / (10 ** (18 - decimals[i])));
  });

  // pools without swaps
  const tokensAndOwners = pools.filter(pool => !pool.swapsAvailable).map(pool => [pool.asset, pool.AmmTreasury]);
  return api.sumTokens({ tokensAndOwners });
}

async function calculateTvlForV1(api) {
  const miltonAddresses = [
    '0x28BC58e600eF718B9E97d294098abecb8c96b687', // USDT
    '0x137000352B4ed784e8fa8815d225c713AB2e7Dc9', // USDC
    '0xEd7d74AA7eB1f12F83dA36DFaC1de2257b4e7523', // DAI
  ]
  const res = await api.multiCall({ abi: abi.getAccruedBalance, calls: miltonAddresses, })
  const tokens = await api.multiCall({ abi: abi.getAsset, calls: miltonAddresses, })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })

  res.forEach(({ totalCollateralPayFixed, totalCollateralReceiveFixed, liquidityPool }, i) => {
    const balance = +totalCollateralPayFixed + +totalCollateralReceiveFixed + +liquidityPool
    const decimal = 18 - decimals[i]
    api.add(tokens[i], balance / (10 ** decimal))
  });

  return api.getBalances();
}

module.exports = {
  methodology: `Counts the tokens locked in the AMM contracts to be used as collateral to Interest Rate Swaps derivatives, counts tokens provided as a liquidity to Liquidity Pool, counts interest gathered via Asset Manager in external protocols.`,
  ethereum: {
    tvl: tvlEthereum
  },
  arbitrum: {
    tvl: calculateTvlForV2
  },
  base: {
    tvl: calculateTvlForV2
  },
  hallmarks:[
    [1674648000, "Liquidity Mining Start"]
  ],
};
