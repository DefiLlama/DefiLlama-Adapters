const sdk = require('@defillama/sdk')
const FORGE_SOL = '0x4938D2016e7446a24b07635611bD34289Df42ECb'
const USDC_TOKEN = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'

async function tvl(_, _1, _2, { api }) {
  const balances = {}
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_TOKEN,
    params: [FORGE_SOL],
  })
  await sdk.util.sumSingleBalance(balances, USDC_TOKEN, collateralBalance, api.chain)
  return balances
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of USDC tokens deposited as collateral in the Forge.sol contract.',
  start: 1680643295,
  arbitrum: {
    tvl,
  }
};