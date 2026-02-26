/**
 * Auxite - Tokenized Precious Metals (RWA)
 * 
 * Auxite is a tokenized precious metals platform offering 
 * institutional-grade access to physically-backed gold, silver, 
 * platinum, and palladium.
 * 
 * Each token represents 1 gram of physical metal stored in 
 * LBMA/LPPM-certified vaults across 4 global locations
 * (London, Zurich, Dubai, Istanbul).
 * 
 * Pricing: Fetched directly from Auxite Oracle contract
 * (not dependent on CoinGecko - real metal spot prices)
 * 
 * Website: https://auxite.io
 * Trust Center: https://auxite.io/trust/reserves
 * GitHub: https://github.com/temelreiz/auxite-wallet
 */

const ADDRESSES = require('../helper/coreAssets.json');

// ═══════════════════════════════════════════════════════════════════════════
// BASE MAINNET CONTRACTS (V8 - Deployed 2026-02-02)
// ═══════════════════════════════════════════════════════════════════════════

// Metal Token Addresses
const AUXITE_TOKENS = {
  AUXG: "0x390164702040B509A3D752243F92C2Ac0318989D",  // Auxite Gold
  AUXS: "0x82F6EB8Ba5C84c8Fd395b25a7A40ade08F0868aa",  // Auxite Silver  
  AUXPT: "0x119de594170b68561b1761ae1246C5154F94705d", // Auxite Platinum
  AUXPD: "0xe051B2603617277Ab50C509F5A38C16056C1C908", // Auxite Palladium
};

// Oracle Contract - provides real-time metal prices
const ORACLE_ADDRESS = "0x585314943599C810698E3263aE9F9ec4C1C25Ff2";

// Staking Contract
const STAKING_CONTRACT = "0x1656DcCC8277bC7D6aF93F71464D64ebBC15574d";

// ═══════════════════════════════════════════════════════════════════════════
// ORACLE METAL IDs (keccak256 hashes)
// ═══════════════════════════════════════════════════════════════════════════

const METAL_IDS = {
  GOLD: "0xdbd17891fc491ac6717dd01ab1f90f82509f1f2e91cd5066f68805860fbdeb72",
  SILVER: "0x75e02a3ee626f5d4b8bc98cc8de5b102ee067608b6066832ffdc71f78445ac2b",
  PLATINUM: "0xecbba860b0e9fdd311c554f0b28ccf3d616b99de2f208aa830a91bd846d16657",
  PALLADIUM: "0x06be24fb53be069d32979b5b3d41617a459d2f6b1b018dd945ebb5b9dc321d15",
};

// ═══════════════════════════════════════════════════════════════════════════
// ORACLE ABI
// ═══════════════════════════════════════════════════════════════════════════

const ORACLE_ABI = {
  // Get all prices at once (more gas efficient)
  getAllPrices: "function getAllPrices() view returns (uint256 gold, uint256 silver, uint256 platinum, uint256 palladium, uint256 eth)",
  // Get price per gram for specific metal (prices in E6 format)
  getPricePerGramE6: "function getPricePerGramE6(bytes32 metalId) view returns (uint256)",
  // Get price per KG (E6 format)
  getBasePerKgE6: "function getBasePerKgE6(bytes32 metalId) view returns (uint256)",
};

// Token decimals: 3 (1 token = 1 gram, 0.001 token = 1 milligram)
const TOKEN_DECIMALS = 3;

// ═══════════════════════════════════════════════════════════════════════════
// TVL CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

async function calculateTvl(api, balanceGetter) {
  // 1. Get token balances (supply or staked amount)
  const balances = await balanceGetter();
  
  // 2. Get metal prices from Auxite Oracle (prices per KG in E6 format)
  // Using getAllPrices for efficiency
  const allPrices = await api.call({ 
    target: ORACLE_ADDRESS, 
    abi: ORACLE_ABI.getAllPrices 
  });
  
  // allPrices returns: [gold, silver, platinum, palladium, eth] - all per KG in E6
  const pricesPerKgE6 = {
    AUXG: Number(allPrices.gold || allPrices[0]),
    AUXS: Number(allPrices.silver || allPrices[1]),
    AUXPT: Number(allPrices.platinum || allPrices[2]),
    AUXPD: Number(allPrices.palladium || allPrices[3]),
  };
  
  // 3. Calculate TVL in USD
  let totalUsd = 0;
  
  const tokenSymbols = Object.keys(AUXITE_TOKENS);
  tokenSymbols.forEach((symbol, i) => {
    const balance = Number(balances[i]); // in token units (3 decimals)
    const pricePerKgE6 = pricesPerKgE6[symbol];
    
    // Convert to grams: balance / 1000 (since 3 decimals)
    const grams = balance / (10 ** TOKEN_DECIMALS);
    
    // Convert to KG: grams / 1000
    const kg = grams / 1000;
    
    // Price per KG in USD: pricePerKgE6 / 1e6
    const pricePerKgUsd = pricePerKgE6 / 1e6;
    
    // Value in USD
    const valueUsd = kg * pricePerKgUsd;
    
    totalUsd += valueUsd;
  });
  
  // Add TVL as USDC (6 decimals)
  const USDC_BASE = ADDRESSES.base?.USDC || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  api.add(USDC_BASE, Math.floor(totalUsd * 1e6));
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  methodology: `
    Auxite TVL represents the total value of tokenized precious metals on the platform.
    
    Calculation:
    - Total supply of each metal token (AUXG, AUXS, AUXPT, AUXPD) is fetched from Base Mainnet
    - Each token represents 1 gram of physical metal (3 decimal precision)
    - Metal prices are fetched directly from Auxite's on-chain Oracle contract
    - Oracle prices track real-time precious metal spot prices (updated regularly)
    - TVL = Σ (token_supply × metal_price) for all metals
    
    Backing:
    - 1:1 physically backed by LBMA/LPPM-certified precious metals
    - Vaults in London, Zurich, Dubai, and Istanbul
    - Real-time proof of reserves: https://auxite.io/trust/reserves
    
    Note: Pricing is independent of CoinGecko - sourced directly from Auxite Oracle.
  `,
  
  base: {
    tvl: async (api) => {
      await calculateTvl(api, async () => {
        // Get total supply for each token
        return await api.multiCall({
          abi: 'erc20:totalSupply',
          calls: Object.values(AUXITE_TOKENS),
        });
      });
    },
    
    staking: async (api) => {
      await calculateTvl(api, async () => {
        // Get staked balances in staking contract
        return await api.multiCall({
          abi: 'erc20:balanceOf',
          calls: Object.values(AUXITE_TOKENS).map(token => ({
            target: token,
            params: [STAKING_CONTRACT]
          })),
        });
      });
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HALLMARKS (Significant Events)
// ═══════════════════════════════════════════════════════════════════════════

module.exports.hallmarks = [
  ['2026-02-02', "V8 metal tokens deployed on Base Mainnet"],
  ['2026-02-03', "Oracle V2 deployed with real-time price feeds"],
];

