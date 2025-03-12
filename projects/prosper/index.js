const ADDRESSES = require('../helper/coreAssets.json')
const axios = require("axios");

// ------------------------------
// CONFIGURATION
// ------------------------------

// PROS on BSC
const RECEIPT_TOKEN = "0x460dDE85b3CA09e82156E37eFFf50cd07bc3F7f9"; // Staked (receipt) token
const ORIGINAL_TOKEN = "0x915424Ac489433130d92B04096F3b96c82e92a9D"; // PROS token

// USDC on BSC (used to represent USD value)
// Do not include the "bsc:" prefix; the system auto-adds it.
const USDC_ADDRESS = ADDRESSES.bsc.USDC;

// ------------------------------
// ASIC Price Index Data (for PROS hashrate)
// ------------------------------

// Fixed capacity in TH/s
const PROS_HASHRATE_CAPACITY = 500080; // TH/s

// ASIC Price Index API URL
// Expected response: { data: [ { timestamp, "19to25": 12.68, ... }, ... ] }
const ASIC_PRICE_API_URL = "https://data.hashrateindex.com/hi-api/hashrateindex/asic/price-index?currency=USD&span=3M";

// ------------------------------
// TVL Function: Only PROS hashrate value (no staking)
// ------------------------------
async function tvl(api) {
  const res = await axios.get(ASIC_PRICE_API_URL);
  // Use the most recent data's "19to25" field (expected ~12.68 USD/TH/s)
  const pricePerTH = parseFloat(res.data.data[0]["19to25"]);
  // Calculate USD value: capacity (TH/s) * price per TH/s
  const hashrateUSDValue = PROS_HASHRATE_CAPACITY * pricePerTH;
  // Convert to 18-decimal integer (USDC has 18 decimals)
  const hashrateValueWei = Math.round(hashrateUSDValue * 1e18);
  api.add(USDC_ADDRESS, hashrateValueWei);
  return api.getBalances();
}

// ------------------------------
// Staking Function: Only returns staked PROS
// ------------------------------
async function staking(api) {
  const stakedBalance = await api.call({
    abi: "erc20:totalSupply",
    target: RECEIPT_TOKEN,
  });
  api.add(ORIGINAL_TOKEN, stakedBalance);
  return api.getBalances();
}

// ------------------------------
// Module Exports
// ------------------------------
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `
    Total TVL:
    1. PROS Baseline Hashrate Value: (500,080 TH/s of capacity * Hashrate Index's ASIC Price Index for 19 to 25 J/TH efficiency tier). Note that this is is a baseline or minimum value of Prosper's hashrate, as it only accounts for the base value of the ASIC miners, and does not include the value of all the infrastructure required to enable live, operational hashrate.
    2. Staked Value of PROS: Total supply of the receipt token, representing staked PROS (provided only in the staking function).
    3. Treasury Value:
       a) BTC held in the treasury (BTC balance * current BTC price),
       b) PROS held in the treasury (PROS balance * current PROS price)
  `,
  bsc: {
    tvl,
    staking,
  },
};
