const utils = require("../helper/utils");
const {lendingMarket} = require("../helper/methodologies")

const eosEndpoint = "https://eos.defibox.io/api/"
const waxEndpoint = "https://wax.defibox.io/defibox/api/"
const bscEndpoint = "https://bsc.defibox.io/api/"

async function eos() {
  const swap = await utils.fetchURL(eosEndpoint + "swap/get24HInfo");
  const lend = await utils.postURL(eosEndpoint + "lend/getGlobalOpenPositionStat")
  const usn = await utils.postURL(eosEndpoint + "st/open/getGlobalOpenStat")
  const bal = await utils.fetchURL(eosEndpoint + "bal/get24HInfo");
  const vault = await utils.postURL(eosEndpoint + "vault/getVaultStat");

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
  const lend = await utils.postURL(eosEndpoint + "lend/getGlobalOpenPositionStat")
  const tether = Number(lend.data.data.totalBorrowsVariable) // total TVL that is borrowed from lend protocol
  
  return {tether};
}

async function wax() {
  const swap = await utils.fetchURL(waxEndpoint + "swap/get24HInfo");
  const wax = Number(swap.data.data.waxBalance) * 2; // swap TVL (dual sided 50/50 AMM pool)

  return {
    wax,
  }
}

// TODO: BSC endpoint not available at the moment
async function bsc() {
  const swap = await utils.fetchURL(bscEndpoint + "swap/get24HInfo");
  const bnb = Number(swap.data.data.bnbBalance) * 2; // swap TVL (dual sided 50/50 AMM pool)

  return {
    bnb,
  }
}

module.exports = {
  methodology: `${lendingMarket}. Defibox TVL is achieved by making a call to its API: https://dapp.defibox.io/api/.`,
  timetravel: false,
  eos: {
    tvl: eos,
    borrowed,
  },
  wax: {
    tvl: wax
  },
  bsc: {
    tvl: 0 // TODO: BSC endpoint not available at the moment
  }
}
