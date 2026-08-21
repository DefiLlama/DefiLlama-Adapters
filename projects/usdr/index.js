// USDR (RISE Dollar) is an M^0 extension: every USDR is minted by wrapping $M into the
// extension contract, so the $M held by that contract is the full backing of the supply.
const M = '0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b'
const USDR = '0x62b7f5A5Be488ea58f660C5aff465647213Bc6e9'

async function tvl(api) {
  const backing = await api.call({ target: M, abi: 'erc20:balanceOf', params: USDR })
  // $M is not priced on RISE by coins.llama.fi; it uses the same address on Ethereum,
  // where it is priced, so the balance is reported under the Ethereum key.
  api.add('ethereum:' + M, backing, { skipChain: true })
}

module.exports = {
  methodology:
    'TVL is the $M balance held by the USDR extension contract on RISE Chain, which is the collateral backing every minted USDR. $M is priced through its Ethereum listing because RISE is not indexed by coins.llama.fi.',
  rise: { tvl },
}
