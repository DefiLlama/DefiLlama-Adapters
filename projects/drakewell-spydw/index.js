const ADDRESSES = require('../helper/coreAssets.json')

// SPYdw (Drakewell) is a principal-protected S&P 500 note. Each deposit is split: the option premium
// buys XSP calls off-chain (at IBKR) and the rest is deposited into USDdw, Drakewell's Accountable vault
// on Ethereum, and held by the SPYdw contract as the principal floor.
// TVL counts what SPYdw holds on-chain: its USDdw shares, valued with the vault's convertToAssets(), plus
// USDC held by the contract (deposit requests waiting to be filled). The off-chain calls are not counted.
// The same USDdw shares are subtracted from the Drakewell USDdw listing, so nothing is counted twice.
const SPYDW = '0x88e570F58881d8b200CA58B5a050fb5C9BAC8deb'
const USDDW = '0x2B5895b716311A1eaC8f93fB88C56aF9eC8C1A69' // Drakewell USDdw vault (Accountable)

async function tvl(api) {
  const shares = await api.call({ target: USDDW, abi: 'erc20:balanceOf', params: [SPYDW] })
  if (shares > 0) {
    const assets = await api.call({ target: USDDW, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [shares] })
    api.add(ADDRESSES.ethereum.USDC, assets)
  }
  return api.sumTokens({ owner: SPYDW, tokens: [ADDRESSES.ethereum.USDC] })
}

module.exports = {
  methodology: 'TVL is what the SPYdw contract holds on-chain: its USDdw shares (the principal floor of each note, deposited into the Drakewell USDdw vault on Ethereum and valued with convertToAssets()) plus USDC waiting in the contract for deposit requests. The S&P 500 call options bought with each deposit\'s premium are held off-chain and are not counted. The USDdw shares are subtracted from the Drakewell USDdw listing, so they are counted once within Drakewell. The USDdw vault is also part of Accountable, so this listing is marked as double counted.',
  doublecounted: true,
  start: 1793734883, // SPYdw deployment, 3 Nov 2026 (block 26336431)
  ethereum: { tvl },
}
