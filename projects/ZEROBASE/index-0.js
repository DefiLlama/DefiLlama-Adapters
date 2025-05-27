const { sumTokensExport } = require('../helper/unwrapLPs');

const chains = {
  ethereum: {
    vaults: [
      '0x9eF52D8953d184840F2c69096B7b3A7dA7093685', // Main Vault
      '0xc4A718735F0783E81FdcAA999773199C2D1498d4', // Withdrawal Vault
    ],
    tokens: [
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`, // USDC
    ],
  },
  avax: {
    vaults: [
      '0xC3e9006559cB209a987e99257986aA5Ce324F829', // Main Vault
      '0xfF60B79F86eDbce76F7e113182Cee7c64758F4FC', // Withdrawal Vault
    ],
    tokens: [
      '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT
      '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
    ],
  },
  bsc: {
    vaults: [
      '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4', // Main Vault
      '0xe2c7925b1173013a59B8573Daa3EDA6C613DeD45', // Withdrawal Vault
    ],
    tokens: [
      '0x55d398326f99059fF775485246999027B3197955', // USDT
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
    ],
  },
  arbitrum: {
    vaults: [
      '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4', // Main Vault
      '0xe2c7925b1173013a59B8573Daa3EDA6C613DeD45', // Withdrawal Vault
    ],
    tokens: [
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
    ],
  },
  polygon: {
    vaults: [
      '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4', // Main Vault
      '0xe2c7925b1173013a59B8573Daa3EDA6C613DeD45', // Withdrawal Vault
    ],
    tokens: [
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
      '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC
    ],
  },
  optimism: {
    vaults: [
      '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4', // Main Vault
      '0xe2c7925b1173013a59B8573Daa3EDA6C613DeD45', // Withdrawal Vault
    ],
    tokens: [
      '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDT
      '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // USDC
    ],
  },
  base: {
    vaults: [
      '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4', // Main Vault
      '0xe2c7925b1173013a59B8573Daa3EDA6C613DeD45', // Withdrawal Vault
    ],
    tokens: [
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    ],
  },
};

module.exports = {
  methodology: 'TVL is calculated from the USDT and USDC tokens locked in Zerobase vaults and withdrawal vaults across multiple chains.',
  ...Object.fromEntries(
    Object.entries(chains).map(([chain, { vaults, tokens }]) => [
      chain,
      {
        tvl: sumTokensExport({ owners: vaults, tokens, chain }),
      },
    ])
  ),
};
