const VAULTS = {
  STREAMUSD: {
    address: "0xE2Fc85BfB48C4cF147921fBE110cf92Ef9f26F94",
    decimals: 6,
    asset: 'USDC'
  },
  STREAMBTC: {
    address: "0x12fd502e2052CaFB41eccC5B596023d9978057d6",
    decimals: 8,
    asset: 'WBTC'
  },
  STREAMETH: {
    address: "0x7E586fBaF3084C0be7aB5C82C04FfD7592723153",
    decimals: 18,
    asset: 'WETH'
  }
};

const CHAINS = {
  ethereum: {
    tokens: {
      USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
      WBTC: { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
      WETH: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 }
    },
    ofts: {
      STREAMUSD: "0x6eAf19b2FC24552925dB245F9Ff613157a7dbb4C",
      STREAMBTC: "0x05F47d7CbB0F3d7f988E442E8C1401685D2CAbE0",
      STREAMETH: "0xF70f54cEFdCd3C8f011865685FF49FB80A386a34"
    }
  },
  sonic: {
    tokens: {
      USDC: { address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894', decimals: 6 },
      WBTC: { address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', decimals: 8 },
      WETH: { address: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b', decimals: 18 }
    },
    ofts: {
      STREAMUSD: "0x6202B9f02E30E5e1c62Cc01E4305450E5d83b926",
      STREAMBTC: "0xB88fF15ae5f82c791e637b27337909BcF8065270",
      STREAMETH: "0x16af6b1315471Dc306D47e9CcEfEd6e5996285B6"
    }
  },
  berachain: {
    tokens: {
      USDC: { address: '0x549943e04f40284185054145c6E4e9568C1D3241', decimals: 6 },
      WBTC: { address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', decimals: 8 },
      WETH: { address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590', decimals: 18 }
    },
    ofts: {
      STREAMUSD: "0x6eAf19b2FC24552925dB245F9Ff613157a7dbb4C",
      STREAMBTC: "0xa791082be08B890792c558F1292Ac4a2Dad21920",
      STREAMETH: "0x94f9bB5c972285728DCee7EAece48BeC2fF341ce"
    }
  },
  base: {
    tokens: {
      USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
      WBTC: { address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', decimals: 8 },
      WETH: { address: '0x4200000000000000000000000000000000000006', decimals: 18 }
    },
    ofts: {
      STREAMUSD: "0xa791082be08B890792c558F1292Ac4a2Dad21920",
      STREAMBTC: "0x09Aed31D66903C8295129aebCBc45a32E9244a1f",
      STREAMETH: "0x6202B9f02E30E5e1c62Cc01E4305450E5d83b926"
    }
  }
};

module.exports = { VAULTS, CHAINS };
