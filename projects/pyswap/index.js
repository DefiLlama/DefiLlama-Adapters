const { sumTokensExport } = require("../helper/unwrapLPs");

const native_staking_contract = "0xFFD687B05E7178647d4Bb7734e93748dF4A3341a";
const pys_staking_contract = "0x18E2fA8c010b56779285336D0920F1027f0bDBbb";

const assets = [
  "0x4200000000000000000000000000000000000006",
  "0x0000000000000000000000000000000000000000", // This is address of native token
];
const PY_SWAP = '0x2928CBA5b5e5B48113281263FC037c7a5d8E1EDf'

module.exports = {
  op_bnb: {
    tvl: sumTokensExport({ owner: native_staking_contract, tokens: assets }),
    staking: sumTokensExport({ owner: pys_staking_contract, tokens: [PY_SWAP] }),
  },
};
