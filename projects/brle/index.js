const { sumTokens2 } = require("../helper/unwrapLPs");

// BRLE Protocol — BRL yield stablecoin backed by DI fund shares (BTG Pactual)
// Chain: Base (8453)
// Website: https://efix.finance/brle
// CVM Act 23.635/2025

const BRLE_TOKEN = "0x7D12a82E335EB2Be0789A33CE2EBF7Eb2bA782F6";
const SBRLE_VAULT = "0xC65069694e32ef72CD94649BC5174DF9D18475D0";
const BRLE_SWAP = "0xDac75EC3f9d0294d4a48BcE5d0d7A2b0693D7AD1";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [BRLE_TOKEN, SBRLE_VAULT],   // BRLE staked in sBRLE yield vault
      [USDC_BASE, BRLE_SWAP],       // USDC held in swap contract
    ],
  });
}

module.exports = {
  methodology:
    "TVL is the total BRLE deposited in the sBRLE ERC-4626 yield vault plus USDC held in the BRLESwap contract. " +
    "BRLE is pegged 1:1 to BRL and backed by DI fund shares at BTG Pactual (Brazilian fixed income, ~14.4% APY). " +
    "Regulated by CVM (Brazilian SEC) under Act 23.635/2025.",
  base: {
    tvl,
  },
};
