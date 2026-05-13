const ADDRESSES = require('../helper/coreAssets.json');

// BSC USDT (18 decimals) — used to price CUSD since CUSD = 1 USD (1:1 peg)
const BSC_USDT = ADDRESSES.bsc.USDT;

// CUSD — protocol stablecoin (6 decimals), always redeemable 1:1 for USDT
const CUSD = "0xc5079966b3190909f69306fE7587ffE493dEdB5F";

// Protocol-owned reward vaults: CUSD held here funds staking incentive payouts.
// These are NOT user-staked positions — protocol treasury inventory.
const REWARD_VAULTS = [
  "0x9057c3a25ff8e71bc05782a3d44a74fa7eb95688",   // Gold Reward Vault
  "0x54ecbcb04da981f3a6896ad1b83c5ec47ee4d618",   // Silver Reward Vault
  "0xf98f5908fa0b2b0cb32b79f2612446c7e3bffcad",   // Platinum Reward Vault
  "0x2f30fd7b18b8c69e85131e387d88919ae85f26c1",   // Palladium Reward Vault
];

async function treasury(api) {
  // Read CUSD balance from each reward vault
  const bals = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: REWARD_VAULTS.map(owner => ({ target: CUSD, params: [owner] })),
  });

  let total = BigInt(0);
  for (const bal of bals) {
    total += BigInt(bal || 0);
  }

  // CUSD is 6 decimals; BSC USDT is 18 decimals — scale up by 1e12
  // CUSD is pegged 1:1 to USD, so reporting as USDT is accurate
  api.add(BSC_USDT, total * BigInt(1e12));
}

module.exports = {
  misrepresentedTokens: true,  // CUSD reported as USDT (1:1 USD peg)
  bsc: { tvl: treasury },
};
