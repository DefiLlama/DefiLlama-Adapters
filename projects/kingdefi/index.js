const { staking } = require("../helper/staking");

const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  masterchefExports({
    chain: 'polygon',
    masterchef: '0x445AcaE7E3e6248B9b6ebbb002126211e7836Dd8',
  }),
  masterchefExports({
    chain: 'bsc',
    masterchef: '0x49A44ea2B4126CC1C53C47Ed7f9a5905Cbecae8d',
    nativeToken: '0x1446f3cedf4d86a9399e49f7937766e6de2a3aab',
  }),
  { bsc: { staking: staking('0x98F3b99198E164f50272ea5Ba44Ea76B1a439876', '0x1446f3cedf4d86a9399e49f7937766e6de2a3aab')}}
])