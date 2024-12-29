const sdk = require('@defillama/sdk')
const BN = require('bignumber.js');
const abi = require("./abi.json");
const url = "https://raw.githubusercontent.com/WaterfallDefi/product-addresses/master/main.json";
let _response
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');


async function getAddresses(url) {
  if (!_response) _response = getConfig('waterfalldefi', url)
  let res = await _response;
  return res;
}

const addressTransform = {
  bsc: addr => 'bsc:'+addr,
  avax: addr => 'avax:'+addr
}

async function bscStaking(timestamp, block, chainBlocks) {
  let chain = "bsc";
  return staking(chain, chainBlocks.bsc);
}

async function avaxStaking(timestamp, block, chainBlocks) {
  let chain = "avax";
  return staking(chain, chainBlocks.avax);
}

async function staking(chain, block) {
  let data = await getAddresses(url);
  let wtf = data[chain].wtf;
  const owner = data[chain]["staking"].address
  return sumTokens2({ chain, block, tokens: [wtf], owner })
}

async function bscTVL(timestamp, block, chainBlocks) {
  let chain = "bsc";
  return tvl(chain, chainBlocks.bsc);
}

async function avaxTVL(timestamp, block, chainBlocks) {
  let chain = "avax";
  return tvl(chain, chainBlocks.avax);
}

async function calcInactiveTrancheBalances(balances, product, chain, block) {
  const transform = addressTransform[chain];
  let calls = [];
  for (const currency of product.currency) {
    calls.push({
      target: currency,
      params: product.address
    })
  }
  let res = (await sdk.api.abi.multiCall({
    block: block,
    calls: calls,
    abi: 'erc20:balanceOf',
    chain: chain
  })).output;

  for (let i = 0; i < res.length; i++) {
    sdk.util.sumSingleBalance(balances, transform(product.currency[i]), res[i].output);
  }
  return balances;
}

async function calcActiveTrancheBalances(balances, product, chain, block) {
  let _abi = product.auto ? abi.tranchesAuto : abi.tranchesNonAuto;
  let calls = [];
  let tranche_n = product.tranche_n;

  for (let i = 0; i < tranche_n; i++) {
    calls.push({
      target: product.address,
      params: i
    })
  }
  const results = (await sdk.api.abi.multiCall({
    block: block,
    calls,
    abi: _abi,
    chain: chain
  })).output;

  return (await sumBalancesMulti(results, product, balances, chain));
}


async function sumBalancesMulti(res, product, balances, chain) {
  const transform = await addressTransform[chain]();
  for (let i = 0; i < res.length; i++) {
    for (let c = 0; c < product.currency.length; c++) {
      let currencyPrincipalShare = new BN(res[i].output.principal).multipliedBy(product.currencyRatios[c]).dividedBy('100').toFixed();
      sdk.util.sumSingleBalance(balances, transform(product.currency[c]), currencyPrincipalShare);
      if (product.auto) {
        let currencyAutoShare = new BN(res[i].output.autoPrincipal).multipliedBy(product.currencyRatios[c]).dividedBy('100').toFixed();
        sdk.util.sumSingleBalance(balances, transform(product.currency[c]), currencyAutoShare);
      }
    }
  }
  return balances;
}

async function isTrancheActive(product, chain, block) {
  return (await sdk.api.abi.call({
    abi: abi.cycleActive,
    chain: chain,
    target: product.address,
    params: [],
    block: block,
  })).output;
}

async function tvl(chain, block) {
  let balances = {};
  let data = await getAddresses(url);
  const products = data[chain].tranches;

  // Tranches TVL
  for (let product of products) {
    let trancheActive = await isTrancheActive(product, chain, block);
    if (trancheActive) {
      balances = await calcActiveTrancheBalances(balances, product, chain, block);
    } else {
      balances = await calcInactiveTrancheBalances(balances, product, chain, block)
    }
  }

  return balances;
}


module.exports = {
  methodology: 'Counts Waterfall DeFi tranche products TVL and staking TVL',
  bsc: {
    tvl: bscTVL,
    staking: bscStaking
  },
  avax: {
    tvl: avaxTVL,
    staking: avaxStaking
  }
};

