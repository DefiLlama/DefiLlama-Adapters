// DefiLlama TVL Adapter — Wikicious Protocol
// Chain: Arbitrum One (42161)
// 133 contracts | India's first fully on-chain DEX
// Submit via PR to: github.com/DefiLlama/DefiLlama-Adapters

const sdk = require("@defillama/sdk");

// ── External tokens tracked ──
const USDC  = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const WETH  = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const WBTC  = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
const ARB   = "0x912CE59144191C1204E64559FE8253a0e49E6548";
const USDT  = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const WSTETH= "0x5979D7b546E38E414F7E9822514be443A4800529";
const RETH  = "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8";

// ── Wikicious core contract addresses ──
const contracts = {
  // Primary TVL vaults
  WikiVault:           "0x4533E181FdF5b0C66e0816992F38c23d57e42Df8",
  WikiPerp:            "0x723f653a3DEFC45FB934BBF81f1411883a977468",
  WikiVirtualAMM:      "0x9C63c27B8A73A990a2D89141622A639a2363b88A",
  WikiAMM:             "0x5e73fa11c2Fa157dbE59E7B8F7f1b3101c5c6004",

  // Yield
  WikiYieldAggregator: "0x95F3Cf765b479478c44D0EE932f17444ADA6A9a1",
  WikiInsuranceFund:   "0x1376a071B84006489DeE4bDEF68eB8fA9854e758",
  WikiPOL:             "0xEfbfEd647213c78316CDB8418026Cba6515BC7FB",
  WikiBackstopVault:   "0xf2cD47C16CCA38aC77e6ab344E04e7E97C400748",
  WikiFundingArbVault: "0x8897A8Ae133b0DD71ef6E28B1A8efB42f1Ef78d4",
  WikiIdleYieldRouter: "0x53b6A9bE66C68090c26d4BE74f6eB916578F3A0B",

  // Staking
  WikiStaking:         "0xDD551D705fAbD4380D2C95F7345b671cE3310bd2",
  WikiLiquidStaking:   "0x6ac54F360315E0B3Dae455ad371A06d154b410B2",

  // Lending
  WikiLending:         "0x74635CFa33EEAe220367fF10C598e098a29e9246",

  // Trading products
  WikiCopyTrading:     "0x9e09dF7E84aBf818882a259Ef897a55f25CE1163",
  WikiOptionsVault:    "0xE019e13abdd7160f8467D55E3e190022295dEdc1",

  // Protocol
  WikiDAOTreasury:     "0x00b13b0D1E9b18cfeF2C998027Ed7291CC163A3f",
  WikiLaunchpad:       "0x42DB4776FFB45f2cc5663407e7953935f63fd40E",
  WikiSpot:            "0x08FC8f870Df09A7265D1D06a7A95C41cEf98d9E6",
};

// ── Tokens to check per contract ──
const TOKENS = [USDC, WETH, WBTC, ARB, USDT, WSTETH, RETH];

// ── TVL calculation ──
async function tvl(api) {
  const calls = [];

  for (const [name, address] of Object.entries(contracts)) {
    for (const token of TOKENS) {
      calls.push({ target: token, params: [address] });
    }
  }

  const balances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls,
  });

  const result = {};
  balances.forEach(({ output }, i) => {
    const token = calls[i].target;
    if (!result[token]) result[token] = BigInt(0);
    result[token] += BigInt(output || 0);
  });

  for (const [token, balance] of Object.entries(result)) {
    api.add(token, balance.toString());
  }
}

// ── WikiStaking TVL (WIK token staked) ──
async function staking(api) {
  const WIK = "0xa681Bf6f0449ABc4E98DCa3468488Fe1b24FdD0F";
  await api.sumTokens({
    tokensAndOwners: [
      [WIK, contracts.WikiStaking],
      [WIK, contracts.WikiLiquidStaking],
      [WIK, contracts.WikiGaugeVoting],
    ],
  });
}

// ── WikiLaunchpad pool TVL ──
async function pool2(api) {
  await api.sumTokens({
    tokensAndOwners: [
      [USDC, contracts.WikiLaunchpad],
    ],
  });
}

module.exports = {
  methodology:
    "TVL includes USDC, WETH, WBTC, ARB, USDT, wstETH and rETH " +
    "deposited across WikiVault, WikiPerp, WikiAMM, WikiVirtualAMM, " +
    "WikiYieldAggregator, WikiInsuranceFund, WikiBackstopVault, " +
    "WikiLending, WikiCopyTrading, WikiOptionsVault, WikiDAOTreasury " +
    "and WikiPOL on Arbitrum One.",
  arbitrum: {
    tvl,
    staking,
    pool2,
  },
};
