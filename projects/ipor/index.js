const ADDRESSES = require('../helper/coreAssets.json')
const { abi } = require("./abi");
const { getConfig } = require('../helper/cache')

const IPOR_GITHUB_ADDRESSES_URL = "https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/main/mainnet/addresses.json";

const V2DeploymentBlockNumber = 18333744
async function tvlEthereum(api) {
  const { block } = api

  if (!block || block >= V2DeploymentBlockNumber) {
    return await calculateTvlForV2(api);
  } else {
    return await calculateTvlForV1(api);
  }
}
async function tvlArbitrum(_, block, _1, {api}) {
    const addresses = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);
    for (const pool of addresses.arbitrum.pools) {
        await api.sumTokens({owner: pool.AmmTreasury, tokens: [pool.asset]});
    }
    return api.getBalances();
}

async function calculateTvlForV2(api) {
  const addresses = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL)

  const assets = [
    ADDRESSES.ethereum.USDT, // USDT
    ADDRESSES.ethereum.USDC, // USDC
    ADDRESSES.ethereum.DAI, // DAI
  ]

  const output = await api.multiCall({ abi: abi.getAmmBalance, calls: assets, target: addresses.ethereum.IporProtocolRouter })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: assets })

  output.forEach(({ totalCollateralPayFixed, totalCollateralReceiveFixed, liquidityPool, vault }, i) => {
    const balance = +totalCollateralPayFixed + +totalCollateralReceiveFixed + +liquidityPool
    const decimal = 18 - decimals[i]
    api.add(assets[i], balance / (10 ** decimal))
  });

  for (const pool of addresses.ethereum.pools) {
    await api.sumTokens({owner: pool.AmmTreasury, tokens: [pool.asset]});
  }

  return api.getBalances();
}

async function calculateTvlForV1(api) {
  const miltonAddresses = [
    '0x28BC58e600eF718B9E97d294098abecb8c96b687', // USDT
    '0x137000352B4ed784e8fa8815d225c713AB2e7Dc9', // USDC
    '0xEd7d74AA7eB1f12F83dA36DFaC1de2257b4e7523', // DAI
  ]
  const output = await api.multiCall({ abi: abi.getAccruedBalance, calls: miltonAddresses, })
  const tokens = await api.multiCall({ abi: abi.getAsset, calls: miltonAddresses, })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })

  output.forEach(({ totalCollateralPayFixed, totalCollateralReceiveFixed, liquidityPool }, i) => {
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
    tvl: tvlArbitrum
  }
};
