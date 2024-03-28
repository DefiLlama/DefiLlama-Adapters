const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(api) {

  const VAULT_CONTRACT_ADDRESS = '0x7A5df878e195D09F1C0bbba702Cfdf0ac9d0a835'
  return api.sumTokens({ owner: VAULT_CONTRACT_ADDRESS, tokens: [
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.USDC,
    '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F', //FRAX
    ADDRESSES.arbitrum.USDC_CIRCLE,
    ADDRESSES.arbitrum.WSTETH,
    ADDRESSES.arbitrum.DAI,
    ADDRESSES.arbitrum.ARB,
    ADDRESSES.arbitrum.USDT,
    '0x9C2433dFD71096C435Be9465220BB2B189375eA7', //gm 
    '0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4',
    '0x47c031236e19d024b42f8AE6780E44A573170703',
    '0xC25cEf6061Cf5dE5eb761b50E4743c1F5D7E5407',
    '0xD9535bB5f58A1a75032416F2dFe7880C30575a41',
    '0xB686BcB112660343E6d15BDb65297e110C8311c4',
    '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8'
  ] })
}

module.exports = {
  arbitrum: { tvl },
}