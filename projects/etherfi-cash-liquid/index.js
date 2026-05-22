const ADDRESSES = require('../helper/coreAssets.json')

const vaults = [
    '0xf0bb20865277aBd641a307eCe5Ee04E79073416C',
    '0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C',
    '0x5f46d540b6eD704C3c8789105F30E075AA900726',
    ADDRESSES.ethereum.EBTC,
    ADDRESSES.ethereum.EUSD,
]

async function tvl(api) {
    for (const vault of vaults) {
       const totalSupply = await api.call({
            target: vault,
            abi: 'function totalSupply() view returns (uint256)',
        })
        api.add(vault, totalSupply);
    }
  }
  
  module.exports = {
    misrepresentedTokens: true,
    doublecounted: true,
    optimism: {
      tvl,
    },
    scroll: {
      tvl,
    },
  };