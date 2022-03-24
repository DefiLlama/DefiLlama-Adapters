// almost a hardcopy of the curve adapter index.js structure, maybe we could use a similar structure? just hook the functions up to our API
const utils = require('../helper/utils');

//one function per chain and strategy(?) Can probably make a Iteration on this later using a URL and chain array.
async function eth() {
  const tvl = await utils.fetchURL('https://api.curve.fi/api/getTVLPolygon') //get from our API via URL? need to replace these with ours obviously.
  console.log(tvl.data.data.tvl)
  return tvl.data.data.tvl
}
async function bsc() {
  const tvl = await utils.fetchURL('') //curve isnt on bsc
  return tvl.data.data.tvl
}
async function polygon() {
  const tvl = await utils.fetchURL('https://api.curve.fi/api/getTVLPolygon')
  return tvl.data.data.tvl
}
async function fantom() {
  const tvl = await utils.fetchURL('https://api.curve.fi/api/getTVLFantom')
  return tvl.data.data.tvl
}
async function andromeda() {
  const tvl = await utils.fetchURL('') //curve isnt on andromeda
  return tvl.data.data.tvl
}
async function avax() {
  const tvl = await utils.fetchURL('https://api.curve.fi/api/getTVLAvalanche')
  return tvl.data.data.tvl
}
//example strategy functions
async function saal_main() {
  const tvl = 3443234.02; //somehow wire up our API here and return strategy tvl to this variable.Via URL like above?
  return tvl
}
async function saal_gnb() {
  const tvl = 6443234.02;
  return tvl
}

//fetching chains and strategies all together when called. Can probably use Iteration on this later using a chain array.
async function fetch() {
  return (await eth()) +
   // (await bsc()) +
   (await polygon()) +
   (await fantom()) +
   // (await andromeda()) +
   (await avax()) +
   (await saal_main()) +
   (await saal_gnb())

}
//the module export construction, so it can make readable numbers, put them into the right place and calc "combined TVL":
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,

  //takes out from the fetch function call done at the bottom here and places returned tvl in the right place. Iteration?
  ethereum:{
    fetch: eth,
  },
  // bsc:{
  //   fetch: bsc
  // },
  polygon:{
    fetch:polygon
  },
  // andromeda:{
  //   fetch:andromeda
  // },
  avalanche:{
    fetch: avax
  },
  SAAL_main:{
    fetch: saal_main
  },
  SAAL_gnb:{
    fetch: saal_gnb
  },
  fetch
}
