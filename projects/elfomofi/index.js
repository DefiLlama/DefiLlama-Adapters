const { getLogs2 } = require('../helper/cache/getLogs')

const MANAGERS = [
  {
    target: '0x64f8be47a011df0fab47319d5de258d18e93f4ef',
    fromBlock: 44952928,
  },
  {
    target: '0xe34cd3682af9c04303386499fba215b38eff6106',
    fromBlock: 45354975,
  },
]

const VAULT_CREATED =
  'event VaultCreated(uint256 indexed vaultId, address indexed vaultAddress, address indexed lpTokenAddress, uint8 curatorId)'

async function tvl(api) {
  const block = await api.getBlock()

  const logs = await Promise.all(
    MANAGERS.filter(({ fromBlock }) => fromBlock <= block).map(
      ({ target, fromBlock }) =>
        getLogs2({
          api,
          target,
          fromBlock,
          eventAbi: VAULT_CREATED,
          transform: ({ vaultAddress }) => vaultAddress.toLowerCase(),
        }),
    ),
  )

  const vaults = [...new Set(logs.flat())]

  if (!vaults.length) return

  const [tokens, balances] = await Promise.all([
    api.multiCall({
      calls: vaults,
      abi: 'address:refToken',
    }),
    api.multiCall({
      calls: vaults,
      abi: 'uint256:currentTotalAssetsInRef',
    }),
  ])

  api.add(tokens, balances)
}

module.exports = {
  methodology:
    "TVL is the sum of the latest settled total asset value of all vaults registered by ElfomoFi's Base VaultsManager contracts, read on-chain in each vault's reference token.",
  base: { tvl },
}
