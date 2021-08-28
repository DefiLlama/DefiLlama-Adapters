/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");
const _ = require("underscore");
const BigNumber = require("bignumber.js");
const axios = require('axios')

const abi = {
  "stateMutability": "view",
  "type": "function",
  "name": "balances",
  "inputs": [
      {
          "name": "arg0",
          "type": "uint256"
      }
  ],
  "outputs": [
      {
          "name": "",
          "type": "uint256"
      }
  ],
  "gas": 1917
}

/*==================================================
  Logic

- For every pool in EPS stable pools (meetapool), there is a stablecoin
  paired with a basepool (3EPS or btcEPS)
- Logic for TVL;
    - Get token balances for the underlying meta pool
    - Get token balances for each token in the base pools
  ==================================================*/


/*==================================================
  Settings
  ==================================================*/

const endpoint = 'https://api.ellipsis.finance/api/getPools'


/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block, chainBlocks) {

    let balances = {};

    let allPools = (await axios.get(endpoint)).data.data
    const basePools = allPools.basePools
    const metaPools = allPools.metaPools
    // console.log(allPools)
    // console.log(basePools)
    // console.log(metaPools)
    // console.log('first')
    await Promise.all(basePools.map(async (element) => {
        var i = 0;

        await Promise.all(element.tokens.map(async (token) => {
            console.log('addr:', token.erc20address)

            const balance = await sdk.api.abi.call({
                abi,
                target: element.address,
                params: i,
                block: chainBlocks['bsc'],
                chain: 'bsc'
            });
            
            sdk.util.sumSingleBalance(balances,  'bsc:'+token.erc20address, balance.output)
            console.log('balance:', balance)

            i++;
        }))
    }));
    // console.log('second')
    // console.log(balances)



    return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    name: "Ellipsis",
    token: "EPS",
    category: "DEX",
    start: 1566518400, // 08/23/2019 @ 12:00am (UTC)
    tvl
};
