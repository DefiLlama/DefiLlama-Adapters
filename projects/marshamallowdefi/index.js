const abi = require("./abi.json");
const MASH = "0x787732f27d18495494cea3792ed7946bbcff8db2";
const TOFY = "0xe1f2d89a6c79b4242f300f880e490a70083e9a1c";


const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");
const common = {
  chain: 'bsc',
  nativeTokens: [MASH, TOFY],
  poolInfoABI: abi.poolInfo,
  blacklistedTokens: ['0x00000000548997391c670a5179af731a30e7c3ad']
}

module.exports = mergeExports([
  masterchefExports({
    ...common,
    masterchef: '0x8932a6265b01D1D4e1650fEB8Ac38f9D79D3957b',
  }),
  masterchefExports({
    masterchef: '0xEE49Aa34833Ca3b7d873ED63CDBc031A09226a5d',
    ...common,
  })
])
