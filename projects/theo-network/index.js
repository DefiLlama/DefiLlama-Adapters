const { getConfig } = require('../helper/cache')

// thBill token addresses
const THBILL = {
  ethereum: "0x5FA487BCa6158c64046B2813623e20755091DA0b",
  arbitrum: "0xfdd22ce6d1f66bc0ec89b20bf16ccb6670f55a5a",
  base: "0xfdd22ce6d1f66bc0ec89b20bf16ccb6670f55a5a",
  hyperliquid: "0xfdd22ce6d1f66bc0ec89b20bf16ccb6670f55a5a"
}

// Chains where your vaults/vaultInfo endpoint applies (skip hyperliquid here)
const CHAINS_WITH_VAULTS = ["ethereum", "arbitrum", "base", "linea"]
const ETH_ADAPTER = "0xfdd22ce6d1f66bc0ec89b20bf16ccb6670f55a5a"

const config = {
  ethereum: {},
  arbitrum: {},
  base: {},
  linea: {},
  hyperliquid: {}
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      // vault balance
      if (CHAINS_WITH_VAULTS.includes(chain)) {
        const { [chain]: data } = await getConfig('theo-network', "https://vaults.theo.xyz/vaults/vaultInfo");

        const calls = Object.values(data).map(i => i.contract)
        const tokens = Object.values(data).map(i => i.asset)
        const bals = await api.multiCall({ abi: 'uint256:totalBalance', calls })
        api.add(tokens, bals)
      }

      // thBill balance
      const addr = THBILL[chain]
      if (!addr) return


      // for mainnet, subtract balance of adapter to avoid double counting
      if (chain === "ethereum") {
        const [totalSupply, locked] = await Promise.all([
          api.call({ target: addr, abi: 'erc20:totalSupply' }),
          api.call({ target: addr, abi: 'erc20:balanceOf', params: [ETH_ADAPTER] }),
        ])
        const effective = totalSupply - locked
        if (effective > 0n) api.add(addr, effective)
      } else {
        const supply = await api.call({ target: addr, abi: 'erc20:totalSupply' })
        api.add(addr, supply)
      }
    }
  }
})
