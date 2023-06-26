const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')
const ASTRA_TOKEN_CONTRACT = '0x7E9c15C43f0D6C4a12E6bdfF7c7D55D0f80e3E23';
const ASTRA_STAKING_CONTRACT = '0xDFE672C671943411fc16197fb8E328662B57CE2C';

async function tvl(_, _b, _cb, { api, }) {
  let gotError = false
  const indexAddr = '0x17b9B197E422820b3e28629a2BB101949EE7D12B'
  const stableCoin = await api.call({  abi: 'address:baseStableCoin', target: indexAddr})
  let i = 0
  const tokens = [stableCoin]
  do {
    try {
      const _tokens = await api.call({ abi: 'function getIndexTokenDetails(uint256) view returns (address[])', target: indexAddr, params: i})
      tokens.push(..._tokens)
      i++
    } catch(e) {
      if (i === 0) throw e
      gotError = true
    }
  } while(!gotError)
  return sumTokens2({ api, owner: indexAddr, tokens})
}

module.exports = {
  start: 17243078,
  ethereum: {
    tvl,
    pool2: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT, resolveUniV3: true, }),
    staking: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT, tokens: [ASTRA_TOKEN_CONTRACT], })
  }
}; 