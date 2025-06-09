const ADDRESSES = require('../helper/coreAssets.json')
const morphoAbi = require("../helper/abis/morpho.json");

const mainnetAllocatorToTokens = {
  '0xAfA2DD8a0594B2B24B59de405Da9338C4Ce23437': [
    '0x4DEDf26112B3Ec8eC46e7E31EA5e123490B05B8B', // spDai
  ],
  '0xbf674d0cD6841C1d7f9b8E809B967B3C5E867653': [
    '0x09AA30b182488f769a9824F15E6Ce58591Da4781', // aEthLidoUSDS
  ],
  '0x1601843c5E9bC251A3272907010AFa41Fa18347E': [
    '0x09AA30b182488f769a9824F15E6Ce58591Da4781', // aEthLidoUSDS
    ADDRESSES.ethereum.sUSDe,
    '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // aEthUSDC
    '0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259', // aEthUSDS
    ADDRESSES.ethereum.USDe,
    '0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041', // BUIDL-I
    '0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e', // USTB
    '0x8c213ee79581Ff4984583C6a801e5263418C4b86', // JTSRY
    '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b', // syrupUSDC
  ]
}

const baseAllocatorToTokens = {
  '0x2917956eFF0B5eaF030abDB4EF4296DF775009cA': [
    '0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A', // morpho sparkUSDC
    '0xf62e339f21d8018940f188F6987Bcdf02A849619', // fsUSDS
    '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB', // aBasUSDC
  ],
  '0x1601843c5E9bC251A3272907010AFa41Fa18347E': [
    ADDRESSES.base.USDC,
  ]
}

const arbitrumAllocatorToTokens = {
  '0x2B05F8e1cACC6974fD79A673a341Fe1f58d27266': [
    ADDRESSES.arbitrum.USDC_CIRCLE
  ]
}

const optimismAllocatorToTokens = {
  '0xe0F9978b907853F354d79188A3dEfbD41978af62': [
    ADDRESSES.optimism.USDC_CIRCLE
  ]
}

const unichainAllocatorToTokens = {
  '0x7b42Ed932f26509465F7cE3FAF76FfCe1275312f': [
    ADDRESSES.unichain.USDC
  ]
}

const CONFIG = {
  ethereum: mainnetAllocatorToTokens,
  base: baseAllocatorToTokens,
  arbitrum: arbitrumAllocatorToTokens,
  optimism: optimismAllocatorToTokens,
  unichain: unichainAllocatorToTokens,
}

async function tvl(api) {
  const tokenRecords = CONFIG[api.chain]
  const balanceCalls = Object.entries(tokenRecords).flatMap(([allocator, tokens]) => {
    return tokens.map((token) => ({ target: token, params: allocator }))
  })
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls })
  await addAaveBalances(api)
  await addMorphoBalances(api)

  const allTokens = Object.values(tokenRecords).flat()
  api.add(allTokens, balances)
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})

const almProxy = {
  ethereum: '0x1601843c5E9bC251A3272907010AFa41Fa18347E',
  base: '0x2917956eFF0B5eaF030abDB4EF4296DF775009cA',
  arbitrum: '0x92afd6F2385a90e44da3a8B60fe36f6cBe1D8709',
  optimism: '0x876664f0c9Ff24D1aa355Ce9f1680AE1A5bf36fB',
  unichain: '0x345E368fcCd62266B3f5F37C9a131FD1c39f5869',
}

const vaultConfigs = {
  ethereum: [
    {
      allocator: almProxy.ethereum,
      vaultToken: '0x4DEDf26112B3Ec8eC46e7E31EA5e123490B05B8B', //spDAI
      underlyingToken: ADDRESSES.ethereum.DAI,
    },
    {
      allocator: almProxy.ethereum,
      vaultToken: '0xC02aB1A5eaA8d1B114EF786D9bde108cD4364359', //spUSDS
      underlyingToken: '0xdC035D45d973E3EC169d2276DDab16f1e407384F',
    },
    {
      allocator: almProxy.ethereum,
      vaultToken: '0x377C3bd93f2a2984E1E7bE6A5C22c525eD4A4815', //spUSDC
      underlyingToken: ADDRESSES.ethereum.USDC
    },
  ],
  base: [],
  arbitrum: [],
  optimism: [],
  unichain: [],
}

// discards idle supply on aave like markets for USDS and DAI
async function addAaveBalances(api) {
  const vaults = vaultConfigs[api.chain]
  if (vaults.length === 0) {
    return
  }

  const balances = []

  for (const vault of vaults) {
    const [underlyingBalance, totalSupply, allocatorBalance] = await api.batchCall([
      {
        abi: 'erc20:balanceOf',
        target: vault.underlyingToken,
        params: vault.vaultToken,
      },
      {
        abi: 'erc20:totalSupply',
        target: vault.vaultToken,
      },
      {
        abi: 'erc20:balanceOf',
        target: vault.vaultToken,
        params: almProxy[api.chain],
      },
    ])

    const utilization = 1 - underlyingBalance / totalSupply
    const discountedBalance = allocatorBalance * utilization
    balances.push(discountedBalance)
  }

  const tokens = vaults.map((vault) => vault.vaultToken)
  api.add(tokens, balances)
}

const morphoVaultConfigs = {
  ethereum: {
    morphoSingleton: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
    vaults: [
      {
        allocator: '0x9C259F14E5d9F35A0434cD3C4abbbcaA2f1f7f7E',
        address: '0x73e65DBD630f90604062f6E02fAb9138e713edD9',
      }
    ]
  },
}

// discards idle supply on morpho like markets for USDS and DAI
async function addMorphoBalances(api) {
  const vaultConfig = morphoVaultConfigs[api.chain]
  if (!vaultConfig) {
    return
  }

  for (const vault of vaultConfig.vaults) {
    const [withdrawQueueLength, allocatorBalance] = await api.batchCall([
      {
        abi: 'function withdrawQueueLength() external view returns (uint256)',
        target: vault.address,
      },
      {
        abi: 'erc20:balanceOf',
        target: vault.address,
        params: vault.allocator,
      },
    ])

    const calls = Array.from({ length: Number(withdrawQueueLength) }).map((_, index) => ({
      target: vault.address,
      params: index,
    }))
    const markets = await api.multiCall({
      abi: 'function withdrawQueue(uint256) public view returns (bytes32)',
      calls,
    })

    const marketsData = await api.multiCall({
      abi: morphoAbi.morphoBlueFunctions.market,
      calls: markets.map((market) => ({
        target: vaultConfig.morphoSingleton,
        params: market,
      })),
    })

    const totals = marketsData.reduce(
        (sum, current) => ({
          borrowed: sum.borrowed + Number(current.totalBorrowAssets),
          supplied: sum.supplied + Number(current.totalSupplyAssets),
        }),
        {
          borrowed: 0,
          supplied: 0,
        },
    )

    const utilization = totals.borrowed / totals.supplied
    const discountedBalance = Number(allocatorBalance) * utilization
    api.add(vault.address, discountedBalance)
  }
}
