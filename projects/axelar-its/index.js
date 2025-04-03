/*************
 * ASSETS *
 ************/

// USDX – deployed only on Ethereum (adjust as needed)
const usdx = "0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef";
const usdxCoingecko = "usdx-money-usdx";

// ATH – deployed on Ethereum and Arbitrum
const athCanonical = "0xbe0Ed4138121EcFC5c0E56B40517da27E6c5226B"; // Ethereum
const ath = "0xc87B37a581ec3257B734886d9d3a581F5A9d056c";         // Arbitrum
const athCoingecko = "aethir";

// CFG – deployed on Ethereum and Base
const cfgEth = "0xc221b7e65ffc80de234bbb6667abdd46593d34f0";
const cfgBase = "0x2b51E2Ec9551F9B87B321f63b805871f1c81ba97";
const cfgCoingecko = "wrapped-centrifuge";

// XRP – deployed on Ethereum and Kava
const xrpCanonical = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE"; // Binance
const xrp = "0x8e20A0a1B4664D1ae5d18cc48bA6FAD4d9569406";          // Kava
const xrpCoingecko = "ripple";

// BTC – deployed on Binance and Kava
const btcCanonical = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"; // Binance
const btcb = "0x94FC70EF7791EE857A1f420B9A471a55F32382be";         // Kava
const btcbCoingecko = "binance-bitcoin";

// KLIMA – deployed on Polygon and Base (note: 9 decimals)
const klimaCanonical = "0x4e78011Ce80ee02d2c3e649Fb657E45898257815"; // Polygon
const klima = "0xDCEFd8C8fCc492630B943ABcaB3429F12Ea9Fea2";         // Base
const klimaCoingecko = "klima-dao";

// KIP – deployed on Ethereum, Arbitrum, Base, and Binance
const kipCanonical = "0x946fb08103b400d1c79e07acCCDEf5cfd26cd374"; // Ethereum
const kip = "0xF63b14F5eE5574e3F337b2796Bbdf6dcfB4E2CB7";         // Arbitrum, Base, Binance
const kipCoingecko = "kip";

// PELL – deployed on Ethereum, Arbitrum, Binance, and Mantle
const pell = "0xC65d8d96cddDB31328186EFA113a460b0Af9Ec63";
const pellCoingecko = "pell-network-token";

// DOGE – deployed on Ethereum and Base
const dogeCanonical = "0x1121AcC14c63f3C872BFcA497d10926A6098AAc5"; // Ethereum
const doge = "0x67f0870BB897F5E1c369976b4A2962d527B9562c";         // Base
const dogeCoingecko = "department-of-gov-efficiency";

// AI (Any Inu) – assumed deployed on all chains (adjust if not)
const ai = "0x2598c30330D5771AE9F983979209486aE26dE875";
const anyInuCoingecko = "any-inu";

// List of chains (adjust as needed)
const chains = [
  "ethereum",
  "bsc",
  "arbitrum",
  "kava",
  "polygon",
  "moonbeam",
  "fraxtal",
  "fantom",
  "base",
  "optimism",
  "blast",
  "filecoin",
  "avax",
  "scroll",
  "celo",
  "mantle",
];

// Define tokens with explicit chain-to-address mappings
const tokens = [
  {
    coingecko: usdxCoingecko,
    decimals: 18,
    // USDX is only deployed on Ethereum in this example.
    addresses: {
      ethereum: usdx,
    },
  },
  {
    coingecko: athCoingecko,
    decimals: 18,
    addresses: {
      ethereum: athCanonical,
      arbitrum: ath,
    },
  },
  {
    coingecko: cfgCoingecko,
    decimals: 18,
    addresses: {
      ethereum: cfgEth,
      base: cfgBase,
    },
  },
  {
    coingecko: xrpCoingecko,
    decimals: 18,
    addresses: {
      binance: xrpCanonical,
      kava: xrp,
    },
  },
  {
    coingecko: btcbCoingecko,
    decimals: 18,
    addresses: {
      binance: btcCanonical,
      kava: btcb,
    },
  },
  {
    coingecko: klimaCoingecko,
    decimals: 9, 
    addresses: {
      polygon: klimaCanonical,
      base: klima,
    },
  },
  {
    coingecko: kipCoingecko,
    decimals: 18,
    addresses: {
      ethereum: kipCanonical,
      arbitrum: kip,
      base: kip,
      binance: kip,
    },
  },
  {
    coingecko: pellCoingecko,
    decimals: 18,
    addresses: {
      ethereum: pell,
      arbitrum: pell,
      binance: pell,
      mantle: pell,
    },
  },
  {
    coingecko: dogeCoingecko,
    decimals: 18,
    addresses: {
      ethereum: dogeCanonical,
      base: doge,
    },
  },
  {
    coingecko: anyInuCoingecko,
    decimals: 18,
    // If AI is deployed on all chains, use this mapping.
    addresses: chains.reduce((acc, chain) => {
      acc[chain] = ai;
      return acc;
    }, {}),
  },
];

// For each chain, export a module that calculates TVL from the tokens available on that chain.
chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      for (const token of tokens) {
        const target = token.addresses[chain];
        if (!target) continue; // Skip if token isn’t deployed on this chain
        const supply = await api.call({ abi: 'erc20:totalSupply', target, chain });
        // Divide supply by 10^decimals (e.g., 1e18 for 18 decimals, 1e9 for 9 decimals)
        api.addCGToken(token.coingecko, supply / 10 ** token.decimals);
      }
    },
  };
});
