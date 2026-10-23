const USDSC = '0x3f99231dD03a9F0E7e3421c92B7b90fbe012985a'
const M = '0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b' // M0's $M

async function tvl(api) {
  const bal = await api.call({ target: M, abi: 'erc20:balanceOf', params: [USDSC] })
  // $M pricing is unreliable (no price before 2026, missing on all chains since 2026-10-22);
  // USDSC wraps $M 1:1 (both 6 decimals) and is priced on Soneium, so value the backing at the USDSC price
  api.add(USDSC, bal)
}

module.exports = {
  misrepresentedTokens: true, // $M backing is reported as USDSC
  methodology: 'TVL is the $M balance held by the USDSC (Startale USD) M0 extension contract on Soneium, which is the collateral backing every minted USDSC. $M is valued 1:1 at the USDSC price, since $M pricing is not reliably available.',
  start: '2025-11-19',
  soneium: { tvl },
}
