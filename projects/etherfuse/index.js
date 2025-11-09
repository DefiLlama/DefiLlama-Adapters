const { sumTokens2 } = require('../helper/unwrapLPs');
const { getTokenSupplies } = require('../helper/solana');


const config = {
  polygon: [
    '0x834df4C1d8f51Be24322E39e4766697BE015512F', // cetes
    '0xC6221856E45ed806F8325a084bED3D69D32C526d', // eurob
    '0x46080F31351A6568f44575E3EFfDE7f0C86867f9', // gilts
    '0xd574b191B5a00262Ff19953d3CE25543AB7C8098', // tesouro
    '0xc2C1f8Eb98C0468Be0232DD4166705d0Dea3Fe31'  // ustry
  ],
  base: [
    '0x834df4C1d8f51Be24322E39e4766697BE015512F',
    '0xC6221856E45ed806F8325a084bED3D69D32C526d',
    '0x46080F31351A6568f44575E3EFfDE7f0C86867f9',
    '0x7ceE47e7B7CD04CF984e8Dd86C42595B5771A9B2',
    '0xc2C1f8Eb98C0468Be0232DD4166705d0Dea3Fe31'
  ]
}

async function solanaTVL(api) {
  const mints = [
    'CETES7CKqqKQizuSN6iWQwmTeFRjbJR6Vw2XRKfEDR8f', // cetes
    'EuroszHk1AL7fHBBsxgeGHsamUqwBpb26oEyt9BcfZ6G', // eurob
    'GiLTSeSFnNse7xQVYeKdMyckGw66AoRmyggGg1NNd4yr',  // gilts
    'BRNTNaZeTJANz9PeuD8drNbBHwGgg7ZTjiQYrFgWQ48p', // tesouro
    'USTRYnGgcHAhdWsanv8BG6vHGd4p7UGgoB9NRd8ei7j'  // ustry
  ];

  await getTokenSupplies(mints, api);  

}

module.exports = {
  solana: {
    tvl: solanaTVL,
  } 
   }

Object.keys(config).forEach(chain => {
  const assets = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: assets });
      api.add(assets, supplies);
      return sumTokens2({ api });
    }
  };
});