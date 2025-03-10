const axios = require("axios");

// ------------------------------
// CONFIGURATION
// ------------------------------

// PROS on BSC
const RECEIPT_TOKEN = "0x460dDE85b3CA09e82156E37eFFf50cd07bc3F7f9"; // Staked (receipt) token
const ORIGINAL_TOKEN = "0x915424Ac489433130d92B04096F3b96c82e92a9D"; // PROS token

// Treasury addresses
const TREASURY_BTC_ADDRESS = "bc1qcrdvx3dvq35kawsp02033pwla244rr6hptg982"; // Bitcoin treasury address (BTC chain)
const TREASURY_PROS_ADDRESS = "0xb3BbCBd70436c9CAdDf52E2F06732f81DaC1F127"; // PROS held on BSC

// USDC on BSC (used to represent USD value)
// Note: Do not include the "bsc:" prefix; the system auto-adds it.
const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

// ------------------------------
// ASIC Price Index Data (for PROS hashrate)
// ------------------------------

// Fixed capacity in TH/s (already in TH/s)
const PROS_HASHRATE_CAPACITY = 500080; // TH/s

// ASIC Price Index API URL
// Expected response: { data: [ { timestamp, "19to25": 12.68, ... }, ... ] }
const ASIC_PRICE_API_URL = "https://data.hashrateindex.com/hi-api/hashrateindex/asic/price-index?currency=USD&span=3M";

// ------------------------------
// Treasury BTC Value Data
// ------------------------------

// BTC Balance API URL from Blockchain.info
// Example: https://blockchain.info/balance?active=bc1qcrdvx3dvq35kawsp02033pwla244rr6hptg982
// Response example: {"bc1qcrdvx3dvq35kawsp02033pwla244rr6hptg982":{"final_balance":153331000,"n_tx":3,"total_received":153331000}}
const BTC_BALANCE_API_URL = "https://blockchain.info/balance?active=";

// BTC Price API (from CoinGecko)
const BTC_PRICE_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

// ------------------------------
// TVL Function: Sum of PROS hashrate value + treasury value + staked PROS
// ------------------------------
async function tvl(api) {
  // --- Part 1: PROS Hashrate Value ---
  try {
    const res = await axios.get(ASIC_PRICE_API_URL);
    // Use the most recent price from the first element's "19to25" field
    const pricePerTH = parseFloat(res.data.data[0]["19to25"]); // expected ~12.68 USD/TH/s
    // Multiply capacity (in TH/s) by price per TH/s to get USD value:
    const hashrateUSDValue = PROS_HASHRATE_CAPACITY * pricePerTH;
    // Convert to 18-decimal integer for USDC:
    const hashrateValueWei = Math.round(hashrateUSDValue * 1e18);
    api.add(USDC_ADDRESS, hashrateValueWei);
  } catch (err) {
    console.error("Error fetching ASIC price index:", err);
  }

  // --- Part 2a: Treasury BTC Value ---
  try {
    // Fetch BTC balance from Blockchain.info
    const btcRes = await axios.get(`${BTC_BALANCE_API_URL}${TREASURY_BTC_ADDRESS}`);
    const btcData = btcRes.data;
    // Extract the final_balance (in satoshis) and convert to BTC
    const btcSatoshis = btcData[TREASURY_BTC_ADDRESS].final_balance;
    const btcBalance = btcSatoshis / 1e8;
    // Fetch current BTC price in USD
    const btcPriceRes = await axios.get(BTC_PRICE_API_URL);
    const btcPrice = btcPriceRes.data.bitcoin.usd;
    const treasuryBTCUSD = btcBalance * btcPrice;
    const treasuryBTCValueWei = Math.round(treasuryBTCUSD * 1e18);
    api.add(USDC_ADDRESS, treasuryBTCValueWei);
  } catch (err) {
    console.error("Error fetching treasury BTC data:", err);
  }

  // --- Part 2b: Treasury PROS Value ---
  try {
    // Fetch PROS balance held in the treasury address on BSC
    const treasuryProsBalance = await api.call({
      abi: "erc20:balanceOf",
      target: ORIGINAL_TOKEN,
      params: [TREASURY_PROS_ADDRESS],
    });
    // Add treasury PROS as is (aggregator will price PROS if mapping exists)
    api.add(ORIGINAL_TOKEN, treasuryProsBalance);
  } catch (err) {
    console.error("Error fetching treasury PROS balance:", err);
  }

  // --- Part 3: Staked Value of PROS ---
  try {
    // Get staked PROS from the receipt token's total supply
    const stakedBalance = await api.call({
      abi: "erc20:totalSupply",
      target: RECEIPT_TOKEN,
    });
    // Add staked PROS (aggregator will price it as PROS)
    api.add(ORIGINAL_TOKEN, stakedBalance);
  } catch (err) {
    console.error("Error fetching staked PROS:", err);
  }

  return api.getBalances();
}

// ------------------------------
// Staking Function: Only returns staked PROS (Part 3)
// ------------------------------
async function staking(api) {
  try {
    const stakedBalance = await api.call({
      abi: "erc20:totalSupply",
      target: RECEIPT_TOKEN,
    });
    api.add(ORIGINAL_TOKEN, stakedBalance);
  } catch (err) {
    console.error("Error fetching staked PROS:", err);
  }
  return api.getBalances();
}

// ------------------------------
// Module Exports
// ------------------------------
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `
    Total TVL is the sum of three parts:
    1. PROS Baseline Hashrate Value: (500,080 TH/s of capacity * Hashrate Index's ASIC Price Index for 19 to 25 J/TH efficiency tier). Note that this is is a baseline or minimum value of Prosper's hashrate, as it only accounts for the base value of the ASIC miners, and does not include the value of all the infrastructure required to enable live, operational hashrate.
    2. Treasury Value:
         a) BTC held in the treasury (BTC balance * current BTC price),
         b) PROS held in the treasury (PROS balance * current PROS price)
    3. Staked Value of PROS: Total supply of the receipt token, representing staked PROS, * current PROS price
  `,
  bsc: {
    tvl,
    staking,
  },
};
