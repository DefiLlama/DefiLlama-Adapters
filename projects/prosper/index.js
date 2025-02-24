const axios = require("axios");

// ------------------------------
// CONFIG
// ------------------------------
const RECEIPT_TOKEN = "0xb4A05f1dc74876f9C59368569A9454cF09cBea2E";
const ORIGINAL_TOKEN = "0xEd8c8Aa8299C10f067496BB66f8cC7Fb338A3405";

// USDC on BSC (no 'bsc:' prefix; the system adds it automatically)
const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

// Hashrate endpoints
const HASHRATE_API_URL_1 =
  "https://www.antpool.com/auth/v3/observer/api/hash/query?accessKey=kDe236rMHQwZbz1f5qma&coinType=BTC&observerUserId=ANTPOOL22024";
const HASHRATE_API_URL_2 =
  "https://www.antpool.com/auth/v3/observer/api/hash/query?accessKey=YwP7KdLB1pjaXR8lB2iw&coinType=BTC&observerUserId=antpool42024";

// Per comparables research as of 12 Dec 2024: $119.8M per EH/s
const VALUATION_MULTIPLE = 119800000;

// ------------------------------
// 1) tvl => hashrate + staking
// ------------------------------
async function tvlAndStaking(api) {
  // PART A: Hashrate -> USD
  try {
    const [res1, res2] = await Promise.all([
      axios.get(HASHRATE_API_URL_1),
      axios.get(HASHRATE_API_URL_2),
    ]);

    // Convert PH/s => EH/s
    const hashrate1 = (parseFloat(res1?.data?.data?.hsLast1D) || 0) / 1000;
    const hashrate2 = (parseFloat(res2?.data?.data?.hsLast1D) || 0) / 1000;
    const totalHashrate = hashrate1 + hashrate2;

    const rwaUsdValue = totalHashrate * VALUATION_MULTIPLE;
    // Represent as USDC
    const bigValue = Math.round(rwaUsdValue * 1e18);
    api.add(USDC_ADDRESS, bigValue);
  } catch (err) {
    console.error("Error fetching hashrate:", err);
  }

  // PART B: Staking
  //  => treat the total supply of the receipt token as the "original token" balance
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: RECEIPT_TOKEN,
  });

  // Add it as the original token
  api.add(ORIGINAL_TOKEN, totalSupply);

  // Return combined balances (hashrate + staking)
  return api.getBalances();
}

// ------------------------------
// 2) Only staking
// ------------------------------
async function stakingOnly(api) {
  // Just do the staking logic
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: RECEIPT_TOKEN,
  });

  // Add as the original token
  api.add(ORIGINAL_TOKEN, totalSupply);

  return api.getBalances();
}

// ------------------------------
// Module Exports
// ------------------------------
module.exports = {
  methodology:
    "TVL combines the estimated value (represented as USDC) of tokenized RWA hashrate by multiplying live hashrate value (in EH/s) × valuation multiple ($119.8M per EH/s) + staked PROS tokens",
  bsc: {
    tvl: tvlAndStaking,  // hashrate + staking
    staking: stakingOnly // only staking
  },
};
