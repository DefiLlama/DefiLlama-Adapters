const { sumTokens2 } = require('../helper/unwrapLPs');

// CUSD Token (6 decimals) — settlement currency
const CUSD = "0xc5079966b3190909f69306fE7587ffE493dEdB5F";

// All Treasury contracts that hold CUSD backing tokenized assets
const TREASURIES = [
  "0x2581b28e9f261c0ab5533dbf4305a806afb2fe1e",   // Gold Treasury
  "0x0893e45ad6e655787be1e669e54d9c237b1ff083",   // Silver Treasury
  "0x216238dce287b8b8f2eda8842040c8f862c776cb",   // Platinum Treasury
  "0xc9298ef68392c48f521f7cb8c8261c88099c4b36",   // Palladium Treasury
  "0x5aeAA55d5024CEf2c32497be59b7506481fCddbD",   // Oil Treasury
  "0x9621bD2eF645cb41356Da9Cab8d9DB1EC4e3be1A",   // Copper Treasury
];

// Staking Reward Vaults (CUSD reserves funding staking rewards)
const REWARD_VAULTS = [
  "0x9057c3a25ff8e71bc05782a3d44a74fa7eb95688",   // Gold Reward Vault
  "0x54ecbcb04da981f3a6896ad1b83c5ec47ee4d618",   // Silver Reward Vault
  "0xf98f5908fa0b2b0cb32b79f2612446c7e3bffcad",   // Platinum Reward Vault
  "0x2f30fd7b18b8c69e85131e387d88919ae85f26c1",   // Palladium Reward Vault
];

// Staking Pools (hold staked commodity tokens)
const STAKING_POOLS = {
  "0x60957d156844Bf33A5c5ba3468F0300219c22CAF": "0xEaFfB5Ed6399b54e5b57e8e5fD54B43aA30eB078",   // Gold Pool -> CXAU
  "0x8eBD980217146490B795A225054f1DD73cCffFD9": "0x92F6dED54270bbAb0d54227bD12161f91812eF5d",   // Silver Pool -> CXAG
  "0xE65Ea5dEF51F0A71B3fA098E2303d2A2B1736F2f": "0x85f38697BFa2482dc663aC08fd7F72aD0D49069C",   // Platinum Pool -> CXPT
  "0xAD4Bde48D02d94D4fa876DBa345a00a714e76A2A": "0xF4517FaAa550514c12641C45dC000C2946C666b0",   // Palladium Pool -> CXPD
};

async function tvl(api) {
  const tokensAndOwners = TREASURIES.map(treasury => [CUSD, treasury]);
  Object.entries(STAKING_POOLS).forEach(([pool, token]) => {
    tokensAndOwners.push([token, pool]);
  });
  return sumTokens2({ api, tokensAndOwners });
}

async function staking(api) {
  // Protocol-owned CUSD reserves funding staking rewards — tracked separately from TVL
  const tokensAndOwners = REWARD_VAULTS.map(vault => [CUSD, vault]);
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology: "TVL is the sum of CUSD held in Treasury contracts (backing tokenized commodities) and commodity tokens staked in Participation Pools. Reward Vault reserves are protocol-owned CUSD earmarked for staking incentives and are tracked separately under 'staking', not included in TVL.",
  bsc: {
    tvl,
    staking,
  },
};
