const sdk = require('@defillama/sdk');
const { ethereum } = require('../ether-fi');

const vaults = [
    '0xf0bb20865277aBd641a307eCe5Ee04E79073416C',
    '0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C',
    '0x5f46d540b6eD704C3c8789105F30E075AA900726',
    '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642',
    '0x939778D83b46B456224A33Fb59630B11DEC56663',
]
const accountants = [
  '0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198',
  '0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7',
  '0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0',
  '0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F',
  '0xEB440B36f61Bf62E0C54C622944545f159C3B790'
]

async function getRateAndBaseAndDecimals(api, index) {
  const { timestamp } = api;
  const scroll_api = new sdk.ChainApi({ timestamp, chain: 'scroll' });
  const price = await scroll_api.call({
    target: accountants[index],
    abi: 'function getRate() view returns (uint256)',
  })
  const baseAsset = await scroll_api.call({
    target: accountants[index],
    abi: 'function base() view returns (address)',
  })
  const decimals = await scroll_api.call({
    target: baseAsset,
    abi: 'function decimals() view returns (uint256)',
  })
  return {
    rate: price,
    base: baseAsset,
    decimals: decimals,
  }
}

async function tvl(api) {
    const { timestamp } = api;
    const scroll_api = new sdk.ChainApi({ timestamp, chain: 'scroll' });
    for (const [index, vault] of vaults.entries()) {
      const { rate, base, decimals } = await getRateAndBaseAndDecimals(api, index);
      console.log(rate, base, decimals);
       const totalSupply = await scroll_api.call({
            target: vault,
            abi: 'function totalSupply() view returns (uint256)',
        })
        console.log(vault, totalSupply);
        api.add(vault, totalSupply);
    }
  }
  
  module.exports = {
    misrepresentedTokens: true,
    scroll: {
      tvl,
    },
  };