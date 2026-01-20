const {  compoundExports2 } = require('../helper/compound');

module.exports = {
  heco: compoundExports2({ comptroller: '0xb74633f2022452f377403B638167b0A135DB096d', cether: '0x824151251b38056d54a15e56b73c54ba44811af8'}),
  iotex: compoundExports2({ comptroller: '0x55E5F6E48FD4715e1c05b9dAfa5CfD0B387425Ee',}),
  bsc: compoundExports2({ comptroller: '0xF0700A310Cb14615a67EEc1A8dAd5791859f65f1',}),
  rei: compoundExports2({ comptroller: '0xEc1e6e331e990a0D8e40AC51f773e9c998ec7BC3',}),
  polygon: compoundExports2({ comptroller: '0xfBE0f3A3d1405257Bd69691406Eafa73f5095723',}),
  arbitrum: compoundExports2({ comptroller: '0xF67EF5E77B350A81DcbA5430Bc8bE876eDa8D591',}),
  elastos: compoundExports2({ comptroller: '0xE52792E024697A6be770e5d6F1C455550265B2CD',}),
  kava: compoundExports2({ comptroller: '0xD2CBE89a36df2546eebc71766264e0F306d38196',}),
  bittorrent: compoundExports2({ comptroller: '0xE52792E024697A6be770e5d6F1C455550265B2CD',}),
  hallmarks: [
    ['2023-04-24', 'Protocol was hacked'],
  ],
};
