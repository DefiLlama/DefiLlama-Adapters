const abi = require('./abi.json');
const { getTokenSupplies } = require('../helper/solana');
const { getResource } = require('../helper/chain/aptos');

// BUIDL token addresses for different chains
const BUIDL_ADDRESSES = {
  ethereum: {
    tokens: [
      {
        address: '0x7712c34205737192402172409a8F7ccef8aA2AEc', // Main BUIDL
        priceFeed: '0xb9BD795BB71012c0F3cd1D9c9A4c686F2d3524A4',
      },
      {
        address: '0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041', // Institutional BUIDL
        priceFeed: '0xf2db7b3455077Fb177215d45D62d441DF3C17bf3',
      },
    ],
  },
  avax: {
    token: '0x53FC82f14F009009b440a706e31c9021E1196A2F',
    priceFeed: '0xB89Cc2Ce1CaD0d26Fed6794C1f4cF4b28684624A'
  },
  polygon: {
    token: '0x2893Ef551B6dD69F661Ac00F11D93E5Dc5Dc0e99',
    priceFeed: '0xb81131B6368b3F0a83af09dB4E39Ac23DA96C2Db'
  },
  aptos: {
    token: '0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89',
    priceFeed: null // Add price feed address when available
  },
  solana: {
    token: 'GyWgeqpy5GueU2YbkE8xqUeVEokCMMCEeUrfbtMw6phr',
    priceFeed: 'REDSTBDUecGjwXd6YGPzHSvEUBHQqVRfCcjUVgPiHsr'
  },
  optimism: {
    token: '0xa1CDAb15bBA75a80dF4089CaFbA013e376957cF5',
    priceFeed: '0xb81131B6368b3F0a83af09dB4E39Ac23DA96C2Db'
  },
  arbitrum: {
    token: '0xA6525Ae43eDCd03dC08E775774dCAbd3bb925872',
    priceFeed: '0xa8a94Da411425634e3Ed6C331a32ab4fd774aa43'
  }
};

// Always fetch price from Ethereum, regardless of current chain
// Price will be the same for BUIDL classes (Stable at 1 USD), yield values will be different per chain / token so this is acceptable
async function getEthPriceFeed() {
  try {
    const priceData = await global.api.call({
      abi: abi.latestRoundData,
      target: BUIDL_ADDRESSES.ethereum.tokens[0].priceFeed,
      chain: 'ethereum',
    });
    const priceDecimals = await global.api.call({
      abi: abi.priceDecimals,
      target: BUIDL_ADDRESSES.ethereum.tokens[0].priceFeed,
      chain: 'ethereum',
    });
    return { price: priceData.answer, priceDecimals };
  } catch (error) {
    // If the price feed is not available, use a default price of 1 USD
    return { price: 100000000, priceDecimals: 8 };
  }
}

async function tvl(api) {
  const { chain } = api
  const cfg = BUIDL_ADDRESSES[chain]
  if (!cfg) return api.getBalances()

  // Ethereum → multiple ERC20s
  if (chain === 'ethereum') {
    const supplies = await api.multiCall({
      abi: abi.totalSupply,
      calls: cfg.tokens.map(t => ({ target: t.address })),
    })
    cfg.tokens.forEach((t, i) => api.add(t.address, supplies[i]))
    return api.getBalances()
  }

  // Solana → use helper
  if (chain === 'solana') {
    await getTokenSupplies([cfg.token], { api })
    return api.getBalances()
  }

  // Aptos → query resource
  if (chain === 'aptos') {
    try {
      const res = await getResource(cfg.token, '0x1::fungible_asset::ConcurrentSupply', 'aptos')
      api.add(cfg.token, res.current.value)
    } catch (e) {
      console.log(`Aptos: Could not fetch resource for ${cfg.token}: ${e.message}`)
    }
    return api.getBalances()
  }

  // Default EVM (single token)
  const totalSupply = await api.call({ abi: abi.totalSupply, target: cfg.token })
  api.add(cfg.token, totalSupply)

  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL is the sum of total supplies of BUIDL tokens across chains. Ethereum aggregates both the retail and institutional ERC20 contracts. TVL is calculated using the price feed from the Ethereum price feed contract and applied to all chains multiplied by the total supply.',
  ethereum: { tvl },
  avax: { tvl },
  polygon: { tvl },
  optimism: { tvl },
  arbitrum: { tvl },
  aptos: { tvl },
  solana: { tvl },
}