const VAULTS = [
  "0x095d8B8D4503D590F647343F7cD880Fa2abbbf59",
  "0x0987fb9ae6cdc6e71defcf710833acfc36e3ba7d",
  "0xcfb9d82c426335c458ed78625b29b013c632ff2c"
]

const USDC = "ethereum:0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

async function tvl(_, __, ___, { api }) {

  let total = 0n

  for (const vault of VAULTS) {

    const supply = await api.call({
      target: vault,
      abi: "erc20:totalSupply",
    })

    total += BigInt(supply)
  }

  return {
    [USDC]: total.toString()
  }
}

module.exports = {
  methodology: "Counts total supply of Flying Tulip vault tokens representing deposited USDC across strategies.",
  start: 1764868523,
  ethereum: { tvl }
}