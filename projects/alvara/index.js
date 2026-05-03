// Alvara Protocol — ALVA held by the public treasury multisig (on-chain balance).
// Full ERC-7621 basket TVL would require enumerating all BasketToken contracts
// (factory address + event indexers); this is a minimal, verifiable lower bound.

const ALVA = '0x8e729198d1C59B82bd6bBa579310C40d740A11C2' // canonical ALVA (ethereum)
const TREASURY = '0x689ac37b02a36e77d2ad1ea7d923a05233a0d8e2' // alvaraprotocol.eth

async function tvl (api) {
  const bal = await api.call({
    target: ALVA,
    abi: 'erc20:balanceOf',
    params: [TREASURY],
  })
  api.add(ALVA, bal)
}

module.exports = {
  methodology:
    'Sums the ALVA (ERC-20) token balance held by the Alvara treasury multisig on Ethereum. Basket-level ERC-7621 reserve TVL is not included because basket contracts are permissionlessly deployed and must be enumerated from the on-chain factory or logs.',
  ethereum: { tvl },
}
