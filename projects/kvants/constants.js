const ADDRESSES = require("../helper/coreAssets.json");
const DRIFT_PROGRAM_ID = "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH";
const DRIFT_VAULT_PROGRAM_ID = "vAuLTsyrvSfZRuRB3XgvkPwNGgYSs9YRYymVebLKoxR";

const START_TIMESTAMP = 1748908800; // 2025-06-03

const TOKENS = {
  USDC: {
    name: "USDC",
    mint: ADDRESSES.solana.USDC,
    decimals: 6,
  },
  SOL: {
    name: "SOL",
    mint: ADDRESSES.solana.SOL,
    decimals: 9,
  },
  JLP: {
    name: "Jupiter Perps LP",
    mint: "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
    decimals: 6,
  },
};

const DRIFT_VAULTS = [
  // PUBLIC
  {
    name: "USDC Alpha Stable",
    address: "EwHHtPNHttdUNHxVFdt9v1xuQyDnNcE5FzXWSTh1HG7n",
    token: TOKENS.USDC,
  },
  {
    name: "USDC Alpha Aggressive",
    address: "93gLh83YceGb6Cm3oYdutZ8xY9si5JX5dU7Ei6LkZHbJ",
    token: TOKENS.USDC,
  },
  {
    name: "USDC Staking (Neutral JLP)",
    address: "DrC6TVpLHtyL4JvFnxLscQsxatmN1sRi4v8SN2uqBDa7",
    token: TOKENS.USDC,
  },
];

module.exports = {
  START_TIMESTAMP,
  DRIFT_PROGRAM_ID,
  DRIFT_VAULT_PROGRAM_ID,
  TOKENS,
  DRIFT_VAULTS,
};
