const axios = require("axios");
const utils = require("../helper/utils");
const {get_account_tvl} = require('../helper/eos')
const {lendingMarket} = require("../helper/methodologies")

const eosEndpoint = "https://dapp.defibox.io/api/"
const bscEndpoint = "https://bsc.defibox.io/api/"

async function eos() {
  const eosPrice = (await utils.getPricesfromString("eos")).data.eos.usd;
  const swap = await utils.fetchURL(eosEndpoint + "swap/get24HInfo")
  const lend = await utils.fetchURL(eosEndpoint + "lend/getGlobalOpenPositionStat")
  const usn = await utils.fetchURL(eosEndpoint + "st/open/getGlobalOpenStat")
  const tvl = Number(swap.data.data.eosBalance) * eosPrice * 2 + // swap TVL
              lend.data.data.practicalBalance - lend.data.data.totalBorrowsVariable + // lend TVL
              usn.data.globalOpenStat.totalMortgage // usn (stable token) TVL
  return tvl
}

async function wax() {
  const tokens = [
    ["eosio.token", "WAX", "wax"],
    ["alien.worlds", "TLM", "alien-worlds"],
    // ["e.rplanet", "AETHER", null], // no CoinGecko price support
    // ["e.rplanet", "RDAO", null], // no CoinGecko price support
    // ["prospectorsw", "PGL", null], // no CoinGecko price support
  ];
  return await get_account_tvl("swap.box", tokens, "wax");
}

async function balancesToTvl( balances ) {
  let tvl = 0;
  for ( const [ key, balance ] of Object.entries(balances)) {
    const price = (await utils.getPricesfromString(key)).data[key].usd;
    tvl += price * balance;
  }
  return tvl;
}

async function bsc() {
  const bnbPrice = (await utils.getPricesfromString("binancecoin")).data.binancecoin.usd;
  const swap = await axios.default.post(bscEndpoint + "swap/get24HInfo", {}, { headers: { chainid: 56 }})
  const tvl = swap.data.data.usd_balance + swap.data.data.wbnb_balance * bnbPrice // swap TVL
  return tvl
}

async function fetch() {
  return await eos() + await bsc() + await balancesToTvl(await wax());
}

module.exports = {
  methodology: `${lendingMarket}. Defibox TVL is achieved by making a call to its API: https://dapp.defibox.io/api/.`,
  eos: {
    fetch: eos
  },
  bsc: {
    fetch: bsc
  },
  wax: {
    tvl: wax
  },
  fetch
}
