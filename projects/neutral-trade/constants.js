const ADDRESSES = require('../helper/coreAssets.json');
const DRIFT_PROGRAM_ID = 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH';
const DRIFT_VAULT_PROGRAM_ID = 'vAuLTsyrvSfZRuRB3XgvkPwNGgYSs9YRYymVebLKoxR';

const START_TIMESTAMP = 1730419200; // 2024-11-01

const VAULTS_REGISTRY_URL = 'https://cdn.jsdelivr.net/gh/neutral-trade/sdk@main/src/registry/vaults.json';

const TOKENS = {
  USDC: {
    name: 'USDC',
    mint: ADDRESSES.solana.USDC,
    decimals: 6
  },
  USDT: {
    name: 'USDT',
    mint: ADDRESSES.solana.USDT,
    decimals: 6
  },
  SOL: {
    name: 'SOL',
    mint: ADDRESSES.solana.SOL,
    decimals: 9
  },
  WBTC: {
    name: 'Wrapped BTC (Wormhole) (WBTC)',
    mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    decimals: 8
  },
  WETH: {
    name: 'Wrapped ETH (Wormhole) (WETH)',
    mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    decimals: 8
  },
  JLP: {
    name: 'Jupiter Perps LP',
    mint: '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4',
    decimals: 6
  },
};

const KAMINO_VAULTS = [
  // { // disabled to avoid double counting
  //   name: "USDC Max Yield",
  //   address: "67dqmR76uAbjX6e81A1ganKv3ou31WUMEdeWJkwVfeXy",
  //   token: TOKENS.USDC,
  // },
];

const HYPERLIQUID_VAULTS = [
  {
    name: "The Big Short",
    address: "0xb2246d6f3ddeeca74cfd29dc3cce05c1746fcd68",
    token: TOKENS.USDC,
  },
  {
    name: "HYPE / SOL Pairs Trade",
    address: "0xaae8a508a5e39c134a4d6a49d7dce82a17f84651",
    token: TOKENS.USDC,
  },
  {
    name: "Alt Dominance",
    address: "0xb03715bec4514ae7d338fcd85053ca227a1fb823",
    token: TOKENS.USDC,
  },
  {
    name: "BTC Dominance",
    address: "0x799e0112977c37f8d93a768cf5a2305bdd3ae6f9",
    token: TOKENS.USDC,
  },
];

const NT_VAULT_PROGRAM_ID = "BUNDDh4P5XviMm1f3gCvnq2qKx6TGosAGnoUK12e7cXU";

module.exports = {
  START_TIMESTAMP,
  DRIFT_PROGRAM_ID,
  DRIFT_VAULT_PROGRAM_ID,
  TOKENS,
  VAULTS_REGISTRY_URL,
  KAMINO_VAULTS,
  HYPERLIQUID_VAULTS,
  NT_VAULT_PROGRAM_ID,
};
