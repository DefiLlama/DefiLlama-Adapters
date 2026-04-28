const MONY = '0x6a7c6aa2b8b8a6A891dE552bDEFFa87c3F53bD46'

async function tvl(api) {
  const [decimals, supply] = await Promise.all([
    api.call({ target: MONY, abi: 'erc20:decimals' }),
    api.call({ target: MONY, abi: 'erc20:totalSupply' }),
  ])
  api.addUSDValue(supply / 10 ** decimals)
}

module.exports = {
  ethereum: { tvl },
  misrepresentedTokens: true,
  methodology: 'TVL is the total supply of MONY tokens (My OnChain Net Yield Fund), JPMorgan Asset Management\'s tokenized money market fund on Ethereum, valued at approximately $1 per token.',
}
