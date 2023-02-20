const sdk = require("@defillama/sdk")

const VELA = '0x088cd8f5eF3652623c22D48b1605DCfE860Cd704'
const VAULT_CONTRACT = '0x5957582F020301a2f732ad17a69aB2D8B2741241'
const USDC = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
const STAKING_CONTRACT = '0xfC527781Ae973f8131dC26dDDb2Adb080c1C1F59'

async function vaultTvl(timestamp, ethBlock, chainBlocks) {  
  const vaultDeposits = (await sdk.api.abi.call({
      target: USDC, 
      params: VAULT_CONTRACT,
      abi: 'erc20:balanceOf',
      block: chainBlocks.arbitrum,
      chain: 'arbitrum'
    })).output
  const balances = {
    ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']: vaultDeposits
  }
  return balances
}

async function velaStaking(timestamp, ethBlock, chainBlocks) {  
  const velaDeposits = (await sdk.api.abi.call({
      target: VELA, 
      params: STAKING_CONTRACT,
      abi: 'erc20:balanceOf',
      block: chainBlocks.arbitrum,
      chain: 'arbitrum'
    })).output
  const balances = {
    ['arbitrum:0x088cd8f5eF3652623c22D48b1605DCfE860Cd704']: velaDeposits
  }
  return balances
}

module.exports = {
  methodology: "Counts USDC deposited to trade and to mint VLP. Staking counts VELA deposited to earn eVELA",
  arbitrum: {
    staking: velaStaking,
    tvl: vaultTvl
  },
}