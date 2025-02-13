// projects/aarna-finance/index.js

const { BigNumber } = require("bignumber.js");

// Contracts
const STORAGE_CONTRACT = "0x6a38305d86a032db1b677c975e6fe5863cf1edd2"; 
const VAULT_CONTRACT = "0xb68e430c56ed9e548e864a68a60f9d41f993b32c";

// USDC on Ethereum (6 decimals)
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

// `calculatePoolInUsd(afiContract) -> uint256 (1e18 decimal)`
const abiCalculatePoolInUsd = {
  "inputs": [
    { "internalType": "address", "name": "afiContract", "type": "address" }
  ],
  "name": "calculatePoolInUsd",
  "outputs": [
    { "internalType": "uint256", "name": "", "type": "uint256" }
  ],
  "stateMutability": "view",
  "type": "function"
};

async function tvl(api) {
  // 1) Call calculatePoolInUsd to get the TVL (1e18 decimal representation of USD).
  const tvlInUsd = await api.call({
    abi: abiCalculatePoolInUsd,
    target: STORAGE_CONTRACT,
    params: [VAULT_CONTRACT],
  });

  // 2) We want to represent that as USDC tokens (which has 6 decimals).
  //    Example: If the storage returns 1e20 (=$100 in 1e18 format),
  //    then to represent that in 6-decimal USDC terms, we do:
  //    rawUSDCbalance = 1e20 / 1e12 = 1e8 (which is 100 USDC in 6 decimals).
  const rawBalanceBig = new BigNumber(tvlInUsd);
  const rawUsdcBalance = rawBalanceBig.div(1e12); // Shift from 1e18 to 1e6

  // 3) Add that USDC balance to the aggregator
  api.add(USDC, rawUsdcBalance.toFixed(0)); 
}

module.exports = {
  methodology: 
    "TVL is obtained from calculatePoolInUsd(), which returns a 1e18-based USD value. We convert that value into a 6-decimal USDC balance.",

  // We're on Ethereum here
  ethereum: {
    tvl,
  },
};
