const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')
const ASTRA_TOKEN_CONTRACT = '0xd3188e0df68559c0B63361f6160c57Ad88B239D8';
const ASTRA_STAKING_CONTRACT = '0x6fE79b531b2b1d5378631B3Ab33B0994E297355E';

async function tvl(_, _b, _cb, { api, }) {
  let gotError = false
  const indexAddr = '0x8e265fF847CC660Cd89786D4308076a9f921428f'
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
  // ethereum: {
  //   tvl,
  //   // pool2: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT, resolveUniV3: true, }),
  //   // staking: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT, tokens: [ASTRA_TOKEN_CONTRACT], })
  // },
  arbitrum: {
    tvl,
     pool2: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT, resolveUniV3: true, }),
     staking: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT, tokens: [ASTRA_TOKEN_CONTRACT], })
  },
  hallmarks: [
    [Math.floor(new Date('2023-09-14')/1e3), 'Security Incident'],
    [Math.floor(new Date('2024-01-04')/1e3), 'Arbitrum Launch'],
  ],
}; 