
const VVS_WMASTERCHEF_ADDR = '0x05e0A288441dd6Ae69e412e4EB16f812498a4e32';
const VVS_MASTERCHEF = '0xDccd6455AE04b03d785F12196B492b18129564bc';

const MMF_MASTERCHEF = '0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc';
const MMF_WMASTERCHEF_ADDR = '0x539E14063fd3B5fC0C0ccf1E965397a284bC48cf';

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

  //MMF
  "MM-WCRO-MMF-LP": "0xbA452A1c0875D33a440259B1ea4DcA8f5d86D9Ae",
  "MM-MMO-WCRO-LP": "0xf0b5074DBf73c96d766C9A48726CEe7a6074D436",
  "MM-USDC-DAI-LP": "0x787A47b0596fa8F7D6666F3C59696b3c57bB612b",
  "MM-WCRO-LIQ-LP": "0x081FbAE367269725af7a21479eddA39f62f4BAda",
  "MM-MIMAS-WCRO-LP": "0xf56FDfeeF0Ba3de23DaB13a85602bd7BF135E80f",
  "MM-BISON-WCRO-LP": "0xd3FD1eA9f86c6C6Bbdc6536a2247392D764543fD",
  "MM-MMF-CROISSANT-LP": "0xDE991150329dbe53389dB41DB459cAe3fF220bac",
  "MM-CRK-WCRO-LP": "0xc2f62bD1416845f606C5E48181743F7128a30Ee3",
  "MM-CRP-MMF-LP": "0x1338D3C3Cc56f71B45f95F9988e762e4a1EF228D",
  "MM-USDC-DNA-LP": "0x853067186eeB57241d8D460bD8c3aA92CBF6f60e",
  "MM-WCRO-MOON-LP": "0xAeFd1c8B1acC0ECCba26d5c6c712dDf4741E24C7",
  "MM-WCRO-WETH-LP": "0x019d9479606FBDd4aCB16488e0aAE49E4684322b",
  "MM-WCRO-ANN-LP": "0x3DD1617e3E8ACf086efb41f2E3b3732A381DB140",
  "MM-MMF-SPHERE-LP": "0x8ec4F97DE93B4B7BeA29EE5a1E452d1481D62BfC",
  "MM-SINGLE-USDC-LP": "0x2d485E96e02dcF502B1F8C367523B29d4139d596",
  "MM-MMF-BETIFY-LP": "0xe2c5275d86D2fB860F19a2CbBED9967d39AA73e8",
  "MM-CGS-WCRO-LP": "0x0DD34d4Ff37D045074b6A077A289eD3163372D47",
  "MM-AGO-MMF-LP": "0x90f27486424e0cC1d98e0144576637673570C903",
  "MM-MMF-GRVE-LP": "0x16B7F0Bc8332EDBa5a1B91Ac867c3E5EfD3827e6",
  "MM-MMF-METF-LP": "0xd7385f46FFb877d8c8Fe78E5f5a7c6b2F18C05A7",
  "MM-GOAL-MMF-LP": "0xd36c36dE5D1F328BBCb9d74c55EcDa5A2Fb94e23",
  "MM-WBTC-WCRO-LP": "0x5383202D48C24aAA19873366168f2Ed558a00ff0",
  "MM-WCRO-USDC-LP": "0xa68466208F1A3Eb21650320D2520ee8eBA5ba623",
  "MM-WCRO-USDT-LP": "0xEB28c926A7Afc75fcC8d6671Acd4c4A298b38419",
  "MM-USDT-USDC-LP": "0x6F186E4BEd830D13DcE638e40bA27Fd6d91BAd0B",
  "MM-MMF-USDC-LP": "0x722f19bd9A1E5bA97b3020c6028c279d27E4293C",
  "MM-WBTC-WETH-LP": "0x0101112C7aDdb2E8197922e9cFa17cbAA935ECCc",
  "MM-USDT-MMF-LP": "0x5801d37E04ab1f266c35A277E06C9D3afA1c9cA2"
}

