const masterChefTUNDRA = "0x87f1b38D0C158abe2F390E5E3482FDb97bC8D0C5";
const TUNDRA = "0x21c5402C3B7d40C89Cc472C9dF5dD7E51BbAb1b1";

const masterChefEXP = "0x02941a0Ffa0Bb0E41D9d96314488d2E7652EDEa6";
const EXP = "0xf57b80a574297892b64e9a6c997662889b04a73a";

const masterChefDUNE = "0xCEA209Fafc46E5C889A8ad809e7C8e444B2420C0";
const DUNE = "0x314f3bee25e49ea4bcea9a3d1321c74c95f10eab";

const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

const common = { chain: 'avax', nativeTokens: [TUNDRA, EXP, DUNE] }

module.exports = mergeExports([
  masterchefExports({ ...common, masterchef: masterChefDUNE, }),
  masterchefExports({ ...common, masterchef: masterChefEXP, }),
  masterchefExports({ ...common, masterchef: masterChefTUNDRA, }),
])