const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

// CUSD Token (6 decimals) — settlement currency (1:1 USD peg, not listed on CoinGecko)
const CUSD = "0xc5079966b3190909f69306fE7587ffE493dEdB5F";

// BSC USDT (18 decimals) — used as pricing proxy for CUSD
const BSC_USDT = ADDRESSES.bsc.USDT;

// All Treasury contracts that hold CUSD backing tokenized assets
const TREASURIES = [
  "0x2581b28e9f261c0ab5533dbf4305a806afb2fe1e",   // Gold Treasury
  "0x0893e45ad6e655787be1e669e54d9c237b1ff083",   // Silver Treasury
  "0x216238dce287b8b8f2eda8842040c8f862c776cb",   // Platinum Treasury
  "0xc9298ef68392c48f521f7cb8c8261c88099c4b36",   // Palladium Treasury
  "0x5aeAA55d5024CEf2c32497be59b7506481fCddbD",   // Oil Treasury
  "0x9621bD2eF645cb41356Da9Cab8d9DB1EC4e3be1A",   // Copper Treasury
  "0xD8875eEf762A6C23f8473E19C896B584BAaF007A",   // Stable Treasury (V3)
];

// Staking Reward Vaults (CUSD reserves funding staking rewards)
const REWARD_VAULTS = [
  "0x9057c3a25ff8e71bc05782a3d44a74fa7eb95688",   // Gold Reward Vault
  "0x54ecbcb04da981f3a6896ad1b83c5ec47ee4d618",   // Silver Reward Vault
  "0xf98f5908fa0b2b0cb32b79f2612446c7e3bffcad",   // Platinum Reward Vault
  "0x2f30fd7b18b8c69e85131e387d88919ae85f26c1",   // Palladium Reward Vault
];

// Staking Pools (hold staked commodity tokens — these are also unlisted custom tokens)
const STAKING_POOLS = {
  "0x60957d156844Bf33A5c5ba3468F0300219c22CAF": "0xEaFfB5Ed6399b54e5b57e8e5fD54B43aA30eB078",   // Gold Pool -> CXAU
  "0x8eBD980217146490B795A225054f1DD73cCffFD9": "0x92F6dED54270bbAb0d54227bD12161f91812eF5d",   // Silver Pool -> CXAG
  "0xE65Ea5dEF51F0A71B3fA098E2303d2A2B1736F2f": "0x85f38697BFa2482dc663aC08fd7F72aD0D49069C",   // Platinum Pool -> CXPT
  "0xAD4Bde48D02d94D4fa876DBa345a00a714e76A2A": "0xF4517FaAa550514c12641C45dC000C2946C666b0",   // Palladium Pool -> CXPD
};

/**
 * Read CUSD balanceOf for a list of owners, convert to USDT-equivalent.
 * CUSD is 6 decimals, BSC USDT is 18 decimals → multiply by 1e12.
 */
async function getCusdBalances(api, owners) {
  const bals = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: owners.map(owner => ({ target: CUSD, params: [owner] })),
  });
  let total = BigInt(0);
  for (const bal of bals) {
    total += BigInt(bal || 0);
  }
  // Scale from 6 decimals (CUSD) to 18 decimals (USDT)
  api.add(BSC_USDT, (total * BigInt(1e12)).toString());
}

async function tvl(api) {
  // 1. Sum CUSD in all Treasury contracts → report as USDT
  await getCusdBalances(api, TREASURIES);

  // 2. Sum commodity tokens staked in Participation Pools
  //    (these are also unlisted tokens — they represent the same CUSD value
  //     that was used to mint them, but since they don't have CoinGecko prices
  //     we skip them to avoid double-counting with Treasury CUSD)
}

async function staking(api) {
  // Protocol-owned CUSD reserves funding staking rewards — tracked separately
  await getCusdBalances(api, REWARD_VAULTS);
}

module.exports = {
  methodology: "TVL is the sum of CUSD (USD-pegged stablecoin) held in Treasury contracts backing tokenized commodity tokens. CUSD balances are reported as USDT equivalent. Reward Vault reserves are protocol-owned CUSD earmarked for staking incentives and tracked separately under 'staking'. Staked commodity tokens are excluded to avoid double-counting with Treasury reserves.",
  bsc: {
    tvl,
    staking,
  },
};