const farms = [
  {
    name: 'CRO-ETH',
    lpToken: LPS['CRO-ETH-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 1,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-WBTC',
    lpToken: LPS['CRO-BTC-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 2,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-USDC',
    lpToken: LPS['USDC-CRO-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 3,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-VVS',
    lpToken: LPS['CRO-VVS-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 4,
    sinceBlock: 1273155
  },
  {
    name: 'VVS-USDC',
    lpToken: LPS['USDC-VVS-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 5,
    sinceBlock: 1273155
  },
  {
    name: 'USDC-USDT',
    lpToken: LPS['USDC-USDT-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 6,
    sinceBlock: 1273155
  },
  {
    name: 'VVS-USDT',
    lpToken: LPS['USDT-VVS-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 7,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-SHIB',
    lpToken: LPS['CRO-SHIB-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 8,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-USDT',
    lpToken: LPS['USDT-CRO-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 9,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-DAI',
    lpToken: LPS['CRO-DAI-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 10,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-DOGE',
    lpToken: LPS['CRO-DOGE-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 12,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-ATOM',
    lpToken: LPS['CRO-ATOM-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 13,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-ELON',
    lpToken: LPS['CRO-ELON-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 15,
    sinceBlock: 1273155
  },
  {
    name: 'CRO-TONIC',
    lpToken: LPS['CRO-TONIC-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 16,
    sinceBlock: 1273155
  },
  {
    name: 'SINGLE-VVS',
    lpToken: LPS['VVS-SINGLE-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 17,
    sinceBlock: 1273155,
    isPool2: true,
  },
  {
    name: 'SINGLE-USDC',
    lpToken: LPS['USDC-SINGLE-LP'],
    masterChef: VVS_MASTERCHEF,
    wmasterchef: VVS_WMASTERCHEF_ADDR,
    masterchefPoolId: 18,
    sinceBlock: 1273155,
    isPool2: true,
  },


  // MMF
  {
    name: 'CRO-MMF',
    lpToken: LPS['MM-WCRO-MMF-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 1,
    sinceBlock: 2058468,
  },

  {
    name: 'SINGLE-USDC',
    lpToken: LPS['MM-SINGLE-USDC-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 22,
    sinceBlock: 2058468,
    isPool2: true,
  },

  {
    name: 'MM-USDC-DAI',
    lpToken: LPS['MM-USDC-DAI-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 11,
    sinceBlock: 2058468,
  },

  {
    name: 'MMF-USDC',
    lpToken: LPS['MM-MMF-USDC-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 7,
    sinceBlock: 2058468,
  },

  {
    name: 'WCRO-USDC',
    lpToken: LPS['MM-WCRO-USDC-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 4,
    sinceBlock: 2058468,
  },
  {
    name: 'USDT-MMF',
    lpToken: LPS['MM-USDT-MMF-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 9,
    sinceBlock: 2058468,
  },

  {
    name: 'WCRO-USDT',
    lpToken: LPS['MM-WCRO-USDT-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 5,
    sinceBlock: 2058468,
  },

  {
    name: 'MMO-WCRO',
    lpToken: LPS['MM-MMO-WCRO-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 10,
    sinceBlock: 2058468,
  },

  {
    name: 'WBTC-WCRO',
    lpToken: LPS['MM-WBTC-WCRO-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 3,
    sinceBlock: 2058468,
  },

  {
    name: 'WCRO-WETH',
    lpToken: LPS['MM-WCRO-WETH-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 2,
    sinceBlock: 2058468,
  },

  {
    name: 'MIMAS-WCRO',
    lpToken: LPS['MM-MIMAS-WCRO-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 13,
    sinceBlock: 2058468,
  },

  {
    name: 'CRK-WCRO',
    lpToken: LPS['MM-CRK-WCRO-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 16,
    sinceBlock: 2058468,
  },

  {
    name: 'CGS-WCRO',
    lpToken: LPS['MM-CGS-WCRO-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 24,
    sinceBlock: 2058468,
  },

  {
    name: 'WCRO-LIQ',
    lpToken: LPS['MM-WCRO-LIQ-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 12,
    sinceBlock: 2058468,
  },


  {
    name: 'BISON-WCRO',
    lpToken: LPS['MM-BISON-WCRO-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 14,
    sinceBlock: 2058468,
  },
  {
    name: 'MMF-CROISSANT',
    lpToken: LPS['MM-MMF-CROISSANT-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 15,
    sinceBlock: 2058468,
  },
  
  {
    name: 'CRP-MMF',
    lpToken: LPS['MM-CRP-MMF-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 17,
    sinceBlock: 2058468,
  },
  {
    name: 'USDC-DNA',
    lpToken: LPS['MM-USDC-DNA-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 18,
    sinceBlock: 2058468,
  },
  
  {
    name: 'WCRO-ANN',
    lpToken: LPS['MM-WCRO-ANN-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 20,
    sinceBlock: 2058468,
  },
  
  {
    name: 'MMF-BETIFY',
    lpToken: LPS['MM-MMF-BETIFY-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 23,
    sinceBlock: 2058468,
  },
  
  {
    name: 'AGO-MMF',
    lpToken: LPS['MM-AGO-MMF-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 25,
    sinceBlock: 2058468,
  },
  {
    name: 'MMF-GRVE',
    lpToken: LPS['MM-MMF-GRVE-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 26,
    sinceBlock: 2058468,
  },
  {
    name: 'MMF-METF',
    lpToken: LPS['MM-MMF-METF-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 27,
    sinceBlock: 2058468,
  },
  {
    name: 'GOAL-MMF',
    lpToken: LPS['MM-GOAL-MMF-LP'],
    masterChef: MMF_MASTERCHEF,
    wmasterchef: MMF_WMASTERCHEF_ADDR,
    masterchefPoolId: 28,
    sinceBlock: 2058468,
  },

];


module.exports = {
  farms,
}