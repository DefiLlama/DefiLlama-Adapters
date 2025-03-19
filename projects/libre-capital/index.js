const sdk = require("@defillama/sdk");
const { queryContract: queryContractCosmos } = require("../helper/chain/cosmos");
const sui = require("../helper/chain/sui");
const { call } = require('../helper/chain/near')
const { Connection, PublicKey } = require('@solana/web3.js');
const {  getResource } = require("../helper/chain/aptos");

const NAV_CONTRACT = "0x0f29d042bb26a200b2a507b752e51dbbc05bf2f6";
const NAV_ABI = "function getLatestNAV(bytes32 _instrumentId) view returns (uint256 navPerShare, string legalDocumentCID, uint256 timestamp)"

const RECEIPT_TOKENS = {
  ethereum: {
    UMA: {
      address: '0xcf2Ca1B21e6f5dA7A2744f89667dE4E450791C79',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '0xcc777c52ee9Ee5A57965a8E56F06211Fad34Fb3B',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    BHMB: {
      address: '0x1b62F1B8b04736e8F9ECc8eEaE8B7D5957c74d5d',
      decimals: 18,
      underlying: 'security-token',     
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    BHMC: {
      address: '0xC1Cd4CCd9E74be61EDdd5C06f962657Bd5D57aF3',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    HLSPC: {
      address: '0xe5631cCF95350948Ba2D4d8c815c05AFBfb47A9F',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3636633433643637363564313665353638356639333338340000000000000000",
      fundName: 'Libre SAF VCC - HL Scope Private Credit Access A'
    }
  },
  polygon: {
    UMA: {
      address: '0xcf2Ca1B21e6f5dA7A2744f89667dE4E450791C79',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '0xcc777c52ee9Ee5A57965a8E56F06211Fad34Fb3B',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    BHMB: {
      address: '0x1b62F1B8b04736e8F9ECc8eEaE8B7D5957c74d5d',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    BHMC: {
      address: '0xC1Cd4CCd9E74be61EDdd5C06f962657Bd5D57aF3',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    HLSPC: {
      address: '0xe5631cCF95350948Ba2D4d8c815c05AFBfb47A9F',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3636633433643637363564313665353638356639333338340000000000000000",
      fundName: 'Libre SAF VCC - HL Scope Private Credit Access A'
    }
  },
  avalanche: {
    UMA: {
      address: '0xcf2Ca1B21e6f5dA7A2744f89667dE4E450791C79',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '0xcc777c52ee9Ee5A57965a8E56F06211Fad34Fb3B',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    APCA: {
      address: '0x1b62F1B8b04736e8F9ECc8eEaE8B7D5957c74d5d',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3636653765336666346534363764313238323964396366340000000000000000",
      fundName:'Libre SAF VCC - Access Private Credit Feeder'
    },
    LDCFA: {
      address: '0xcf2Ca1B21e6f5dA7A2744f89667dE4E450791C79',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'Libre SAF VCC - Laser Digital Carry Fund A'
    },
    LDCFB: {
      address: '0xbee4274F1c5EE0B30fC5AAa7842A434C35BF6f7b',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'Libre SAF VCC - Laser Digital Carry Fund B'
    },
  },
  injective: {
    UMA: {
      address: 'inj1eh6h6vllrvtl6qyq77cv5uwy0hw6e6d8jy4pxy',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    HLSPC: {
      address: 'inj14h6vrgxfshwp30tjne6xw74la6730mf7wy2j3n',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3636633433643637363564313665353638356639333338340000000000000000",
      fundName: 'Libre SAF VCC - HL Scope Private Credit Access A'
    },
    APCA: {
      address: 'inj1f5zrhkq02fahllqf6g2e37d4aeqfsp63z74t4l',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3636653765336666346534363764313238323964396366340000000000000000",
      fundName: 'Libre SAF VCC - Access Private Credit Feeder'
    },
    LDCFA: {
      address: 'inj1qrmw646zfqlq9xxqd5zrvw4yqevxah263l4z27',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3637313739666237366165623037313161373136386634300000000000000000",
      fundName: 'Libre SAF VCC - Laser Digital Carry Fund A'
    },
    LDCFB: {
      address: 'inj1kxucwmm5wc640xl0vswf04a0naxm0m9anmzc76',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3637313761303239366165623037313161373136386634310000000000000000",
      fundName: 'Libre SAF VCC - Laser Digital Carry Fund B'
    }
  },
  sui: {
    UMA: {
      address: '0xf98b6567fbd8e10403a05c4c3ac2a2c384b8f7cd7430756d23b0021ae28d1398',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '0x5cc264ed730baef1315f36b3ad563798aee6febdcd8bee83f580c0d076e06345',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    LDCFA: {
      address: '0xedbdf3711daa627a47c98e17daf0489802d01fcecb0c9b3774e55792db7833e1',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3637313739666237366165623037313161373136386634300000000000000000",
      fundName: 'Libre SAF VCC - Laser Digital Carry Fund A'
    },
    HLSPC: {
      address: '0x8e92364602f481d1824700d220c30dc096008e82fc0353f6f42f7358ed0c3f41',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636633433643637363564313665353638356639333338340000000000000000",
      fundName: 'Libre SAF VCC - HL Scope Private Credit Access A'
    }
  },
  solana: {
    UMA: {
      address: '5d3zUSzje2saHwgzwJwFE8SDR8S5sGpE9wHhXdsCfu7j',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '93qLFcpdpMeSdhsw2SnkBehUvMi8UX9idHpV6ZvNuP8e',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    BHMB: {
      address: '4VXQrtXmNoRoETY7S6uL8NwwGx15UXJ1FU8Q1wgCHjG6',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    BHMC: {
      address: '562Cd8zkXyWJ5ixwY3dKJMRzqToCi2upc12DbyjZ1UwG',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    HLSPC: {
      address: '2hzQ4sexbsJsSmp1s6gQCKJDmtAx3WnQ3pLZmDJBWpFC',
      decimals: 9,
      underlying: 'security-token',
      instrumentId:"0x3636633433643637363564313665353638356639333338340000000000000000",
      fundName: 'Libre SAF VCC - HL Scope Private Credit Access A'
    }
  },
  near: {
    UMA: {
      address: 'libre_instrument_1.near',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: 'libre_instrument_0.near',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    BHMB: {
      address: 'libre_instrument_3.near',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    BHMC: {
      address: 'libre_instrument_4.near',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    HLSPC: {
      address: 'libre_instrument_2.near',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3636633433643637363564313665353638356639333338340000000000000000",
      fundName: 'Libre SAF VCC - HL Scope Private Credit Access A'
    }
  },
  aptos: {
    UMA: {
      address: '0xb78860ec33dd1343a723bbaae7ba9fc858ca59ecb936cab8ab3ee7f35aae7502',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '0xabd58a12ca7f20dd397787bd87b674cc2f8cd7168718d5b7a71daa5d89836079',
      decimals: 9,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName: ' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    HLSPC: {
      address: '0x7647a37bb1ee1f42953ca4a00f1cf347254d38a2aa31d2e37176bbb94c14cf75',
      decimals: 9,
      underlying: 'security-token',
      instrumentId:"0x3636633433643637363564313665353638356639333338340000000000000000",
      fundName: 'Libre SAF VCC - HL Scope Private Credit Access A'
    }
  },
  mantra: {
    APCA: {
      address: 'mantra1vguuxez2h5ekltfj9gjd62fs5k4rl2zy5hfrncasykzw08rezpfsjx4gjx',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3636653765336666346534363764313238323964396366340000000000000000",
      fundName:'Libre SAF VCC - Access Private Credit Feeder'
    },
    LDCFA: {
      address: 'mantra1rl8su3hadqqq2v86lscpuklsh2mh84cxqvjdew4jt9yd07dzekyq7vvhrd',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3637313739666237366165623037313161373136386634300000000000000000",
      fundName: 'Libre SAF VCC - Laser Digital Carry Fund A'
    },
    LDCFB: {
      address: 'mantra1vhjnzk9ly03dugffvzfcwgry4dgc8x0sv0nqqtfxj3ajn7rn5ghqjerqcd',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3637313761303239366165623037313161373136386634310000000000000000",
      fundName: 'Libre SAF VCC - Laser Digital Carry Fund B'
    }
  },
  imx: {
    UMA: {
      address: '0xcf2Ca1B21e6f5dA7A2744f89667dE4E450791C79',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343936306633613839373337393633303932640000000000000000",
      fundName:'USD I Money Market a sub-fund of Libre SAF VCC'
    },
    BHMA: {
      address: '0x8b37F32749CF339f39bCf5cfF2c880D342ddF64B',
      decimals: 18,
      underlying: 'security-token',
      instrumentId: "0x3636313431343633306633613839373337393633303932630000000000000000",
      fundName:' BH Master Fund Access a sub-fund of Libre SAF VCC'
    },
    APCA: {
      address: '0x1b62F1B8b04736e8F9ECc8eEaE8B7D5957c74d5d',
      decimals: 18,
      underlying: 'security-token',
      instrumentId:"0x3636653765336666346534363764313238323964396366340000000000000000",
      fundName:'Libre SAF VCC - Access Private Credit Feeder'
    }
  },
}

async function getFundPrices() {
  const priceMap = {};
  const uniqueInstrumentID= [...new Set(
    Object.values(RECEIPT_TOKENS).flatMap(tokens => 
      Object.values(tokens).map(token => token.instrumentId)
    )
  )];

  const navCalls = uniqueInstrumentID.map(instrumentId => ({
    target: NAV_CONTRACT,
    params: [instrumentId]
  }));

  const navResults = await sdk.api.abi.multiCall({
    abi: NAV_ABI,
    calls: navCalls,
    chain: 'optimism'
  });

  navResults.output.forEach((result, i) => {
    if (result.success) {
      // navPerShare is in the first position of the returned tuple
      priceMap[uniqueInstrumentID[i]] = Number(result.output[0]) / 1e6; // Assuming 18 decimals for NAV
    }
  });

  return priceMap;
}

async function ethTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();

  // Query total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.ethereum)) {
    const balance = await sdk.api.erc20.totalSupply({
      target: token.address,
    });

    if (balance?.output) {
      const price = fundPrices[token.instrumentId] || 1;
      const adjustedBalance = Number(balance.output) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      totalTvl += valueUSD;
    }
  }

  balances['usd-coin'] = totalTvl;
  return balances;
}

async function polygonTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();

  // Query total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.polygon)) {
    const balance = await sdk.api.erc20.totalSupply({
      target: token.address,
      chain: 'polygon'
    });

    if (balance?.output) {
      const price = fundPrices[token.instrumentId] || 1;
      const adjustedBalance = Number(balance.output) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      totalTvl += valueUSD;
    }
  }

  balances['usd-coin'] = totalTvl;
  return balances;
}

async function mantraTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();

  // Query total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.mantra)) {
    const supply = await queryContractCosmos({
      contract: token.address,
      chain: 'mantra',
      data: {
        token_info: {}
      }
    });

    if (supply?.total_supply) {
      const price = fundPrices[token.instrumentId] || 1;
      const adjustedBalance = Number(supply.total_supply) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      totalTvl += valueUSD;
    }
  }

  balances['usd-coin'] = totalTvl;
  return balances;
}

async function suiTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();

  // Query total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.sui)) {
    const receiptTokenObject = await sui.getObject(token.address);
    if (receiptTokenObject?.fields?.balance) {
      const balance = receiptTokenObject.fields.balance;
      const price = fundPrices[token.instrumentId] || 1;
      const adjustedBalance = Number(balance) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      totalTvl += valueUSD;
    }
  }

  balances['usd-coin'] = totalTvl;
  return balances;
}

async function imxTvl({ imx: block }) {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();

  // Get total supply of receipt tokens
  const supplies = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: Object.values(RECEIPT_TOKENS.imx).map(i => ({ target: i.address })),
    chain: 'imx',
    block
  });

  // Map each token's total supply to represent RWA TVL
  supplies.output.forEach((supply, i) => {
    if (supply?.output) {
      const token = Object.values(RECEIPT_TOKENS.imx)[i];
      const price = fundPrices[token.instrumentId] || 1;
      const adjustedBalance = Number(supply.output) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      totalTvl += valueUSD;
    }
  });

  balances['usd-coin'] = totalTvl;
  return balances;
}

async function avaxTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();

  // Query total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.avalanche)) {
    const balance = await sdk.api.erc20.totalSupply({
      target: token.address,
      chain: 'avax'
    });

    if (balance?.output) {
      const price = fundPrices[token.instrumentId] || 1;
      const adjustedBalance = Number(balance.output) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      totalTvl += valueUSD;
    }
  }

  balances['usd-coin'] = totalTvl;
  return balances;
}

async function injectiveTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();

  // Query total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.injective)) {
    const supply = await queryContractCosmos({
      contract: token.address,
      chain: 'injective',
      data: {
        token_info: {}
      }
    });

    if (supply?.total_supply) {
      const balance = supply.total_supply;
      const price = fundPrices[token.instrumentId] || 1;

      // Convert balance to human readable and multiply by price
      const adjustedBalance = Number(balance) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      
      totalTvl += valueUSD;
    }
  }

  // Return the total value in the format DeFiLlama expects
  balances['usd-coin'] = totalTvl;
  return balances;
}

async function solanaTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  // Query total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.solana)) {
    const tokenPubkey = new PublicKey(token.address);
    const supply = await connection.getTokenSupply(tokenPubkey);
      
    if (supply?.value?.amount) {
      const balance = supply.value.amount;
      const price = fundPrices[token.instrumentId] || 1;

      // Convert balance to human readable and multiply by price
      const adjustedBalance = Number(balance) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      
      totalTvl += valueUSD;
    }
  }

  // Return the total value in the format DeFiLlama expects
  balances['usd-coin'] = totalTvl;
  return balances;
}

