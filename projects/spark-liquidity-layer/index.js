const ADDRESSES = require('../helper/coreAssets.json')
const morphoAbi = require("../helper/abis/morpho.json");

const almProxy = {
  ethereum: '0x1601843c5E9bC251A3272907010AFa41Fa18347E',
  base: '0x2917956eFF0B5eaF030abDB4EF4296DF775009cA',
  arbitrum: '0x92afd6F2385a90e44da3a8B60fe36f6cBe1D8709',
  optimism: '0x876664f0c9Ff24D1aa355Ce9f1680AE1A5bf36fB',
  unichain: '0x345E368fcCd62266B3f5F37C9a131FD1c39f5869',
  avax: '0xecE6B0E8a54c2f44e066fBb9234e7157B15b7FeC',
}

const mainnetAllocatorToTokens = {
  '0xAfA2DD8a0594B2B24B59de405Da9338C4Ce23437': [
    '0x4DEDf26112B3Ec8eC46e7E31EA5e123490B05B8B', // spDai
  ],
  '0xbf674d0cD6841C1d7f9b8E809B967B3C5E867653': [
    '0x09AA30b182488f769a9824F15E6Ce58591Da4781', // aEthLidoUSDS
  ],
  [almProxy.ethereum]: [
    ADDRESSES.ethereum.sUSDe,
    ADDRESSES.ethereum.USDe,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.USDC,
    '0x09AA30b182488f769a9824F15E6Ce58591Da4781', // aEthLidoUSDS
    '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // aEthUSDC
    '0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259', // aEthUSDS
    '0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041', // BUIDL-I
    '0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e', // USTB
    '0x8c213ee79581Ff4984583C6a801e5263418C4b86', // JTSRY
    '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b', // syrupUSDC
    '0x779224df1c756b4EDD899854F32a53E8c2B2ce5d', // spPYUSD
    '0xe7dF13b8e3d6740fe17CBE928C7334243d86c92f', // spUSDT
    '0x377C3bd93f2a2984E1E7bE6A5C22c525eD4A4815', // spUSDC
    '0x56A76b428244a50513ec81e225a293d128fd581D', // morpho blue chip sparkUSDC
    '0x14d60E7FDC0D71d8611742720E4C50E7a974020c', // Superstate's USCC
    '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // pyUSD
  ]
}

const baseAllocatorToTokens = {
  [almProxy.base]: [
    '0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A', // morpho sparkUSDC
    '0xf62e339f21d8018940f188F6987Bcdf02A849619', // fsUSDS
    '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB', // aBasUSDC
    ADDRESSES.base.USDC, // idle USDC
  ],
  '0x1601843c5E9bC251A3272907010AFa41Fa18347E': [
    ADDRESSES.base.USDC,
  ]
}

const arbitrumAllocatorToTokens = {
  [almProxy.arbitrum]: [
    ADDRESSES.arbitrum.USDC_CIRCLE
  ],
  '0x2B05F8e1cACC6974fD79A673a341Fe1f58d27266': [
    ADDRESSES.arbitrum.USDC_CIRCLE
  ]
}

const optimismAllocatorToTokens = {
  [almProxy.optimism]: [
    ADDRESSES.optimism.USDC_CIRCLE,
  ],
  '0xe0F9978b907853F354d79188A3dEfbD41978af62': [
    ADDRESSES.optimism.USDC_CIRCLE
  ]
}

const unichainAllocatorToTokens = {
  [almProxy.unichain]: [
    ADDRESSES.unichain.USDC,
  ],
  '0x7b42Ed932f26509465F7cE3FAF76FfCe1275312f': [
    ADDRESSES.unichain.USDC
  ]
}

const avaxAllocatorToTokens = {
  [almProxy.avax]: [
    ADDRESSES.avax.USDC,
    '0x625E7708f30cA75bfd92586e17077590C60eb4cD', // aave aUSDC
  ]
}

