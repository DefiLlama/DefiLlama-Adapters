const abis = {
  strategyProxies: 'function strategyProxies(uint256) view returns (address)',
  strategyVaults: 'function strategyVaults(address) view returns (address)',
  convertToAssets: 'function convertToAssets(uint256) view returns (uint256)',
  asset: 'function asset() view returns (address)',
}

const VAULTS = {
  monad: [
    '0x8D24B48Cb736addb5B7069565F192A052F42Ba61', // AUSD Tauri
  ],
  ethereum: [
    '0x4C18E2bb9942b12b28e780acF2D9EC2DDA126df9', // AUSD Tauri
  ],
}


function tvl(isBorrowed) {
  return async (api) => {
      const vaults = VAULTS[api.chain]
      if (!vaults.length) return

      const [supplies, underlyings] = await Promise.all([
          api.multiCall({ abi: 'erc20:totalSupply', calls: vaults, permitFailure: true }),
          api.multiCall({ abi: abis.asset, calls: vaults, permitFailure: true }),
      ])
      
      const [totalAssets, liquidity] = await Promise.all([
          api.multiCall({
              abi: abis.convertToAssets,
              calls: vaults.map((vault, i) => ({ target: vault, params: [supplies[i] || 0] })),
              permitFailure: true,
          }),
          api.multiCall({ abi: 'erc20:balanceOf', calls: vaults.map((vault, i) => ({ target: underlyings[i], params: vault })), permitFailure: true })
      ])

      vaults.forEach((_, i) => {
          if (!underlyings[i] || !totalAssets[i]) return
          isBorrowed ? api.add(underlyings[i], totalAssets[i] - liquidity[i]) : api.add(underlyings[i], liquidity[i])
      })
  }
}

module.exports = {
  methodology: 'TVL converts each vault totalSupply to underlying via convertToAssets().',
  monad: {
      tvl: tvl(false),
      borrowed: tvl(true)
  },
  ethereum: {
      tvl: tvl(false),
      borrowed: tvl(true)
  },
}