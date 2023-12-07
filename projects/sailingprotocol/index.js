const sdk = require('@defillama/sdk')

async function tvl(_0, _1, _2, { api }) {
  const SPY = '0x75B5DACEc8DACcb260eA47549aE882513A21CE01'
  const arbitrumApi = new sdk.ChainApi({ chain: 'arbitrum' })
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: SPY })
  // https://pyth.network/developers/price-feed-ids
  const { price, expo } = await arbitrumApi.call({ abi: 'function getPriceUnsafe(bytes32 id) view returns (tuple(int64 price, uint64 conf, int32 expo, uint256 publishTime) price)', target: '0xff1a0f4744e8582df1ae09d5611b887b6a12925c', params: '0x19e09bb805456ada3979a7d1cbb4b6d63babc3a0f8e8a9509f68afa5c4c11cd5' })
  return {
    tether: (totalSupply * price) / 10 ** (18 - expo)
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  kava: { tvl, },
  methodology: 'The total supply is extracted from the contract found in the Sailing Protocol API, and this value is multiplied by the latest closing price of the S&P500 to obtain the TVL in USD.'
}
