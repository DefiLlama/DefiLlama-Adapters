// J.P. Morgan Asset Management - My OnChain Net Yield Fund (MONY)
// Tokenized money market fund on Ethereum
// Token address: 0x6a7c6aa2b8b8a6A891dE552bDEFFa87c3F53bD46

const MONY_TOKEN_ADDRESS = '0x6a7c6aa2b8b8a6A891dE552bDEFFa87c3F53bD46';

async function tvl(api) {
  // Get total supply of MONY token
  // The token represents shares in the money market fund
  // Each token represents a proportional share of the fund's assets
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: MONY_TOKEN_ADDRESS,
  });

  // Add the total supply to TVL
  // DefiLlama's pricing infrastructure will handle USD conversion
  api.add(MONY_TOKEN_ADDRESS, totalSupply);
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of MONY tokens on Ethereum. MONY is a tokenized money market fund that invests in U.S. Treasury securities and repurchase agreements fully collateralized by U.S. Treasury securities. Each MONY token represents a proportional share of the fund\'s underlying assets.',
  start: 1734220800, // December 15, 2025 - Launch date per J.P. Morgan press release
  ethereum: {
    tvl,
  },
};
