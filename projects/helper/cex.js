
const { tokensBare } = require('./tokenMapping')
const { getBalance } = require('../helper/utils')
const tronHelper = require('../helper/tron')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const defaultTokens = {
  ethereum: [
    nullAddress, tokensBare.usdt, tokensBare.usdc, tokensBare.link, tokensBare.dai, tokensBare.wbtc,
    '0x0000000000085d4780B73119b644AE5ecd22b376', // TUSD
    '0x4fabb145d64652a948d72533023f6e7a623c7c53', // BUSD
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIBA INU
    '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b', // CRO
  ],
}

function cexExports(config) {
  const chains = Object.keys(config).filter(i => i !== 'bep2')
  const exportObj = {
    timetravel: false,
  }
  chains.forEach(chain => {
    let { addresses, tokensAndOwners, owners, tokens} = config[chain]
    if (addresses) {
      exportObj[chain] = {
        tvl: getChainTvl(chain, config),
      }
    } else if (chain === 'tron') {
      exportObj.tron = {
        tvl: async () => tronHelper.sumTokens({ tokensAndOwners })
      }
    } else {
      if (!tokensAndOwners && !tokens) {
        tokens = defaultTokens[chain]
        if (!tokens)  throw new Error(chain, 'Missing default token list')
      }
      exportObj[chain] = {
        tvl: sumTokensExport({ owners, chain, tokens, tokensAndOwners, })
      }
    }
  })
  return exportObj
}

function getChainTvl(chain, config) {
  const { addresses, geckoId, noParallel = false, } = config[chain]
  return async () => {
    let balance = 0
    if (noParallel) {
      for (const account of addresses)
        balance += await getBalance(chain, account)
    } else {
      balance = (await Promise.all(addresses.map(i => getBalance(chain, i)))).reduce((a, i) => a + i, 0)
    }
    return {
      [geckoId]: balance
    }
  }
}

module.exports = {
  cexExports,
  defaultTokens,
  getChainTvl,
}