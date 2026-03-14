const sdk = require('@defillama/sdk')

const TOKENS = {
  aznd: {
    monadToken: '0x4917a5ec9fcb5e10f47cbb197abe6ab63be81fe8',
    ethereumToken: '0x52c66B5E7f8Fde20843De900C5C8B4b0F23708A0',
  },
  muBond: {
    monadToken: '0x336d414754967c6682b5a665c7daf6f1409e63e8',
    ethereumToken: '0x09AD9c6DcadCc3aB0b3E107E8E7DA69c2eEa8599',
  },
}

async function calculateMonadTvl(api, ethApi, { monadToken, ethereumToken }, cacheKey) {
  const [totalSupply, bridgedSupply] = await Promise.all([
    api.call({ target: monadToken, abi: 'erc20:totalSupply' }),
    ethApi.call({ target: ethereumToken, abi: 'erc20:totalSupply' }),
  ])

  const circulatingSupply = BigInt(totalSupply) - BigInt(bridgedSupply)
  if (circulatingSupply < 0n) {
    throw new Error(`Negative circulating supply for ${cacheKey}`)
  }

  api.add(monadToken, circulatingSupply.toString())
}

module.exports = {
  methodology: 'TVL counts OFT circulating supply. On Monad, TVL is token totalSupply minus the totalSupply of the corresponding OFT representation on Ethereum, so bridged supply is not double-counted on the hub chain. On Ethereum, TVL is the totalSupply of the OFT representation tokens.',
  monad: {
    tvl: async (api) => {
      const ethApi = new sdk.ChainApi({ chain: 'ethereum', timestamp: api.timestamp })
      await ethApi.getBlock()
      await Promise.all(Object.entries(TOKENS).map(([key, config]) => calculateMonadTvl(api, ethApi, config, key)))
    },
  },
  ethereum: {
    tvl: async (api) => {
      const tokens = Object.values(TOKENS).map(({ ethereumToken }) => ethereumToken)
      const supplies = await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' })
      tokens.forEach((token, i) => api.add(token, supplies[i]))
    },
  },
}
