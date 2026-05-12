const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const SOLANA_FUSDLP_MINT = '51tpgun58apNKgrk96xAVUCN5yC7cDzt3EHov9UjBh3Q'

const EVM_CONFIG = {
  ethereum: {
    fusd: '0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C',
    fusdlp: '0x3fea1cb36D2C5523c062d0E060EAC253608b4DAf',
    treasury: '0x7c2E652F8bB1DA76D172e11f8a099C663B3fFF54',
  },
  monad: {
    fusd: '0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C',
    fusdlp: '0x3fea1cb36D2C5523c062d0E060EAC253608b4DAf',
    treasury: '0x7c2E652F8bB1DA76D172e11f8a099C663B3fFF54',
  },
  sonic: {
    fusd: '0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C',
    fusdlp: '0x3fea1cb36D2C5523c062d0E060EAC253608b4DAf',
    treasury: '0x7c2E652F8bB1DA76D172e11f8a099C663B3fFF54',
  },
  avax: {
    fusd: '0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C',
    fusdlp: '0x3fea1cb36D2C5523c062d0E060EAC253608b4DAf',
    treasury: '0x7c2E652F8bB1DA76D172e11f8a099C663B3fFF54',
  },
  // exsat_mainnet in deployment repo maps to xsat in DefiLlama chain keys
  xsat: {
    fusd: '0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C',
    fusdlp: '0x3fea1cb36D2C5523c062d0E060EAC253608b4DAf',
    treasury: '0x408673EeB09e58f284C158b1D2ba2BF1C9C21E2E',
  },
}

function toBigInt(value) {
  if (typeof value === 'bigint') return value
  return BigInt(value)
}

function getEvmTvl(config) {
  return async function tvl(api) {
    // Read required chain states in parallel to keep RPC round trips minimal.
    const [fusdSupplyRaw, fusdlpSupplyRaw, fusdlpTreasuryBalanceRaw] = await Promise.all([
      api.call({ target: config.fusd, abi: 'erc20:totalSupply' }),
      api.call({ target: config.fusdlp, abi: 'erc20:totalSupply' }),
      api.call({ target: config.fusdlp, abi: 'erc20:balanceOf', params: config.treasury }),
    ])

    const fusdSupply = toBigInt(fusdSupplyRaw)
    const fusdlpSupply = toBigInt(fusdlpSupplyRaw)
    const fusdlpTreasuryBalance = toBigInt(fusdlpTreasuryBalanceRaw)

    // Guard against underflow if treasury balance is unexpectedly higher than total supply.
    const netFusdlpSupply = fusdlpSupply > fusdlpTreasuryBalance ? fusdlpSupply - fusdlpTreasuryBalance : 0n

    // Report raw token balances so DefiLlama can render token-level balance breakdown.
    api.add(config.fusd, fusdSupply)
    api.add(config.fusdlp, netFusdlpSupply)
  }
}

async function solanaTvl(api) {
  // Solana scope requires only FUSDLP total supply (raw quantity).
  const { value } = await getConnection('solana').getTokenSupply(new PublicKey(SOLANA_FUSDLP_MINT))
  api.add(SOLANA_FUSDLP_MINT, value.amount || 0)
}

module.exports = {
  methodology: 'Reports raw token balances for TVL. On EVM chains, counts FUSD totalSupply and net FUSDLP circulating supply (FUSDLP totalSupply minus treasury balance). On Solana, counts FUSDLP total supply only.',
  solana: { tvl: solanaTvl },
}

Object.entries(EVM_CONFIG).forEach(([chain, config]) => {
  module.exports[chain] = { tvl: getEvmTvl(config) }
})
