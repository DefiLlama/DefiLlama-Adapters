/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");
const axios = require('axios')
const abi = require('./abi.json');

/*==================================================
  Logic

- For every pool in EPS stable pools (meetapool), there is a stablecoin
  paired with a basepool (3EPS or btcEPS)
- Logic for TVL;
    - Get token balances for the underlying meta pool
    - Get token balances for each token in the base pools

list of missing tokens
bsc:0x049d68029688eAbF473097a2fC38ef61633A3C7A - fUSDT
bsc:0xeD28A457A5A76596ac48d87C0f577020F6Ea1c4C - pBTC
bsc:0x54261774905f3e6E9718f2ABb10ed6555cae308a - anyBTC
bsc:0x03ab98f5dc94996f8c33e15cd4468794d12d41f9 - USDN

These missing tokens will be replaced with equivalent tokens.

  ==================================================*/


/*==================================================
  Settings
  ==================================================*/
function getBSCAddress(address) {
  return `bsc:${address}`
}

const replaceable = {
  "0x049d68029688eAbF473097a2fC38ef61633A3C7A": "0xdac17f958d2ee523a2206206994597c13d831ec7", //fUSDT -> USDT
  '0x5228a22e72ccc52d415ecfd199f99d0665e7733b': '0x5228a22e72ccc52d415ecfd199f99d0665e7733b', //pBTC -> pBTC on ETH
  '0x54261774905f3e6E9718f2ABb10ed6555cae308a': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', //anyBTC -> WBTC
  '0x03ab98f5dc94996f8c33e15cd4468794d12d41f9': '0x674c6ad92fd080e4004b2312b45f796a192d27a0', //USDN -> USDN on ETH
};


const endpoint = 'https://api.ellipsis.finance/api/getPools'


/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block, chainBlocks) {

  let balances = {};

  let allPools = (await axios.get(endpoint)).data.data
  const basePools = allPools.basePools
  const metaPools = allPools.metaPools

  await Promise.all(basePools.map(async (element) => {

    await Promise.all(element.tokens.map(async (token) => {
      const balance = await sdk.api.abi.call({
        abi: abi.balancesBasePool,
        target: element.address,
        params: token.index,
        block: chainBlocks['bsc'],
        chain: 'bsc'
      });
      balances[getBSCAddress(token.erc20address)] = balance.output
    }));
  }));

  await Promise.all(metaPools.map(async (element) => {

    const balance = await sdk.api.abi.call({
      abi: abi.balancesMetaPool,
      target: element.address,
      params: 0,
      block: chainBlocks['bsc'],
      chain: 'bsc'
    });
    if (Object.keys(replaceable).includes(element.token.address)) {
      balances[replaceable[element.token.address]] = balance.output
    } else {
      balances[getBSCAddress(element.token.address)] = balance.output
    }
  }));
  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  bsc: {
    tvl
  },
  tvl
};
