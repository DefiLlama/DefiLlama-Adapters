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

// Protocol-owned CUSD reserves earmarked for staking incentive distribution.
// These are NOT user-staked positions — they are protocol inventory.
const REWARD_VAULTS = [
  "0x9057c3a25ff8e71bc05782a3d44a74fa7eb95688",   // Gold Reward Vault
  "0x54ecbcb04da981f3a6896ad1b83c5ec47ee4d618",   // Silver Reward Vault
  "0xf98f5908fa0b2b0cb32b79f2612446c7e3bffcad",   // Platinum Reward Vault
  "0x2f30fd7b18b8c69e85131e387d88919ae85f26c1",   // Palladium Reward Vault
];

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
  for (let i = 0; i < bals.length; i++) {
    const bal = bals[i];
    if (bal == null || bal === '') {
      throw new Error(`balanceOf returned null/empty for CUSD at ${owners[i]}`);
    }
    total += BigInt(bal);
  }
  // Scale from 6 decimals (CUSD) to 18 decimals (USDT)
  api.add(BSC_USDT, (total * BigInt(1e12)).toString());
}

async function tvl(api) {
  // Sum CUSD in all Treasury contracts → report as USDT
  await getCusdBalances(api, TREASURIES);
}

async function staking(api) {
  // Protocol-owned CUSD reserves funding staking rewards.
  // These are protocol inventory, not user-staked positions.
  await getCusdBalances(api, REWARD_VAULTS);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL is the sum of CUSD (USD-pegged stablecoin) held in Treasury contracts backing tokenized commodity tokens. CUSD balances are reported as USDT equivalent (misrepresentedTokens). Protocol-owned Reward Vault reserves (CUSD earmarked for staking incentive distribution) are tracked under 'staking' as the closest available category — these are not user-staked positions. Staked commodity tokens are excluded to avoid double-counting with Treasury reserves.",
  bsc: {
    tvl,
    staking,
  },
};
