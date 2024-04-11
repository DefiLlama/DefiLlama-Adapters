const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const { stakings } = require('../helper/staking')
const masterchefAddress = "0x25c6d6a65c3ae5d41599ba2211629b24604fea4f";
const masterchefV2Address = "0xfdfcE767aDD9dCF032Cbd0DE35F0E57b04495324";
const mjtAddress = ADDRESSES.kcc.MJT;

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "We count liquidity and staking on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x79855a03426e15ad120df77efa623af87bd54ef3', }),
    staking: stakings([masterchefAddress, masterchefV2Address], mjtAddress),
  },
  start: 3000000,
};
