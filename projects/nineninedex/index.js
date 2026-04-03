const { sumTokens2 } = require("../helper/unwrapLPs");

// 999DEX — First Native DEX on BlockDAG Blockchain (Chain ID: 1404)
// Website: https://999dex.com
// The first and most complete DeFi protocol on BlockDAG — 24 smart contracts
// Categories: DEX, Launchpad, Lending, Staking, Yield Farming, Prediction Markets

const VALUE_CONTRACTS = [
  "0x0b6A9622fdC63B2aB23494b79d8e1816E572969C", // BondingCurve (meme token launchpad)
  "0xd2a7b6c7ABA8e9cAE804178397c63A8238f85F8F", // PoolFactory (AMM liquidity)
  "0x5fc9Cfb37f8Fd15BDBfeD8732cE247815b36eD9f", // Staking999 (BDAG staking rewards)
  "0x24A5D50d82bA8bDcEE66633D53D2a7cb15dD4Ea3", // YieldFarming (LP farming)
  "0x960c8A8763BAf9Ee6Bf5Bc2875Df34Da3A36b7Db", // Lending (collateralized loans)
  "0xbA41e775E68BcAF004B97A34E1e41755B3cAEb7d", // Escrow (P2P trading escrow)
  "0xECA3d4948Ac2af8dcb53f4C05dA089b0DEAE5dd1", // Perpetuals (leveraged trading)
  "0x9D32c61616D58c0060E5ECdf2177998c7a4af812", // DAGmarket (prediction market pools)
  "0xC852b0789ae42eB38896CDC08fe63Eb40370Cd3a", // InsurancePool
  "0xFD741e7773270718D0F69bD382b5F9E474809093", // FeeDistributor
];

async function tvl(api) {
  return sumTokens2({
    api,
    ethBalances: true,
    owners: VALUE_CONTRACTS,
  });
}

module.exports = {
  methodology: "Counts native BDAG locked across 999DEX value-holding contracts: bonding curve reserves, AMM liquidity pools, staking vault, yield farming pools, lending protocol, escrow, perpetuals, prediction market pools, and insurance pool.",
  blockdag: {
    tvl,
  },
};