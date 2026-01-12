// TODO: Once factory is upgraded, adapt this adapter to dynamically discover minters from factory events
// The factory (0xd696e56b3a054734d4c6dcbd32e11a278b0ec458) will emit:
//   factory.deployed(address minter, string identifier)
//   where identifier ends with "::minter" (e.g., "harbor_v1::BTC::fxUSD::minter")
//   The factory address is fixed for all time.
//   We can then index all minter addresses from factory events instead of hardcoding them.

// Known minter addresses (will be replaced by factory discovery once factory is upgraded)
const KNOWN_MINTERS = [
  '0xd6E2F8e57b4aFB51C6fA4cbC012e1cE6aEad989F', // Minter fxusd/eth
  '0x33e32ff4d0677862fa31582CC654a25b9b1e4888', // Minter fxusd/btc
  '0xF42516EB885E737780EB864dd07cEc8628000919', // Minter steth/btc
];

async function tvl(api) {
  // Get collateral token address from each minter using WRAPPED_COLLATERAL_TOKEN() function
  // This makes it dynamic and supports any collateral token without hardcoding
  const collateralTokens = await api.multiCall({
    abi: 'function WRAPPED_COLLATERAL_TOKEN() view returns (address)',
    calls: KNOWN_MINTERS,
  });
  
  // Build tokensAndOwners array: [collateralToken, minterAddress]
  const tokensAndOwners = KNOWN_MINTERS.map((minter, i) => [
    collateralTokens[i],
    minter,
  ]);

  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  methodology: 'TVL is calculated by summing the balances of tokens (FXSAVE and wstETH) held by 0xHarborFi minter contracts.',
  start: 23991071,
  ethereum: {
    tvl,
  },
};
