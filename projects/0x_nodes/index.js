// almost a hardcopy of the curve adapter index.js structure, maybe we could use a similar structure? just hook the functions up to our API
//functions written by defiLlama
const utils = require('../helper/utils');
const { staking } = require('../helper/staking');
var url = 'https://system11-api-kwhdxoi2yq-uw.a.run.app/graphql?query='
// var query =  `query {networkStats(chainId: ${chainId}) {tvl}}` hoping to make the query so it has a variable field being chainId

async function eth(/*chainId*/) { //chainId ends up as something crazy like 1648417255 even if I pass '1' when calling it at line 50. not sure why.
  const r = await utils.fetchURL(url+'query {networkStats(chainId:1) {tvl}}')
  // const r = await utils.fetchURL(url+query) .
  return r.data.data.networkStats.tvl / 1e18
  }
async function bsc(chainId) {
  const r = await utils.fetchURL(url+'query {networkStats(chainId:56) {tvl}}') // no other than mainnet spits out TVL? just gets null.
  // return r.data.data.networkStats.tvl / 1e18
  return 1000002
}
async function polygon(chainId) {
  const r = await utils.fetchURL(url+'query {networkStats(chainId:137) {tvl}}')
  // return r.data.data.networkStats.tvl / 1e18
  return 1000002
}
async function fantom(chainId) {
  const r = await utils.fetchURL(url+'query {networkStats(chainId:250) {tvl}}')
  // return r.data.data.networkStats.tvl / 1e18
  return 1000002
}
async function andromeda(chainId) {
  const r = await utils.fetchURL(url+'query {networkStats(chainId:1088) {tvl}}')
  // return r.data.data.networkStats.tvl / 1e18
  return 1000002
}
async function avax(chainId) {
  const r = await utils.fetchURL(url+'query {networkStats(chainId:431134) {tvl}}')
  // return r.data.data.networkStats.tvl / 1e18
  return 1000002
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
//+ing all TVLs all together when called. Can probably use some sorta iteration on this later using a chain array.(?)
async function fetch() {
  return (await eth(/*chainId = '1'*/)) + (await bsc(/*chainId = '56'*/)) + (await polygon(/*chainId = '137'*/)) +
  (await fantom(/*chainId = '250'*/)) + (await andromeda(/*chainId = '1088'*/)) + (await avax(/*chainId = '431134'*/)) +
  (await treasury()) + (await pfa())
}
//the module export construction:  makes the TVLs into readable numbers and sums them together.
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL based on Treasury, staking assets (PFA), {{ nubmer_of_strategies }} yield strategies and on a total of {{ number_of_chains }} chains',
  //takes out from the fetch function call and places returned tvl in the right place.
  ethereum:{fetch: eth},
  bsc:{fetch: bsc},
  polygon:{fetch:polygon},
  fantom:{fetch:fantom},
  andromeda:{fetch:andromeda},
  avalanche:{fetch: avax},
  treasury:{fetch: treasury},
  PFA:{fetch: pfa},
  fetch
}
/* How to test if TVLs is showing correctly:
Once you are done writing it you can verify that it returns the correct value by running the following code:
$ npm install
$ node test.js projects/0x_nodes/index.js */
