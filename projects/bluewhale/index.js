const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const { sumTokensExport } = require('../helper/sumTokens');

const AQUA_FACTORY = '0x77716798B9E470439D02C27107632FbFd10aF345';
const CLAM_MASTERCHEF = '0x19562EF0c60837e71eb78b66786D7070bB3675a0';
const PEARL_MASTERCHEF = '0x952F202B5E58058DEb468cd30d081922C36bf29a';
const KRILL_MASTERCHEF = '0x68e83E5300594E664701Aa38A1d80F9524cA82D8';

const tokens = {
  "sBWPM": "0xf4546e1d3ad590a3c6d178d671b3bc0e8a81e27d",
  "KRILL": "0x83bc9fe9eebfeb1ad4178ac5e7445dc6a7e95718",
  "PEARL": "0xb3b1b54e3b9a27cee606f1018760abec4274bd35",
  "CLAM": "0xba9725eaccf07044625f1d232ef682216f5371c2",
  "sADOL": "0x4f3ac44bb2345d3960e34dd5dfe275249e43ae4a"
}

const LPs = {
  ksp: {
    sbwpm_ousdt: "0xb6eaa073881c9cac7141ef20b25a588914a367b2",
    clam_ousdc: "0x87882c1a76fad9ae5bf5ba1bedd7d82be73430c8",
    // clam_oxrp_v3: "0x7c9a31020b32a528367602468688f16d7b469337",
    // clam_klay_v3: "0xbdb8ddf58ff70bfa1b1a2e2ab9751bc5fcdfefab",
    // clam_ksp_v3: "0xb36df541218dd2ee26f54c2775c528c27e484ef6",
    // clam_owbtc_v3: "0xf0e21e240a291258db0417c6ac1a3fe156073a96",
    // clam_oeth_v3: "0xcae4254611097112b9cbe62e0d047a2957843c09",
    // clam_pearl_v3: "0xfc37f916418d50adf4177d734463f822f73ebd99",
    // clam_ousdt_v3: "0x633fd7084e9b2c098b88e90a2fcb582af5d9b0e1",
    // pearl_oxrp_v3: "0x006965e875b108cf53cba9aa3759b700af464329",
    // pearl_owbtc_v3: "0xad55cf6024a21c650569d3b28a8679e613e43348",
    // pearl_oeth_v3: "0x388a8973b477924cc15f46d17967e10334fbbaca",
  },
  pala: {
    sbwpm_ousdt: "0xd90f637a7a1362028f8ad77eba9655c7b92bb919",
    clam_ousdc: "0xbb6c0a0dd21bb3b880228c7736a7301f48b8200e",
    clam_sbwpm: "0x5c8aadcbf79a861bf8f7ec69eb2bf6fe15b75e2e",
  },
  aqua: {
    sadol_clam: "0x144a347dabd17ffdb93f3a09a64a96743b273d67",
    clam_ousdt: "0x8c9e758d5f448f2669f45bfec7749bc372996c2e",
  },
  devteam: "0x8d4d436b6665e41a9caf4057c3f924d945a2aa8e",
}

const pool2Tokens = Object.values(LPs.ksp).concat(Object.values(LPs.pala))

module.exports = {
  misrepresentedTokens: true,
  methodology: `counts the number of tokens in the Bluewhale contract. `,
  klaytn: {
    tvl: getUniTVL({ factory: AQUA_FACTORY, useDefaultCoreAssets: true }),
    staking: staking([PEARL_MASTERCHEF, CLAM_MASTERCHEF, KRILL_MASTERCHEF], [tokens.PEARL, tokens.CLAM, tokens.sBWPM]),
    pool2: sumTokensExport({ owner: CLAM_MASTERCHEF, tokens: pool2Tokens, resolveLP: true, }),
  },
};