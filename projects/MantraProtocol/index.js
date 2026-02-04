const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const MANTRA_CONTRACT_PER_CHAIN = {
  shibarium: '0xf27B9704a15fFe47818fD48660D952235e9C39aF',
  dogechain: '0xf27B9704a15fFe47818fD48660D952235e9C39aF',
  cronos: '0xf27B9704a15fFe47818fD48660D952235e9C39aF',
  smartbch: '0xA39F586a9F4f68e43F0443A6E966eFe096eb8C88'
}

async function tvl(api) {

  const MANTRA_CONTRACT = MANTRA_CONTRACT_PER_CHAIN[api.chain]

  // Get all whitelisted tokens (includes native coin as 0x0000000000000000000000000000000000000000)
  const whitelistedTokens = await api.call({
    abi: 'function getWhitelistedCurrencies() external view returns (address[] memory currencies)',
    target: MANTRA_CONTRACT
  })

  return sumTokens2({ api, tokens: whitelistedTokens, owner: MANTRA_CONTRACT })
}

module.exports = {
  methodology: 'Counts the balance of each of the whitelisted tokens in the Mantra contract',
  shibarium: {
    tvl,
  },
  dogechain: {
    tvl,
  },
  cronos: {
    tvl,
  },
  smartbch: {
    tvl,
  },
};