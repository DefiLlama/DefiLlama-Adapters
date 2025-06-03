const { sumTokens2 } = require('@defillama/sdk/build/generalUtil');

// Token addresses on Base
const cbBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Contract addresses holding assets
const cbBTC_ESCROW = [
  "0xa6b0d40e218e29ba626ead3da4e8f146027a802d",
  "0x87c127d4413e67d38c25b543cf8fc2c4a5f2fbc3",
];

const WETH_ESCROW = [
  "0xf2c42a0707927d6582072aeab7acb8a700455676",
  "0x8d1081e8a6e5c29ec3e6bdfe4d09a622ef22c369",
];

const USDC_PROVIDER = [
  "0x179ef7d08416cbee440b50e63deebc0b40770df3",
  "0x9180d9cf00b772ea4cab31e3b86886b561b3dd44",
  "0xb560c3a66e0af8b08a4e5a290f8ea651bf9dda4b",
  "0xdbc703f1df19ec3f0a43461c84a8c31db3c07b13",
];

const USDC_TAKER = [
  "0x674c357a26731874d3c1eaf2c00a1df4e0410121",
  "0x3ec73f92afe1f1fa862fa2d877e730221df8065e",
  "0x28aff0dd8bb96e6cf4551bb1159b70746e84c072",
  "0x68c5a88111b4d300734dbaece7b16b809e712263",
];

async function tvl(_, _1, _2, { api }) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [cbBTC, cbBTC_ESCROW],
      [WETH, WETH_ESCROW],
      [USDC, USDC_PROVIDER],
      [USDC, USDC_TAKER],
    ],
  });
}

module.exports = {
  methodology:
    "TVL includes cbBTC and WETH locked in escrow contracts, and USDC held in both provider and taker contracts. Balances are fetched via on-chain `balanceOf` calls.",
  start: 1714608000, // 🔁 Replace with your protocol launch timestamp (e.g., April 2024)
  timetravel: true,
  base: {
    tvl,
  },
};

