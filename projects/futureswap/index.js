const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(timestamp, block) {

  const contracts = [
    "0x91a154F9AD33da7e889C4b6fE4A9F9C3Fc6B6081",
    // "0x8fA7490cedB7207281a5ceabee12773046dE664E",
    "0xd1Ed35A3Ee043683A1833509dE8f2C1A0d8777B7",
  ];

  const tokens = [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  ];
  return sumTokens2({ block, tokens, owners: contracts })
}

async function arbitrum(timestamp, _, { arbitrum: block }) {

  const contracts = [
    "0xf7ca7384cc6619866749955065f17bedd3ed80bc",
    "0x85DDE4A11cF366Fb56e05cafE2579E7119D5bC2f",
  ];

  const tokens = [
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
  ];
  return sumTokens2({ block, tokens, owners: contracts, chain: 'arbitrum' })
}

async function avax(timestamp, _, { avax: block }) {

  const contracts = [
    "0x9F6054971d530eb0AE2B52a788dA94E5Da2f4546",
    "0x08Ef39B0D87D91D1F3e3b3E6793a4bA13a764420",
  ];

  const tokens = [
    '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  ];
  return sumTokens2({ block, tokens, owners: contracts, chain: 'avax',})
}

module.exports = {
  start: 1609459200, // unix timestamp (utc 0) specifying when the project began, or where live data begins
  ethereum: { tvl },
  arbitrum: { tvl: arbitrum },
  avax: { tvl: avax },
};
