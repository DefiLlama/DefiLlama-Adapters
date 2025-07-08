const axios = require("axios");
const utils = require("../helper/utils");
const {lendingMarket} = require("../helper/methodologies")
const { getUniTVL } = require('../helper/unknownTokens')

const endpoint = (chain) => `https://${chain}.defibox.io/api/`

async function eos() {
  const swap = await utils.fetchURL(endpoint("eos") + "swap/get24HInfo");
  const lend = await utils.postURL(endpoint("eos") + "lend/getGlobalOpenPositionStat")
  const usn = await utils.postURL(endpoint("eos") + "st/open/getGlobalOpenStat")
  const bal = await utils.fetchURL(endpoint("eos") + "bal/get24HInfo");
  const vault = await utils.postURL(endpoint("eos") + "vault/getVaultStat");

  // Calculate TVL (in $EOS value)
  const eos = Number(swap.data.data.eosBalance) * 2; // swap TVL (dual sided 50/50 AMM pool)

  // Calculate TVL (in $USDT value)
  const lend_tvl = Number(lend.data.data.practicalBalance) - Number(lend.data.data.totalBorrowsVariable); // lending protocol (deposits - borrowed assets)
  const usn_tvl = Number(usn.data.globalOpenStat.totalMortgage) // USN (over-collaterized stable token)
  const bal_tvl = Number(bal.data.data.balUsdtBalance) // balance protocol TVL (total in USDT value)
  const vault_tvl = Number(vault.data.data) // vault protocol TVL (time deposit EOS & USDT valued in $USD)
  const tether = lend_tvl + usn_tvl + bal_tvl + vault_tvl;

  return {
    tether,
    eos,
  }
}

async function borrowed() {
  const lend = await utils.postURL(endpoint("eos") + "lend/getGlobalOpenPositionStat")
  const tether = Number(lend.data.data.totalBorrowsVariable) // total TVL that is borrowed from lend protocol
  
  return {tether};
}

async function wax() {
  const swap = await utils.fetchURL(endpoint("wax") + "swap/get24HInfo");
  const wax = Number(swap.data.data.waxBalance) * 2; // swap TVL (dual sided 50/50 AMM pool)

  return {
    wax,
  }
}

async function bsc() {
  const swap = await axios.post(endpoint("bsc") + "swap/get24HInfo", {}, {headers: {chainid: 56}});
  const wbnb = Number(swap.data.data.wbnb_balance) * 2; // swap TVL (dual sided 50/50 AMM pool)

  return {
    wbnb,
  }
}

module.exports = {
  methodology: `${lendingMarket}. Defibox TVL is achieved by making a call to its API: https://<chain>.defibox.io/api/.`,
  timetravel: false,
  misrepresentedTokens: true,
  eos: {
    tvl: eos,
    borrowed,
  },
  wax: {
    tvl: wax
  },
  bsc: {
    tvl: getUniTVL({ factory: '0xDB984fd8371d07db9cBf4A48Eb9676b09B12161D'})
  }
}
