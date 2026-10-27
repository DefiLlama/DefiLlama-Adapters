const MZUSD = '0x1BBa049d3869E8d467F38E52AcA8E99D64E310a6' // Hastra Optimizer accounting stable, minted 1:1 on deposit

async function tvl(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: MZUSD })
  api.addCGToken('usd-coin', supply / 1e18)
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the total supply of the vault accounting stable (mzUSD), which is minted 1:1 against deposits and tracks vault NAV net of strategy borrowings. The underlying collateral is Hastra PRIME/AUTO looped on Morpho, so it is already counted under Hastra and Morpho.',
  ethereum: { tvl },
}
