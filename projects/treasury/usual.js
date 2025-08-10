const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const tokens = [
  '0x259338656198ec7a76c729514d3cb45dfbf768a1', //Resolv
  '0xd001f0a15d272542687b2677ba627f48a4333b5d', // e-USD0
 '0xF8094570485B124b4f2aBE98909A87511489C162', // PENDLE-LPT 
  '0x67ec31a47a4126A66C7bb2fE017308cf5832A4Db', // usUSDS++ 
  '0xB4cD5C5440eb69eDB6db878cA2aCD7C6b97B2ba5', // YT-USD0++-27NOV2025 
  '0xD2245ee5C3099d65a3d0fdCecA0f71Cc4aA8f0FF', // fSL23
  '0x8092cA384D44260ea4feaf7457B629B8DC6f88F0', // ustUSR++ 
  '0x8245FD9Ae99A482dFe76576dd4298f799c041D61', // uUSCC++ 
  '0x28d24D4380B26A1Ef305Ad8D8DB258159E472F33', // Usual_MV
  '0x35D8949372D46B7a3D5A56006AE77B215fc69bC0', // USD0++
  ADDRESSES.ethereum.USD0, // USD0
  '0x437cc33344a0B27A429f795ff6B469C72698B291',  // wM
  '0xC139190F447e929f090Edeb554D95AbB8b18aC1C', // USDtb
  ADDRESSES.ethereum.WSTETH // wstEth
]

const owners = [
  '0x81ad394C0Fa87e99Ca46E1aca093BEe020f203f4', // Yield Treasury 
  '0xF3D913De4B23ddB9CfdFAF955BAC5634CbAE95F4', // longterm Treasury
]

module.exports = treasuryExports({
  ethereum: {
    tokens,
    owners,
    ownTokens: ["0x06B964d96f5dCF7Eae9d7C559B09EDCe244d4B8E", "0xC4441c2BE5d8fA8126822B9929CA0b81Ea0DE38E" ], // USUALX and USUAL 
  }
})