const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(timestamp, block) {

  const contracts = [
    "0x91a154F9AD33da7e889C4b6fE4A9F9C3Fc6B6081",
    // "0x8fA7490cedB7207281a5ceabee12773046dE664E",
    "0xd1Ed35A3Ee043683A1833509dE8f2C1A0d8777B7",
  ];

  const tokens = [
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.USDC,
  ];
  return sumTokens2({ block, tokens, owners: contracts })
}

async function arbitrum(timestamp, _, { arbitrum: block }) {

  const contracts = [
    "0xf7ca7384cc6619866749955065f17bedd3ed80bc",
    "0x85DDE4A11cF366Fb56e05cafE2579E7119D5bC2f",
  ];

  const tokens = [
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.USDC,
    ADDRESSES.arbitrum.WBTC,
  ];
  return sumTokens2({ block, tokens, owners: contracts, chain: 'arbitrum' })
}

async function avax(timestamp, _, { avax: block }) {

  const contracts = [
    "0x9F6054971d530eb0AE2B52a788dA94E5Da2f4546",
    "0x08Ef39B0D87D91D1F3e3b3E6793a4bA13a764420",
  ];

  const tokens = [
    ADDRESSES.avax.JOE,
    ADDRESSES.avax.USDC,
    ADDRESSES.avax.WAVAX,
  ];
  return sumTokens2({ block, tokens, owners: contracts, chain: 'avax',})
}

module.exports = {
  start: '2021-01-01', // unix timestamp (utc 0) specifying when the project began, or where live data begins
  ethereum: { tvl },
  arbitrum: { tvl: arbitrum },
  avax: { tvl: avax },
};
