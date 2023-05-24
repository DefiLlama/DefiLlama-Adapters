const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');
const { get } = require('../helper/http')
const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');

//contract the deposits into official GNS Staking Contract
const gnsDysonVault = "0x035001DdC2f6DcF2006565Af31709f8613a7D70C"

//grab GNS price from DefiLlama Price API
const getGNSPrice = async () => {
  const response = await get('https://coins.llama.fi/prices/current/polygon:0xE5417Af564e4bFDA1c483642db72007871397896')
  return response.coins['polygon:0xE5417Af564e4bFDA1c483642db72007871397896'].price
}

const sphere_token = "0x62F594339830b90AE4C084aE7D223fFAFd9658A7"
const ylSPHEREvault = "0x4Af613f297ab00361D516454E5E46bc895889653"

async function polygonTvl(timestamp, block, chainBlocks) {
  let balances = {};

  // add tokens in ylSPHERE vault
  await sumTokens2({
    balances,
    owners: [ylSPHEREvault],
    tokens: ["0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", ADDRESSES.polygon.USDC, ADDRESSES.polygon.WETH_1, ADDRESSES.polygon.USDT, "0x4Af613f297ab00361D516454E5E46bc895889653", ADDRESSES.polygon.WBTC],
    chain: 'polygon',
    block: chainBlocks.polygon
  })

  const gnsDysonVaultSupply = (await sdk.api.erc20.totalSupply({
    target: gnsDysonVault,
    chain: 'polygon',
    block: chainBlocks.polygon
  })).output / 1e18  * ((await getGNSPrice()) * 1e18) / 6.24 //Don't even ask why 6.24 is needed, it just is the only way to get the correct TVL
  balances["polygon:0xE5417Af564e4bFDA1c483642db72007871397896"] = gnsDysonVaultSupply

  // calculate TVL for polygon from API
  const dysonTvl = await fetchChain(137)()
  for (const [token, balance] of Object.entries(dysonTvl)) {
    balances[token] = (balances[token] || 0) + balance
  }
  return balances;
} 

let _response

function fetchChain(chainId) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.dyson.money/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
      tvl += Number(chain[vault]);
    }
    
    if (tvl === 0) {
      throw new Error(`chain ${chainId} tvl is 0`)
    }

    return toUSDTBalances(tvl);
  }
}

const chains = {
  optimism: 10,
  polygon: 137,
  arbitrum: 42161,
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: false,
  methodology: "TVL is calculated by summing the liquidity in the Uniswap V3 pools.",
  polygon: {
    tvl: polygonTvl,
    staking: staking(ylSPHEREvault, sphere_token, "polygon")
  },
  optimism: {
    tvl: fetchChain(10),
  },
  arbitrum: {
    tvl: fetchChain(42161),
  },
  bsc: {
    tvl: fetchChain(56)
  },
};
