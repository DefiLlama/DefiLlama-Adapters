const sdk = require("@defillama/sdk");
const { queryContract: queryContractCosmos } = require("../helper/chain/cosmos");
const sui = require("../helper/chain/sui");
const { sumTokens2 } = require('../helper/solana');
const { sumTokens } = require('../helper/chain/near');

const NAV_CONTRACT = "0xBdbF06d1831c290d06CD353db5eDf915178AF277";
const NAV_ABI = {
  "inputs": [{"internalType": "string","name": "_instrumentName","type": "string"}],
  "name": "getLatestNAV",
  "outputs": [
    {"internalType": "uint256","name": "navPerShare","type": "uint256"},
    {"internalType": "bytes32","name": "legalDocumentHash","type": "bytes32"}
  ],
  "stateMutability": "view",
  "type": "function"
};

const RECEIPT_TOKENS = {
  ethereum: {
    UMA: {
      address: '0xcf2Ca1B21e6f5dA7A2744f89667dE4E450791C79',
      decimals: 18,
      underlying: 'security-token',
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    }
  },
  polygon: {
    UMA: {
      address: '0xcf2Ca1B21e6f5dA7A2744f89667dE4E450791C79',
      decimals: 18,
      underlying: 'security-token',
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '0xcc777c52ee9Ee5A57965a8E56F06211Fad34Fb3B',
      decimals: 18,
      underlying: 'security-token',
      fundName:' BH Master Fund Access a sub-fund of Libre SAF VCC'
    }
  },
  injective: {
    UMA: {
      address: 'inj1eh6h6vllrvtl6qyq77cv5uwy0hw6e6d8jy4pxy',
      decimals: 18,
      underlying: 'security-token',
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    }
  },
  sui: {
    UMA: {
      address: '0xf98b6567fbd8e10403a05c4c3ac2a2c384b8f7cd7430756d23b0021ae28d1398',
      decimals: 9,
      underlying: 'security-token',
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    }
  },
  solana: {
    UMA: {
      address: '5d3zUSzje2saHwgzwJwFE8SDR8S5sGpE9wHhXdsCfu7j',
      decimals: 9,
      underlying: 'security-token',
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    }
  },
  near: {
    UMA: {
      address: 'libre_instrument_1.near',
      decimals: 18,
      underlying: 'security-token',
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    }
  },
  aptos: {
    UMA: {
      address: '0x8e6c1961e911cc7f1fa3d1dc821b199f0cf90c569c7feece76ee7ed1386d257c',
      decimals: 8,
      underlying: 'security-token',
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    }
  },
  mantra: {
    APCA: {
      address: 'mantra1vguuxez2h5ekltfj9gjd62fs5k4rl2zy5hfrncasykzw08rezpfsjx4gjx',
      decimals: 18,
      underlying: 'security-token',
      fundName:'Libre SAF VCC - Access Private Credit Feeder'
    }
  }
}

async function getFundPrices() {
  const priceMap = {};
  const uniqueFundNames = [...new Set(
    Object.values(RECEIPT_TOKENS).flatMap(tokens => 
      Object.values(tokens).map(token => token.fundName)
    )
  )];

  const navCalls = uniqueFundNames.map(fundName => ({
    target: NAV_CONTRACT,
    params: [fundName]
  }));

  const navResults = await sdk.api.abi.multiCall({
    abi: NAV_ABI,
    calls: navCalls,
    chain: 'optimism'
  });

  navResults.output.forEach((result, i) => {
    if (result.success) {
      // navPerShare is in the first position of the returned tuple
      priceMap[uniqueFundNames[i]] = Number(result.output[0]) / 1e6; // Assuming 18 decimals for NAV
    }
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

async function suiTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();
  
  // Query total supply from Sui contract
  const receiptTokenObject = await sui.getObject( RECEIPT_TOKENS.sui.UMA.address);

  if (receiptTokenObject?.fields?.balance) {
    const token = RECEIPT_TOKENS.sui.UMA;
    const balance = receiptTokenObject.fields.balance;
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

async function solanaTvl() {
  const balances = {}
  const fundPrices = await getFundPrices();
  
  const token = RECEIPT_TOKENS.solana.UMA;
  const owner = '9WNzeX4ygMpgbFzA36nuAHgqGmn4CKGtPNjQhJBcVf2j';
  
  const solanaBalances = await sumTokens2({ 
    tokens: [token.address],
    owners: [owner],
  });

  // Get the balance and apply NAV price
  Object.entries(solanaBalances).forEach(([tokenAddress, balance]) => {
    const price = fundPrices[token.fundName] || 1;
    const adjustedBalance = Number(balance) / (10 ** token.decimals);
    const valueUSD = adjustedBalance * price;
    balances['usd-coin'] = valueUSD;
  });

  return balances;
}

async function nearTvl() {
  const balances = {}
  const fundPrices = await getFundPrices();
  
  const token = RECEIPT_TOKENS.near.UMA;
  const owner = 'libre_investor_0.near';
  
  const nearBalances = await sumTokens({ 
    tokens: [token.address], 
    owners: [owner],
  });

  // Get the balance and apply NAV price
  Object.entries(nearBalances).forEach(([tokenAddress, balance]) => {
    const price = fundPrices[token.fundName] || 1;
    const adjustedBalance = Number(balance) / (10 ** token.decimals);
    const valueUSD = adjustedBalance * price;
    balances['usd-coin'] = valueUSD;
  });

  return balances;
}

async function ethereumTvl(timestamp, block) {
  const balances = {}
  const fundPrices = await getFundPrices();
  
  // Get total supply of the receipt token
  const supplies = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: Object.values(RECEIPT_TOKENS.ethereum).map(i => ({ target: i.address })),
    chain: 'ethereum',
    block,
  })

  // Map token's total supply to represent RWA TVL
  supplies.output.forEach((supply, i) => {
    const token = Object.values(RECEIPT_TOKENS.ethereum)[i]
    const balance = supply.output;
    const price = fundPrices[token.fundName] || 1;

    // Convert balance to human readable and multiply by price
    const adjustedBalance = Number(balance) / (10 ** token.decimals);
    const valueUSD = adjustedBalance * price;
    
    balances['usd-coin'] = valueUSD;
  })

  return balances;
}

async function mantraTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();
  
  // Query total supply from Mantra contract
  const supply = await queryContractCosmos({
    contract: RECEIPT_TOKENS.mantra.APCA.address,
    chain: 'mantra',
    data: {
      token_info: {}
    }
  })

  if (supply?.total_supply) {
    const token = RECEIPT_TOKENS.mantra.APCA;
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
  methodology: "TVL represents the total value of institutional funds represented by UMA, BHMA and UMA receipt tokens on Ethereum, Polygon, Injective, Sui, Solana, NEAR and Mantra. The value is calculated by multiplying the total supply of receipt tokens by their respective NAV prices, denominated in their underlying stablecoin value",
  ethereum: { tvl: ethereumTvl },
  polygon: { tvl: polygonTvl },
  injective: { tvl: injectiveTvl },
  sui: { tvl: suiTvl },
  solana: { tvl: solanaTvl },
  near: { tvl: nearTvl },
  mantra: { tvl: mantraTvl },
}
