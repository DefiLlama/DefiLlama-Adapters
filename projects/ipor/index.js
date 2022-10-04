const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { abi } = require("./abi");
const miltonAddresses = [
  '0x28BC58e600eF718B9E97d294098abecb8c96b687', // USDT
  '0x137000352B4ed784e8fa8815d225c713AB2e7Dc9', // USDC
  '0xEd7d74AA7eB1f12F83dA36DFaC1de2257b4e7523', // DAI
]

const underlyings = [
  {
    symbol: "USDT",
    underlyingAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    miltonAddress: "",
    underlyingDecimals: 6,
    outputDecimals: 18,
  },
  {
    symbol: "USDC",
    underlyingAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    miltonAddress: "",
    underlyingDecimals: 6,
    outputDecimals: 18,
  },
  {
    symbol: "DAI",
    underlyingAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    miltonAddress: "",
    underlyingDecimals: 18,
    outputDecimals: 18,
  },
];

async function tvl(_, block) {
  const balances = {};
  const calls = miltonAddresses.map(i => ({ target: i }))
  const { output  } = await sdk.api.abi.multiCall({
    abi: abi.getAccruedBalance,
    calls, block,
  })
  const { output: underlyings  } = await sdk.api.abi.multiCall({
    abi: abi.getAsset,
    calls, block,
  })
  const tokens = underlyings.map(i => i.output)
  const { output: decimals } = await sdk.api.abi.multiCall({
    abi: 'erc20:decimals',
    calls: tokens.map(i => ({ target: i })), block,
  })

  output.forEach(({ output: { totalCollateralPayFixed, totalCollateralReceiveFixed, liquidityPool }}, i) => {
    const balance = +totalCollateralPayFixed + +totalCollateralReceiveFixed + +liquidityPool
    const decimal = 18 - decimals[i].output
    sdk.util.sumSingleBalance(balances, tokens[i], BigNumber(balance / (10 ** decimal)).toFixed(0))
  });

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the AMM contracts to be used as collateral to Interest Rate Swaps derivatives, counts tokens provided as a liquidity to Liquidity Pool, counts interest gathered via Asset Manager in external protocols.`,
  ethereum: {
    tvl
  }
};
