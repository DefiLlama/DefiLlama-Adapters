const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// BSC USDT (18 decimals) — the real backing asset
const BSC_USDT = ADDRESSES.bsc.USDT;

// CUSD Token (6 decimals) — protocol's internal settlement stablecoin
// Minted 1:1 when users deposit USDT via ComdexStableMarket.
// Source code: contracts/src/tokens/CUSDToken.sol
const CUSD = "0xc5079966b3190909f69306fE7587ffE493dEdB5F";

// ── Treasury contracts ──
// StableTreasury holds USDT backing (received when users buy CUSD).
// Commodity Treasuries hold CUSD (received when users buy commodity tokens).
const TREASURIES = [
  "0xD8875eEf762A6C23f8473E19C896B584BAaF007A",   // Stable Treasury (holds USDT)
  "0x2581b28e9f261c0ab5533dbf4305a806afb2fe1e",   // Gold Treasury
  "0x0893e45ad6e655787be1e669e54d9c237b1ff083",   // Silver Treasury
  "0x216238dce287b8b8f2eda8842040c8f862c776cb",   // Platinum Treasury
  "0xc9298ef68392c48f521f7cb8c8261c88099c4b36",   // Palladium Treasury
  "0x5aeAA55d5024CEf2c32497be59b7506481fCddbD",   // Oil Treasury
  "0x9621bD2eF645cb41356Da9Cab8d9DB1EC4e3be1A",   // Copper Treasury
  "0x7C2358a7a67478036A5287022D81EAa760E644B1",   // Aluminum Treasury
  "0xD1c8dcF50FBA73FE119cC284454cF8fC3ecdd3Fe",   // Zinc Treasury
  "0x1beFfff48a7d33b6be43246B9F50147845f69e98",   // Nickel Treasury
  "0xd04b370a88Dc16840CdefB53051168Eb983d113a",   // Lead Treasury
];

async function tvl(api) {
  const tokensAndOwners = [];
  for (const treasury of TREASURIES) {
    tokensAndOwners.push([BSC_USDT, treasury]);  // USDT balances in all treasuries
    tokensAndOwners.push([CUSD, treasury]);       // CUSD balances in all treasuries
  }
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology: "TVL is the sum of USDT and CUSD held across all Treasury contracts. The StableTreasury holds USDT (deposited when users mint CUSD 1:1). Commodity Treasuries (Gold, Silver, Platinum, Palladium, Oil, Copper, Aluminum, Zinc, Nickel, Lead) hold CUSD received from commodity token purchases.",
  bsc: {
    tvl,
  },
};
