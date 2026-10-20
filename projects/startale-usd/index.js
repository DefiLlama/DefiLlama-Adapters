const USDSC = '0x3f99231dD03a9F0E7e3421c92B7b90fbe012985a'
const M = '0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b' // M0's $M

async function tvl(api) {
  const bal = await api.call({ target: M, abi: 'erc20:balanceOf', params: [USDSC] })
  // $M has no price on Soneium, and none on any chain before 2026; USDSC wraps it 1:1
  // (both 6 decimals), so value the backing at the USDSC price
  api.add(USDSC, bal)
}

module.exports = {
  methodology: 'TVL is the $M balance held by the USDSC (Startale USD) M0 extension contract on Soneium, which is the collateral backing every minted USDSC. $M is valued 1:1 as USDSC, since $M is not priced on Soneium.',
  start: '2025-11-19',
  soneium: { tvl },
}