async function nearTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();

  // Query total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.near)) {
    const supply = await call(token.address, 'ft_total_supply', {});

    if (supply) {
      const balance = supply;
      const price = fundPrices[token.instrumentId] || 1;

      // Convert balance to human readable and multiply by price
      const adjustedBalance = Number(balance) / (10 ** token.decimals);
      const valueUSD = adjustedBalance * price;
      
      totalTvl += valueUSD;
    }
  }

  // Return the total value in the format DeFiLlama expects
  balances['usd-coin'] = totalTvl;
  return balances;
}

async function aptosTvl() {
  const balances = {}
  let totalTvl = 0;
  const fundPrices = await getFundPrices();
  
  // Get total supply for each token
  for (const token of Object.values(RECEIPT_TOKENS.aptos)) {
    // Get the concurrent supply
    const supply = await getResource(token.address, '0x1::fungible_asset::ConcurrentSupply');

    if (!supply) continue;

    // Get total supply and price
    const totalSupply = supply.current.value || '0';
    const price = fundPrices[token.instrumentId] || 1;
    
    // Convert supply to human readable and multiply by price
    const adjustedSupply = Number(totalSupply) / (10 ** token.decimals);
    const valueUSD = adjustedSupply * price;
    
    totalTvl += valueUSD;
  }

  balances['usd-coin'] = totalTvl;
  return balances;
}

module.exports = {
  methodology: "TVL represents the total value of institutional funds including 'USD I Money Market', 'BH Master Fund Access', 'Laser Carry', 'Hamilton Lane' and 'Access Private Credit Feeder' sub-funds of Libre SAF VCC. These funds are accessible through receipt tokens deployed across multiple blockchains including Ethereum, Polygon, Aptos, Solana, Near, Sui, Injective, Mantra, Immutable X, and Avalanche. The value is calculated by multiplying the total supply of receipt tokens by their respective NAV prices, denominated in their underlying stablecoin value",
  ethereum: { tvl: ethTvl },
  polygon: { tvl: polygonTvl },
  injective: { tvl: injectiveTvl },
  sui: { tvl: suiTvl },
  solana: { tvl: solanaTvl },
  near: { tvl: nearTvl },
  mantra: { tvl: mantraTvl },
  imx: { tvl: imxTvl },
  avax: { tvl: avaxTvl },
  aptos: { tvl: aptosTvl },
}
