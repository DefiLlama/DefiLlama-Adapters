const sdk = require("@defillama/sdk");
const { queryContract: queryContractCosmos } = require("../helper/chain/cosmos");
const { fetchURL } = require("../helper/utils");

const NAV_API_URL = "https://nav.dev.librecapital.com/funds";

const RECEIPT_TOKENS = {
  polygon: {
    UMA: {
      address: '0xcf2Ca1B21e6f5dA7A2744f89667dE4E450791C79',
      decimals: 18,
      underlying: 'security-token',
      fundName:'USD I Money Market, a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '0xcc777c52ee9Ee5A57965a8E56F06211Fad34Fb3B',
      decimals: 18,
      underlying: 'security-token',
      fundName:'BH Master Fund Access, a sub-fund of Libre SAF VCC'
    }
  },
  injective: {
    UMA: {
      address: 'inj1eh6h6vllrvtl6qyq77cv5uwy0hw6e6d8jy4pxy',
      decimals: 18,
      underlying: 'security-token',
      fundName:'USD I Money Market, a sub-fund of Libre SAF VCC'
    }
  }
}

async function getFundPrices() {
  const { data: navData } = await fetchURL(NAV_API_URL);
  const priceMap = {};
  navData.forEach(fund => {
    priceMap[fund.fundName] = fund.priceLocal;
  });
  return priceMap;
}

async function polygonTvl({ polygon: block137 }) {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();
  
  // Get total supply of both receipt tokens
  const supplies = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: Object.values(RECEIPT_TOKENS.polygon).map(i => ({ target: i.address })),
    chain: 'polygon',
    block: block137,
  })


  // Map each token's total supply to represent RWA TVL
  supplies.output.forEach((supply, i) => {
    const token = Object.values(RECEIPT_TOKENS.polygon)[i]
    const balance = supply.output;
    const price = fundPrices[token.fundName] || 1;

    // Convert balance to human readable and multiply by price
    const adjustedBalance = Number(balance) / (10 ** token.decimals);
    const valueUSD = adjustedBalance * price;
    
    totalTvl += valueUSD;
  })

  // Return the total value in the format DeFiLlama expects
  balances['usd-coin'] = totalTvl;
  return balances;
}

async function injectiveTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();
  
  // Query total supply from Injective contract
  const supply = await queryContractCosmos({
    contract: RECEIPT_TOKENS.injective.UMA.address,
    chain: 'injective',
    data: {
      token_info: {}
    }
  })

  if (supply?.total_supply) {
    const token = RECEIPT_TOKENS.injective.UMA;
    const balance = supply.total_supply;
    const price = fundPrices[token.fundName] || 1;

    // Convert balance to human readable and multiply by price
    const adjustedBalance = Number(balance) / (10 ** token.decimals);
    const valueUSD = adjustedBalance * price;
    
    totalTvl += valueUSD;
  }

  // Return the total value in the format DeFiLlama expects
  balances['usd-coin'] = totalTvl;
  return balances;
}

module.exports = {
  methodology: "TVL represents the total value of institutional funds represented by UMA, BHMA and UMA receipt tokens on Polygon and Injective. The value is calculated by multiplying the total supply of receipt tokens by their respective NAV prices, denominated in their underlying stablecoin value",
  polygon: { tvl: polygonTvl },
  injective: { tvl: injectiveTvl }
}