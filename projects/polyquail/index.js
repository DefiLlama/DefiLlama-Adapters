const masterChefKWIL = "0xeA038416Ed234593960704ddeD73B78f7D578AA0";
const KWIL = "0x252656AdC9E22C697Ce6c08cA9065FBEe5E394e7";

const masterChefKEGG = "0xE1de7a777C1f0C85ca583c143b75e691a693e04B";
const KEGG = "0x4f219CfC1681c745D9558fd64d98373A21a246CA";

const masterChefCHK = "0x439E9BE4618bfC5Ebe9B7357d848F65D24a50dDE";
const CHK = "0x6116A2A8Ea71890Cf749823Ee9DEC991930a9eEa";

const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

const nativeTokens = [KWIL, KEGG, CHK]
module.exports = mergeExports([
  masterchefExports({ chain: 'polygon', masterchef: masterChefKWIL, nativeTokens   }),
  masterchefExports({ chain: 'polygon', masterchef: masterChefKEGG, nativeTokens   }),
  masterchefExports({ chain: 'polygon', masterchef: masterChefCHK, nativeTokens   }),
])
