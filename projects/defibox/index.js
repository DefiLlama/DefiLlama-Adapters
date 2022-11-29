const axios = require("axios");
const utils = require("../helper/utils");
const {get_account_tvl} = require('../helper/chain/eos')
const {lendingMarket} = require("../helper/methodologies")

const eosEndpoint = "https://dapp.defibox.io/api/"
const bscEndpoint = "https://bsc.defibox.io/api/"

async function eos() {
  const swap = await utils.fetchURL(eosEndpoint + "swap/get24HInfo")
  const lend = await utils.fetchURL(eosEndpoint + "lend/getGlobalOpenPositionStat")
  const usn = await utils.fetchURL(eosEndpoint + "st/open/getGlobalOpenStat")
  const tvl = lend.data.data.practicalBalance - lend.data.data.totalBorrowsVariable + // lend TVL
              usn.data.globalOpenStat.totalMortgage // usn (stable token) TVL
  return {
    tether: tvl,
    eos: swap.data.data.eosBalance * 2, // swap TVL
  }
}

async function borrowed() {
  const lend = await utils.fetchURL(eosEndpoint + "lend/getGlobalOpenPositionStat")
  const tvl = lend.data.data.totalBorrowsVariable // lend TVL
  
  return {
    tether: tvl,
  }
}

async function wax() {
  const tokens = [
    ["eosio.token", "WAX", "wax"],
    ["alien.worlds", "TLM", "alien-worlds"],
    // ["e.rplanet", "AETHER", null], // no CoinGecko price support
    // ["e.rplanet", "RDAO", null], // no CoinGecko price support
    // ["prospectorsw", "PGL", null], // no CoinGecko price support
  ];
  return get_account_tvl("swap.box", tokens, "wax");
}

async function bsc() {
  const swap = await axios.default.post(bscEndpoint + "swap/get24HInfo", {}, { headers: { chainid: 56 }})
  return {
    tether: swap.data.data.usd_balance,
    binancecoin: swap.data.data.wbnb_balance,
  }
}

module.exports = {
  methodology: `${lendingMarket}. Defibox TVL is achieved by making a call to its API: https://dapp.defibox.io/api/.`,
  timetravel: false,
  eos: {
    tvl: eos,
    borrowed,
  },
  bsc: {
    tvl: bsc
  },
  wax: {
    tvl: wax
  },
}
