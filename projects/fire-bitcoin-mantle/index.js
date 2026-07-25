// Fire Bitcoin (FBTC) on Mantle
// FBTC: 0xC96de26018A54D51c097160568752c4e3Bd6C364
//
// FBTC is a Bitcoin-pegged token on Mantle bridged by Ignition/Fire.
// TVL = totalSupply() * BTC price.
// Uses the existing ADDRESSES.mantle.FBTC constant already in coreAssets.

async function tvl(api) {
  const fbtc = '0xC96de26018A54D51c097160568752c4e3Bd6C364'
  const supply = await api.call({ abi: 'erc20:totalSupply', target: fbtc })
  api.add(fbtc, supply)
}

module.exports = {
  doublecounted: true,
  methodology:
    'TVL is the total supply of FBTC on Mantle. ' +
    'FBTC is Fire Bitcoin, a Bitcoin-pegged bridged asset. ' +
    'Tagged doublecounted to avoid overlap with protocols where FBTC is deposited as collateral.',
  mantle: { tvl },
}
