const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const goldilocksDAORFAWallet = "0x3B0efb9E4165C56d5b1E8849b38426E1B5615593"
const goldilocksDAOTreasury = "0x6FD990680deB2e5DCcb2FFEfC3307Dd34138Ac7F"
const goldilocksDAOOperations = "0xf5960b86048893bD25766c16aB6Da1aC628D97EE"
const LOCKS = "0xb7E448E5677D212B8C8Da7D6312E8Afc49800466"
const PORRIDGE = "0xbf2E152f460090aCE91A456e3deE5ACf703f27aD"


module.exports = treasuryExports({
  berachain: {
    tokens: [
        nullAddress,
        ADDRESSES.berachain.WBERA, // WBERA
        ADDRESSES.berachain.HONEY, // HONEY
        ADDRESSES.berachain.USDC, // USDC
        "0x69f1E971257419B1E9C405A553f252c64A29A30a", // oriBGT
        "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe", // LBGT
        "0x18878Df23e2a36f81e820e4b47b4A40576D3159C", // OHM
        "0x08A38Caa631DE329FF2DAD1656CE789F31AF3142", // YEET
        "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b", // iBGT
        "0x7F0976b52F6c1ddcD4d6f639537C97DE22fa2b69", // hiBERO
        "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe", // LBGT
        "0xFace73a169e2CA2934036C8Af9f464b5De9eF0ca", // stLBGT
        "0x078e5010752b01ccbc8868cf00cd73e8efe29fe5", // stLBGT / stLBGT-OT Kodiak Island
        "0x6Fd7f15a0d7babe0A1a752564a591e1Cb6117F80", // ysysyBGT
    ],
    owners: [goldilocksDAORFAWallet, goldilocksDAOTreasury, goldilocksDAOOperations],
    ownTokens: [LOCKS, PORRIDGE],
  },
});