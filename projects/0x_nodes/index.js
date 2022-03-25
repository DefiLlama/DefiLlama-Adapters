// almost a hardcopy of the curve adapter index.js structure, maybe we could use a similar structure? just hook the functions up to our API

//functions written by defiLlama
const utils = require('../helper/utils');
const { staking } = require('../helper/staking');
var tvl;
//one function per chain, Can probably make a Iteration on this later an chain array.
async function eth() {
  const tvl_strategies = [500000, 20000]; //replace this with an array with tvls from the strats using our API
  tvl = 0;
  tvl_strategies.forEach(sum);
  return tvl
  }

async function bsc() {
  const tvl_strategies = [500000, 20000];
  tvl = 0;
  tvl_strategies.forEach(sum);
  return tvl

}
async function polygon() {
  const tvl_strategies = [500000, 20000];
  tvl = 0;
  tvl_strategies.forEach(sum);
  return tvl
}

async function fantom() {
  const tvl_strategies = [500000, 20000];
  tvl = 0;
  tvl_strategies.forEach(sum);
  return tvl
}

async function andromeda() {
  const tvl_strategies = [500000, 20000];
  tvl = 0;
  tvl_strategies.forEach(sum);
  return tvl
}

async function avax() {
  const tvl_strategies = [500000, 20000];
  tvl = 0;
  tvl_strategies.forEach(sum);
  return tvl
}

// 0xnodes treasury
async function treasury() {
  const tvl = 1256789
  return tvl
}
// PFA TVL, BIOS in PFA across all chains summed together
async function pfa() {
  const tvl = 1236789
  return tvl
}
function sum(value) {
  tvl = tvl + value;
}

//fetching chains and strategies all together when called. Can probably use Iteration on this later using a chain array.
async function fetch() {
  return (await eth()) +
  (await bsc()) +
  (await polygon()) +
  (await fantom()) +
  (await andromeda()) +
  (await avax()) +
  (await treasury()) +
  (await pfa())

}

//the module export construction, so it can make readable numbers, put them into the right place and calc "combined TVL":
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL based on Treasury, staking assets (PFA), {{ nubmer_of_strategies }} yield strategies and a total of {{ number_of_chains }} chains',
  //takes out from the fetch function call done at the bottom here and places returned tvl in the right place. Iteration?
  ethereum:{
    fetch: eth,
    // staking: staking("0xAACa86B876ca011844b5798ECA7a67591A9743C8", "0xcfcff4eb4799cda732e5b27c3a36a9ce82dbabe0")
  },
  bsc:{
    fetch: bsc
  },
  polygon:{
    fetch:polygon
  },
  fantom:{
    fetch:fantom
  },
  andromeda:{
    fetch:andromeda
  },
  avalanche:{
    fetch: avax
  },
  treasury:{
    fetch: treasury
  },
  PFA:{
    fetch: pfa
  },
  fetch
}

/* How to test if TVLs is showing correctly:

Once you are done writing it you can verify that it returns the correct value by running the following code:

$ npm install
$ node test.js projects/0x_nodes/index.js */
