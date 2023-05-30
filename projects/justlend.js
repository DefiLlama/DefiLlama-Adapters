const { compoundExports2 } = require('./helper/compound')
const ADDRESSES = require('./helper/coreAssets.json')

module.exports = {
  tron: compoundExports2({ comptroller: 'TGjYzgCyPobsNS9n6WcbdLVR9dH7mWqFx7', cether: '0x2c7c9963111905d29eb8da37d28b0f53a7bb5c28', cetheEquivalent: ADDRESSES.tron.WTRX, transformAdressRaw: i => 'tron:' + i }),
};
