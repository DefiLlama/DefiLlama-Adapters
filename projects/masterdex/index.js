const { sumTokensExport } = require("../helper/unwrapLPs");

const MDEX_ETHEREUM = "0xf0610eb7d8ee12d59412da32625d5e273e78ff0b";
const MDEX_BASE = "0xabc5915cad6b54f48b2a8cd516055f378861c237";

const POOL_MANAGER_ETHEREUM = "0x000000000004444c5dc75cB358380D2e3dE08A90";
const POOL_MANAGER_BASE = "0x498581ff718922c3f8e6a244956af099b2652b2b";

module.exports = {
  methodology:
    "TVL is the total value of MDEX tokens locked in Uniswap V4 liquidity pools on Ethereum and Base.",
  doublecounted: true,
  ethereum: {
    tvl: sumTokensExport({
      owners: [POOL_MANAGER_ETHEREUM],
      tokens: [MDEX_ETHEREUM],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: [POOL_MANAGER_BASE],
      tokens: [MDEX_BASE],
    }),
  },
};
