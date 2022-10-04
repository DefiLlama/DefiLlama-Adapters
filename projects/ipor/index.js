const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { abi } = require("./abi");
const miltonAddresses = [
  '0x28BC58e600eF718B9E97d294098abecb8c96b687', // USDT
  '0x137000352B4ed784e8fa8815d225c713AB2e7Dc9', // USDC
  '0xEd7d74AA7eB1f12F83dA36DFaC1de2257b4e7523', // DAI
]

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
