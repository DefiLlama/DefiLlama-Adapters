const { sumTokens2 } = require('../helper/unwrapLPs');

const vaultAddress = '0xb5F3a9dD92270f55e55B7Ac7247639953538A261';

const vaults = {
  ethereum: {
    vault: vaultAddress,
    tokens: [
      '0x0000000000000000000000000000000000000000', // ETH
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    ],
  },
  linea: {
    vault: vaultAddress,
    tokens: [
      '0x0000000000000000000000000000000000000000', // ETH
      '0xA219439258ca9da29E9Cc4cE5596924745e12B93', // USDT
      '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // USDC
      '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4', // WBTC
      '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', // WETH
    ],
  },
  polygon: {
    vault: vaultAddress,
    tokens: [
      '0x0000000000000000000000000000000000000000', // MATIC
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
      '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC (PoS)
      '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
    ],
  },
};

module.exports = {
  methodology: 'The total amount of assets locked in the Yellow Wallet.',
};

Object.keys(vaults).forEach((chain) => {
  const { vault, tokens } = vaults[chain];

  module.exports[chain] = {
    tvl: async (timestamp, ethBlock, chainBlocks) => {
      const balances = {};
      const block = chainBlocks[chain];

      await sumTokens2({
        balances,
        tokens,
        owners: [vault],
        block,
        chain,
        includeNativeTokens: true,
      });

      return balances;
    },
  };
});
