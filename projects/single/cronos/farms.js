
const WMASTERCHEF_ADDR = '0x05e0A288441dd6Ae69e412e4EB16f812498a4e32';
const VVS_MASTERCHEF = '0xDccd6455AE04b03d785F12196B492b18129564bc';

const LPS = {
  'USDC-SINGLE-LP': '0x0fbab8a90cac61b481530aad3a64fe17b322c25d',
  'USDC-CRO-LP': '0xe61Db569E231B3f5530168Aa2C9D50246525b6d6',
  'USDT-CRO-LP': '0x3d2180DB9E1B909f35C398BC39EF36108C0FC8c3',
  'USDC-VVS-LP': '0x814920D1b8007207db6cB5a2dD92bF0b082BDBa1',
  'USDT-VVS-LP': '0x280aCAD550B2d3Ba63C8cbff51b503Ea41a1c61B',
  'USDC-TONIC-LP': '0x2f12d47fe49b907d7a5df8159c1ce665187f15c4',
  'VVS-SINGLE-LP': '0x6f72a3f6db6f486b50217f6e721f4388994b1fbe',
  "CRO-ELON-LP": '0x7AaF2e3AFde06A7f9E686c1dDE4fAB14979384ce', 
  "CRO-SHIB-LP": '0xc9eA98736dbC94FAA91AbF9F4aD1eb41e7fb40f4', 
  "CRO-DOGE-LP": '0x2A560f2312CB56327AD5D65a03F1bfEC10b62075', 
  "CRO-BTC-LP": '0x8F09fFf247B8fDB80461E5Cf5E82dD1aE2EBd6d7', 
  "CRO-VVS-LP": '0xbf62c67eA509E86F07c8c69d0286C0636C50270b', 
  "CRO-DAI-LP": '0x3Eb9FF92e19b73235A393000C176c8bb150F1B20', 
  "CRO-ATOM-LP": '0x9e5bd780dff875Dd85848a65549791445AE25De0', 
  "CRO-TONIC-LP": '0x4B377121d968Bf7a62D51B96523d59506e7c2BF0', 
  "USDC-USDT-LP": '0x39cC0E14795A8e6e9D02A21091b81FE0d61D82f9', 
  "CRO-ETH-LP": '0xA111C17f8B8303280d3EB01BBcd61000AA7F39F9',
}

const farms = [
  {
    name: 'CRO-ETH',
    lpToken: LPS['CRO-ETH-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 1,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-WBTC',
    lpToken: LPS['CRO-BTC-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 2,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-USDC',
    lpToken: LPS['USDC-CRO-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 3,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-VVS',
    lpToken: LPS['CRO-VVS-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 4,
    sinceBlock: 1273155
  },
  {
    name: 'VVS-USDC',
    lpToken: LPS['USDC-VVS-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 5,
    sinceBlock: 1273155
  },
  {
    name: 'USDC-USDT',
    lpToken: LPS['USDC-USDT-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 6,
    sinceBlock: 1273155
  },
  {
    name: 'VVS-USDT',
    lpToken: LPS['USDT-VVS-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 7,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-SHIB',
    lpToken: LPS['CRO-SHIB-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 8,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-USDT',
    lpToken: LPS['USDT-CRO-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 9,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-DAI',
    lpToken: LPS['CRO-DAI-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 10,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-DOGE',
    lpToken: LPS['CRO-DOGE-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 12,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-ATOM',
    lpToken: LPS['CRO-ATOM-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 13,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-ELON',
    lpToken: LPS['CRO-ELON-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 15,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-TONIC',
    lpToken: LPS['CRO-TONIC-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 16,
    sinceBlock: 1273155
  },
  {
    name: 'SINGLE-VVS',
    lpToken: LPS['VVS-SINGLE-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 17,
    sinceBlock: 1273155,
    isPool2: true,
  },
  {
    name: 'SINGLE-USDC',
    lpToken: LPS['USDC-SINGLE-LP'],
    masterChef: VVS_MASTERCHEF,
    masterchefPoolId: 18,
    sinceBlock: 1273155,
    isPool2: true,
  },

];


module.exports = {
  WMASTERCHEF_ADDR,
  farms,
}