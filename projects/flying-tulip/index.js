const sdk = require('@defillama/sdk')

const vaults = [
  "0x095d8b8d4503d590f647343f7cd880fa2abbbf59",
  "0x0987fb9ae6cdc6e71defcf710833acfc36e3ba7d",
  "0xcfb9d82c426335c458ed78625b29b013c632ff2c",
]

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

async function tvl(_, __, ___, { api }) {

  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: vaults.map(v => ({ target: v })),
  })

  let total = 0n

  for (const s of supplies) {
    total += BigInt(s)
  }

  return {
    [`ethereum:${USDC}`]: total.toString()
  }
}

module.exports = {
  methodology: "Counts total supply of Flying Tulip vault tokens representing deposited USDC across strategies.",
  start: 1764868523,
  ethereum: {
    tvl,
  }
}