const CONFIG = {
  ethereum: mainnetAllocatorToTokens,
  base: baseAllocatorToTokens,
  arbitrum: arbitrumAllocatorToTokens,
  optimism: optimismAllocatorToTokens,
  unichain: unichainAllocatorToTokens,
  avax: avaxAllocatorToTokens,
}

async function tvl(api) {
  const tokenRecords = CONFIG[api.chain]
  const balanceCalls = Object.entries(tokenRecords).flatMap(([allocator, tokens]) => {
    return tokens.map((token) => ({ target: token, params: allocator }))
  })
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls })
  await addAaveBalances(api)
  await addMorphoBalances(api)
  await addEthenaUnstakeBalance(api)
  await addCurveBalances(api)

  const allTokens = Object.values(tokenRecords).flat()
  api.add(allTokens, balances)
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})

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
  ],
  base: [],
  arbitrum: [],
  optimism: [],
  unichain: [],
  avax: [],
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
        idleMarketId: '0x57f4e42c0707d3ae0ae39c9343dcba78ff79fa663da040eca45717a9b0b0557f',
      },
      {
        allocator: almProxy.ethereum,
        address: '0x73e65DBD630f90604062f6E02fAb9138e713edD9',
        idleMarketId: '0x57f4e42c0707d3ae0ae39c9343dcba78ff79fa663da040eca45717a9b0b0557f',
      },
      {
        allocator: almProxy.ethereum,
        address: '0xe41a0583334f0dc4E023Acd0bFef3667F6FE0597',
        idleMarketId: '0x02e723fdfc0c26779c2c06bbf783e2f4d6aebd03cedc1806981b742f1a644105',
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

    const activeMarkets = markets.filter((market) => market !== vault.idleMarketId)

    const marketsData = await api.multiCall({
      abi: morphoAbi.morphoBlueFunctions.market,
      calls: activeMarkets.map((market) => ({
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

async function addEthenaUnstakeBalance(api) {
  if (api.chain !== 'ethereum') {
    return
  }

  const response = await api.call({
    abi: 'function cooldowns(address) public view returns (tuple(uint104 cooldownEnd, uint152 underlyingAmount))',
    target: ADDRESSES.ethereum.sUSDe,
    params: almProxy.ethereum,
  })

  api.add(ADDRESSES.ethereum.USDe, response.underlyingAmount)
}

const curveConfigs = {
  ethereum: [
    {
      address: '0x00836Fe54625BE242BcFA286207795405ca4fD10',
      coinIndex: 1,
    },
    {
      address: '0xA632D59b9B804a956BfaA9b48Af3A1b74808FC1f',
      coinIndex: 0,
    },
  ],
  base: [],
  arbitrum: [],
  optimism: [],
  unichain: [],
  avax: [],
}

async function addCurveBalances(api) {
  const curvePools = curveConfigs[api.chain]
  if (curvePools.length === 0) {
    return
  }

  const curveData = await Promise.all(
    curvePools.map((curvePool) =>
      api.batchCall([
        {
          abi: 'erc20:totalSupply',
          target: curvePool.address,
        },
        {
          abi: 'erc20:balanceOf',
          target: curvePool.address,
          params: almProxy.ethereum,
        },
        {
          abi: 'function balances(uint256) public view returns (uint256)',
          target: curvePool.address,
          params: curvePool.coinIndex,
        },
        {
          abi: 'function coins(uint256) public view returns (address)',
          target: curvePool.address,
          params: curvePool.coinIndex,
        },
      ]),
    ),
  )

  const { tokens, balances } = curveData.reduce(
    (acc, [totalSupply, lpBalance, coinBalance, coinAddress]) => {
      const shares = lpBalance / totalSupply
      const ownerCoinBalance = coinBalance * shares
      return { tokens: [...acc.tokens, coinAddress], balances: [...acc.balances, ownerCoinBalance] }
    },
    { tokens: [], balances: [] },
  )

  api.add(tokens, balances)
}
