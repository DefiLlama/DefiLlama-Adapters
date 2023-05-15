const ADDRESSES = require('../helper/coreAssets.json')
// const BigNumber = require("bignumber.js");
// const utils = require('../helper/utils');
// const { toUSDTBalances } = require('../helper/balances');
const sdk = require('@defillama/sdk');
const risk_off_abi = require("./risk_off_vault_abi.json");

const RISK_OFF_USD_VAULT = "0x30D120f80D60E7b58CA9fFaf1aaB1815f000B7c3"
const RISK_OFF_ETH_VAULT = "0x8f0Cb368C63fbEDF7a90E43fE50F7eb8B9411746"

const usdtAddress = ADDRESSES.ethereum.USDT;
const ethAddress = ADDRESSES.null;

const chains = {
  ethereum: 1,
  optimism: 10,
  bsc: 56, 
  polygon: 137,
  fantom: 250,
  arbitrum: 42161,
  avax: 43114,
}

async function ethereum_usd_tvl(timestamp, block, chainBlocks) {
  const totalAssets = await sdk.api.abi.call({
    abi: risk_off_abi.totalAssets,
    chain: 'ethereum',
    target: RISK_OFF_USD_VAULT,
    params: [],
    block: chainBlocks['ethereum']
  })
  
  return totalAssets.output/10 ** 12
}

async function ethereum_eth_tvl(timestamp, block, chainBlocks) {
  const totalAssets = await sdk.api.abi.call({
    abi: risk_off_abi.totalAssets,
    chain: 'ethereum',
    target: RISK_OFF_ETH_VAULT,
    params: [],
    block: chainBlocks['ethereum']
  })

  return totalAssets.output
}


async function ethereum(timestamp, block, chainBlocks) {
  const balances = {};
  const usdValue = await ethereum_usd_tvl(timestamp, block, chainBlocks)
  const ethValue = await ethereum_eth_tvl(timestamp, block, chainBlocks) 

  await sdk.util.sumSingleBalance(balances, usdtAddress, usdValue)
  await sdk.util.sumSingleBalance(balances, ethAddress, ethValue)
  return balances 
}



module.exports = {
  doublecounted: true,
  timetravel: true,
  misrepresentedTokens: false,
  ethereum: {
    tvl:ethereum,
  }
}
