const { sumTokensExport } = require("../helper/unwrapLPs");

const DONUT_ADDRESS = "0xAE4a37d554C6D6F3E398546d8566B25052e0169C";
const MINER_ADDRESS = "0xF69614F4Ee8D4D3879dd53d5A039eB3114C794F6";
const MULTICALL_ADDRESS = "0x7a85CA4b4E15df2a7b927Fa56edb050d2399B34c";
const LP_ADDRESS = "0xD1DbB2E56533C55C3A637D13C53aeEf65c5D5703";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

module.exports = {
  methodology:
    "TVL is the sum of tokens in the Miner, Multicall, and LP contracts. Staking TVL counts the tokens locked in the Miner and Multicall contracts. Pool2 TVL counts the tokens in the Liquidity Pool.",
  base: {
    tvl: sumTokensExport({
      owners: [MINER_ADDRESS, MULTICALL_ADDRESS, LP_ADDRESS],
      tokens: [WETH_ADDRESS, DONUT_ADDRESS],
    }),
    staking: sumTokensExport({
      owners: [MINER_ADDRESS, MULTICALL_ADDRESS],
      tokens: [WETH_ADDRESS, DONUT_ADDRESS],
    }),
    pool2: sumTokensExport({
      owner: LP_ADDRESS,
      tokens: [WETH_ADDRESS, DONUT_ADDRESS],
    }),
  },
};
