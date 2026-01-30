const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')

async function tvl(api) {
  const allTokensAndOwners = [
    ['mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'CMBwsHiUnih1VAzENzoNKTq8tyRaCpD2zBgBUm47sN6h'],
    [ADDRESSES.solana.JupSOL, '9HGpvmW1Lv2pqKkbM41pGm7ApMjgdXt7Refdv5hoFejJ'],
    ['kySo1nETpsZE2NWe5vj2C64mPSciH1SppmHb4XieQ7B', '67zGEwrzVJvn9owJR8aL693K1eMoH28WiDKDE17xNmf8']
  ]
  return sumTokens2({ tokensAndOwners:allTokensAndOwners, api})
}

module.exports = {
  solana: { tvl },
  methodology: 'Counts multi type of SOL/LST in the vault',
}