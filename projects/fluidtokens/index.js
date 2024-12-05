const {
  getAddressesUTXOs,
  getTxsMetadata,
  getTxsRedeemers,
} = require("../helper/chain/cardano/blockfrost");
const { PromisePool } = require("@supercharge/promise-pool");
const { get } = require("../helper/http");

const smartContractAddress =
  "addr1wxzqzlncct5g0686c07lyuq3q3j2a0t8l88uwdznw99k9asz6z0hq";

// Function to calculate Cardano TVL
async function cardanoTvl() {
  const dataOffers = await get("https://api.fluidtokens.com/get-available-collection-offers");
  let SC_offers_tvl = 0;

  dataOffers.forEach((i) => {
    SC_offers_tvl += parseInt(i.offerData.loanAmnt);
  });

  const repay_tvl = parseInt(await get("https://api.fluidtokens.com/get-total-available-repayments"));
  const pools_tvl = parseInt(await get("https://api.fluidtokens.com/get-total-available-pools"));

  const boosted_tvl = await get("https://api.fluidtokens.com/get-ft-stats");
  const boosted = parseInt(boosted_tvl.bs_available_volume) + parseInt(boosted_tvl.bs_active_volume);

  // Summing relevant TVL sources for Cardano
  return (SC_offers_tvl + pools_tvl + boosted) / 1e6;
}

// Function to calculate Bitcoin TVL
async function bitcoinTvl() {
  const btc_staking = await get("https://api2.fluidtokens.com/get-staking-stats");
  const btc_satoshi = parseInt(btc_staking.totalTvl);

  // Convert Satoshis to Bitcoin
  return btc_satoshi / 1e8;
}

async function staking() {
  const data = await get("https://api.fluidtokens.com/get-ft-stats");
  let staking = parseInt(data.staking_tvl);

  return {
    cardano: staking / 1e6,
  };
}

async function borrowed() {
  const data = await get("https://api.fluidtokens.com/get-ft-stats");
  let SC_tvl = parseInt(data.active_loans_volume);

  const dataOffers = await get("https://api.fluidtokens.com/get-available-collection-offers");
  let SC_offers_tvl = 0;

  dataOffers.forEach((i) => {
    SC_offers_tvl += parseInt(i.offerData.loanAmnt);
  });

  return {
    cardano: SC_tvl / 1e6,
  };
}

// Updated exports
module.exports = {
  methodology: "Count active liquidity as TVL",
  timetravel: false,
  cardano: {
    tvl: async () => ({ cardano: await cardanoTvl() }),
    borrowed,
    staking,
  },
  bitcoin: {
    tvl: async () => ({ bitcoin: await bitcoinTvl() }),
  },
  hallmarks: [
    [Math.floor(new Date("2023-01-01") / 1e3), "Count only active loans"],
    [Math.floor(new Date("2023-06-27") / 1e3), "ADA loaned out is counted under borrowed"],
  ],
};
