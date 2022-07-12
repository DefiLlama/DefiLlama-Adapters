const sdk = require('@defillama/sdk')
const BN = require('bignumber.js');
const abi = require("./abi.json");
const { transformBscAddress, transformAvaxAddress } = require('../helper/portedTokens');
const axios = require("axios");
const url = "https://raw.githubusercontent.com/WaterfallDefi/product-addresses/master/main.json";

async function getAddresses(url) {
    try {
        let res = await axios.get(url);
        return res.data;
    }
    catch (e) {
        console.log(e);
        return;
    }
}

const addressTransform = {
    bsc: transformBscAddress,
    avax: transformAvaxAddress
}

async function bscStaking(timestamp, block, chainBlocks) {
    let chain = "bsc";
    return staking(chain, timestamp, block, chainBlocks); 
}

async function avaxStaking(timestamp, block, chainBlocks) {
    let chain = "avax";
    return staking(chain, timestamp, block, chainBlocks); 
}

async function staking(chain, timestamp, block, chainBlocks) {
    let data = await getAddresses(url);
    let wtf = data[chain].wtf;
    let balances = {};
    let transform = await addressTransform[chain]();
    let { output: balance } = await sdk.api.erc20.balanceOf({
      target: wtf,
      owner: data[chain]["staking"].address,
      chain: chain,
      block: chainBlocks[chain]
    });
    sdk.util.sumSingleBalance(balances, transform(wtf), balance);

    return balances;
  }

async function bscTVL(timestamp, block, chainBlocks) {
    let chain = "bsc";
    return tvl(chain, timestamp, block, chainBlocks);
}

async function avaxTVL(timestamp, block, chainBlocks) {
    let chain = "avax";
    return tvl(chain, timestamp, block, chainBlocks);
}

async function calcInactiveTrancheBalances(balances, product, chain, block ) {
    const transform = await addressTransform[chain]();
    let calls = [];
    for (const currency of product.currency){
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

      for (let i = 0; i < res.length; i++){
         await sdk.util.sumSingleBalance(balances, transform(product.currency[i]), res[i].output);
      }
      return balances;
}

async function calcActiveTrancheBalances(balances, product, chain, block) {
    let _abi =  product.auto ? abi.tranchesAuto : abi.tranchesNonAuto;
    let calls =  [];
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
          await sdk.util.sumSingleBalance(balances, transform(product.currency[c]), currencyPrincipalShare);
          if(product.auto){
              let currencyAutoShare = new BN(res[i].output.autoPrincipal).multipliedBy(product.currencyRatios[c]).dividedBy('100').toFixed();
              await sdk.util.sumSingleBalance(balances, transform(product.currency[c]), currencyAutoShare);
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

async function tvl(chain, timestamp, block, chainBlocks) {
    let balances = {};
    let data = await getAddresses(url);
    const products  = data[chain].tranches;
    
    // Tranches TVL
    for (let product of products) {
        let trancheActive = await isTrancheActive(product, chain, chainBlocks[chain]);
        if (trancheActive) {
            balances = await calcActiveTrancheBalances(balances, product, chain, chainBlocks[chain]);
        } else {
            balances = await calcInactiveTrancheBalances(balances, product, chain, chainBlocks[chain])
        }
    } 

    return balances;
  }


  module.exports = {
    methodology: 'Counts Waterfall DeFi tranche products TVL and staking TVL',
    start: 16343128,
    bsc: {
        tvl: bscTVL,
        staking: bscStaking
    },
    avax: {
        tvl: avaxTVL,
        staking: avaxStaking
    }
  };

