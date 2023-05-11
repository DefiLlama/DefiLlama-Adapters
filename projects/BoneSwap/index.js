const { masterchefExports } = require('../helper/unknownTokens')


const chef = "0x7fB524301283BCc0dEf0FaECc19c490bCEeB67AC"
const bone = "0x16d0046597b0E3B136CDBB4edEb956D04232A711"
const bonewdogeLP = "0x552de336afae1cd17bf1df517403f686f550f21e"
const bonebusdLP = "0x5704d76389bfbde1ab2b642ed9ea720bace88cc9";

module.exports = masterchefExports({ chain: 'dogechain', nativeToken: bone, masterchef: chef, useDefaultCoreAssets: true, lps: [bonewdogeLP, bonebusdLP, ]})