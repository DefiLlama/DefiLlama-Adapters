const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const {getUniTVL} = require("../helper/unknownTokens");

const native_staking_contract_pool1 = "0xFFD687B05E7178647d4Bb7734e93748dF4A3341a";
const native_staking_contract_pool2 = "0x659ea4563841C59Ec284679d35EDc5ed7025b7a9";
const pys_staking_contract = "0x18E2fA8c010b56779285336D0920F1027f0bDBbb";

const assets = [
  "0x9b5902C14B56eF2aa2cC1A2A0731a8F270Ee82f0", //WBNB
  ADDRESSES.null, // This is address of native token
  "0x602aEe302B2703cD2BAC28e13192593228e0078C", // PYSWAP TOKEN
];

let owners = [native_staking_contract_pool1, native_staking_contract_pool2, pys_staking_contract]

let TVL_STAKING = sumTokensExport({ owners, tokens: assets })
let TVL_AMM_DEX = getUniTVL({factory: "0x1434575AbB43103cFb40fd8147FB1e0B2ec3e2A1", useDefaultCoreAssets: true,})

module.exports = {
  op_bnb: {
    tvl: TVL_AMM_DEX,
    staking: TVL_STAKING,
  },
};