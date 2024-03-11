const ADDRESSES = require('../helper/coreAssets.json')
const { abi } = require("./abi");

const V2DeploymentBlockNumber = 18333744

async function tvlEthereum(_, block, _1, { api }) {
  if (block >= V2DeploymentBlockNumber) {
    return await calculateTvlForV2(api);
  } else {
    return await calculateTvlForV1(api);
  }
}
async function tvlArbitrum(_, block, _1, {api}) {
    const ammTreasuryWstEthArbitrum = '0xBd013Ea2E01C2Ab3462dd67e9C83aa3834882A5D'
    return api.sumTokens({owner: ammTreasuryWstEthArbitrum, tokens: [ADDRESSES.arbitrum.WSTETH]})
}

async function calculateTvlForV2(api) {
  const assets = [
    ADDRESSES.ethereum.USDT, // USDT
    ADDRESSES.ethereum.USDC, // USDC
    ADDRESSES.ethereum.DAI, // DAI
  ]

  const iporRouter = '0x16d104009964e694761C0bf09d7Be49B7E3C26fd'
  const ammTreasuryEth = '0x63395EDAF74a80aa1155dB7Cd9BBA976a88DeE4E'

  const output = await api.multiCall({ abi: abi.getAmmBalance, calls: assets, target: iporRouter, })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: assets })

  output.forEach(({ totalCollateralPayFixed, totalCollateralReceiveFixed, liquidityPool, vault }, i) => {
    const balance = +totalCollateralPayFixed + +totalCollateralReceiveFixed + +liquidityPool
    const decimal = 18 - decimals[i]
    api.add(assets[i], balance / (10 ** decimal))
  })

  return api.sumTokens({ owner: ammTreasuryEth, tokens: [ADDRESSES.ethereum.STETH] })
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
