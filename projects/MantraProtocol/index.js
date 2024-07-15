const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const NATIVE_TOKEN_INTERNAL_ADDRESS = ADDRESSES.null

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


  // -- BALANCE OF NATIVE COIN
  const balanceNative = await sdk.api.eth.getBalance({
    target: MANTRA_CONTRACT,
    chain: api.chain
  })

  api.add(NATIVE_TOKEN_INTERNAL_ADDRESS, balanceNative.output)


  // -- BALANCE OF OTHER TOKENS (non native)

  // Filter out native coin from whitelistedTokens
  const nonNativeTokens = whitelistedTokens.filter(t => t != NATIVE_TOKEN_INTERNAL_ADDRESS)

  const balanceCalls = []
  for (let i = 0; i < nonNativeTokens.length; i++) {
    balanceCalls.push({
      abi: 'erc20:balanceOf',
      target: nonNativeTokens[i],
      params: [MANTRA_CONTRACT],
    });
  }

  const balances = await api.batchCall(balanceCalls)

  api.addTokens(nonNativeTokens, balances)
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