/**
 * Auxite - Tokenized Precious Metals (RWA) on Base
 *
 * TVL = totalSupply of each metal token x on-chain oracle price.
 * Each token = 1 gram of physically-backed, allocated precious metal
 * (custody: Silver Bullion SG + Istanbul vault; attestation: The Network Firm).
 */

const ADDRESSES = require('../helper/coreAssets.json');

// Canonical AuxiteMetal contracts (per-investor on-chain ownership).
const AUXITE_TOKENS = {
  AUXG: "0xCef9D7593E8Ba796eE05C54B8983B7749bB1218a",
  AUXS: "0xB0aC63aeD12b5A0Ee710618D99444bf126068c1a",
  AUXPT: "0x39F314fb20668997A2ADDaB1eA9236e0072D5E2D",
  AUXPD: "0x6e4837fCf158D15ABFdf90b3954D041D452BE832",
};

const ORACLE_ADDRESS = "0xDB36fFD8a762226928d62a2Fe6F19bB329b5EbbE";

const ORACLE_ABI = {
  getAllPrices: "function getAllPrices() view returns (uint256 gold, uint256 silver, uint256 platinum, uint256 palladium, uint256 eth)",
};

async function getPrices(api) {
  const p = await api.call({ target: ORACLE_ADDRESS, abi: ORACLE_ABI.getAllPrices });
  return {
    AUXG: p.gold ?? p[0],
    AUXS: p.silver ?? p[1],
    AUXPT: p.platinum ?? p[2],
    AUXPD: p.palladium ?? p[3],
  };
}

module.exports = {
  methodology: "TVL is the total supply of AUXG, AUXS, AUXPT, AUXPD on Base multiplied by per-metal USD prices from the Auxite on-chain oracle. Each token = 1 gram of allocated, physically-backed precious metal; totalSupply equals the full allocated physical metal (AUM).",
  base: {
    tvl: async (api) => {
      const USDC = ADDRESSES.base?.USDC || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
      const [supplies, prices] = await Promise.all([
        api.multiCall({ abi: 'erc20:totalSupply', calls: Object.values(AUXITE_TOKENS) }),
        getPrices(api),
      ]);
      let total = 0n;
      Object.keys(AUXITE_TOKENS).forEach((sym, i) => {
        total += (BigInt(supplies[i] ?? 0) * BigInt(prices[sym] ?? 0)) / 1000000n;
      });
      api.add(USDC, total.toString());
    },
  },
  misrepresentedTokens: true,
};

module.exports.hallmarks = [
  ['2026-02-02', "V8 tokens deployed on Base Mainnet"],
  ['2026-06-09', "Migrated to canonical AuxiteMetal contracts (per-investor on-chain ownership)"],
];
