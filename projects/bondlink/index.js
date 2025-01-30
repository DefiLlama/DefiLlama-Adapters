const sdk = require("@defillama/sdk");

// Bondlink USDb - digital dollar backed by Real World Assets

const USDb = "0x1623A55e0BA2384afD7511D6d7f77CF28790B5c5";
const Base_USDb = "";
const Blast_USDb = "";
const Manta_USDb = "";
const Arbitrum_USDb = "";
const SPCT = "0xB4c10AF7EDf50E3F3f6C758F9973b500d7235f8a"; // Secured collateral

const mainnet_tvl = async (api) => {
  const supply = await api.call({ abi: "erc20:totalSupply", target: USDb });
  api.add(USDb, supply);
};

// const base_tvl = async (api) => {
//   const supply = await api.call({
//     abi: "erc20:totalSupply",
//     target: Base_USDb,
//   });
//   api.add(Base_USDb, supply);
// };

// const blast_tvl = async (api) => {
//   const supply = await api.call({
//     abi: "erc20:totalSupply",
//     target: Blast_USDb,
//   });
//   api.add(Blast_USDb, supply);
// };

// const manta_tvl = async (api) => {
//   const supply = await api.call({
//     abi: "erc20:totalSupply",
//     target: Manta_USDb,
//   });
//   api.add(Manta_USDb, supply);
// };

// const arbitrum_tvl = async (api) => {
//   const supply = await api.call({
//     abi: "erc20:totalSupply",
//     target: Arbitrum_USDb,
//   });
//   api.add(Arbitrum_USDb, supply);
// };

const collateral_assets = async (api) => {
  const supply = await api.call({ abi: "erc20:totalSupply", target: SPCT });
  api.add(SPCT, supply);
};

module.exports = {
  methodology: "Sums total USDb in circulation across all chains",
  ethereum: {
    tvl: mainnet_tvl,
  },
  // base: {
  //   tvl: base_tvl,
  // },
  // blast: {
  //   tvl: blast_tvl,
  // },
  // manta: {
  //   tvl: manta_tvl,
  // },
  // arbitrum: {
  //   tvl: arbitrum_tvl,
  // },
};
