const { sumTokensExport } = require("../helper/sumTokens");

const GLM = "0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const LOCKING_V1 = "0x879133fd79b7f48ce1c368b0fca9ea168eaf117c";
const LOCKING_V2 = "0x7bee381d8ea5AE16459BcCD06ee5600bD0F1E86f";

module.exports = {
  methodology:
    "TVL counts assets natively held in Octant's locking contracts on Ethereum mainnet: " +
    "(1) GLM tokens locked by users in the v1 (legacy) and v2 locking contracts to participate " +
    "in Octant's ecosystem-funding mechanism, plus (2) WETH held in the v2 locking contract as " +
    "the reward escrow pool, deposited by the Golem Foundation and distributed to GLM lockers " +
    "as continuous ETH rewards. Octant operates as a wrapper / orchestration layer over " +
    "underlying yield protocols (Yearn V3, Aave, Morpho, Sky, Spark); user collateral deposited " +
    "into Octant's strategy vaults flows through to those underlying protocols and is accounted " +
    "on their respective DefiLlama adapters. Counting that pass-through collateral here would " +
    "double-count.",
  hallmarks: [
    ["2023-06-01", "Epoch 1 launch"],
    ["2024-01-01", "Epoch 5: 100k GLM minimum removed"],
    ["2026-02-18", "v2 locking contract opens, migration window starts"],
    ["2026-04-01", "v1 rewards sunset, v2 continuous rewards live"],
  ],
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [GLM, LOCKING_V1],
        [GLM, LOCKING_V2],
        [WETH, LOCKING_V2],
      ],
    }),
  },
};
