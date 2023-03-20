const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const { stakings } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform } = require('../helper/portedTokens')
const { BigNumber } = require("bignumber.js");

const abiGrizzly = "uint256:grizzlyStrategyDeposits"
const abiStandard = "uint256:standardStrategyDeposits"
const abiStable = "uint256:stablecoinStrategyDeposits"
const abiFarm = "uint256:totalDeposits"
const abiYearn = "uint256:totalAssets"

const lpReservesAbi = 'function balances(uint256 index) view returns (uint256)'
const tokenAbi = 'function coins(uint256 index) view returns (address)'
const lpSuppliesAbi = "uint256:totalSupply"

const pcsHives = [
  // PCS hives
  {
    hive: "0xDa0Ae0710b080AC64e72Fa3eC44203F27750F801",
    token: "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16"
  },
  {
    hive: "0x8D83Ad61Ae6eDE4274876EE9ad9127843ba2AbF7",
    token: "0xEc6557348085Aa57C72514D67070dC863C0a5A8c"
  },
  {
    hive: "0xE4Dbb05498C42A6E780e4C6F96A4E20a7D7Cb1d6",
    token: "0x7EFaEf62fDdCCa950418312c6C91Aef321375A00"
  },
  {
    hive: "0x66B1bACAB888017cA96abBf28ad8d10B7A7B5eC3",
    token: "0x2354ef4DF11afacb85a5C7f98B624072ECcddbB1"
  },
  {
    hive: "0x9F45E2181D365F9057f67153e6D213e2358A5A4B",
    token: "0x66FDB2eCCfB58cF098eaa419e5EfDe841368e489"
  },
  {
    hive: "0x3cbF1d01A650e9DB566A123E3D5e42B9684C6b6a",
    token: "0xEa26B78255Df2bBC31C1eBf60010D78670185bD0"
  },
  {
    hive: "0x6fc2FEed99A97105B988657f9917B771CD809f40",
    token: "0xF45cd219aEF8618A92BAa7aD848364a158a24F33"
  },
  // Biswap hives
  {
    hive: "0x0286A72F055A425af9096b187bf7f88e9f7D96A9",
    token: "0x8840C6252e2e86e545deFb6da98B2a0E26d8C1BA"
  },
  {
    hive: "0xB07a180735657a92d8e2b77D213bCBE5ab819089",
    token: "0xa987f0b7098585c735cD943ee07544a84e923d1D"
  },
  {
    hive: "0xe178eaDBcb4A64476B8E4673D99192C25ef1B42e",
    token: "0x63b30de1A998e9E64FD58A21F68D323B9BcD8F85"
  },
];

const farms = [
  {
    hive: "0x3641676bFe07F07DD2f79244BcdBb751f95F67Ca",
    token: "0x2b702b4e676b51f98c6b4af1b2cafd6a9fc2a3e0"
  },
  {
    hive: "0xF530B259fFf408aaB2B02aa60dd6fe48FCDC2FC9",
    token: "0x352008bf4319c3b7b8794f1c2115b9aa18259ebb"
  },
]

const stableHives = [
  {
    hive: "0x7Bf5005F9a427cB4a3274bFCf36125cE979F77cb",
    token: "0x36842f8fb99d55477c0da638af5ceb6bbf86aa98",
    swap: "0x169f653a54acd441ab34b73da9946e2c451787ef"
  },
  {
    hive: "0x7E5762A7D68Fabcba39349229014c59Db6dc5eB0",
    token: "0xee1bcc9f1692e81a281b3a302a4b67890ba4be76",
    swap: "0x3efebc418efb585248a0d2140cfb87afcc2c63dd"
  },
  {
    hive: "0xCCf6356C96Eadd2702fe6f5Ef99B1C0a3966EDf7",
    token: "0x1a77c359d0019cd8f4d36b7cdf5a88043d801072",
    swap: "0xc2f5b9a3d9138ab2b74d581fc11346219ebf43fe"
  },
]

const yearnHives = [
  // Thena hives
  {
    hive: "0x5Aa6dd6bA3091ba151B4E5c0C0c4f06335e91482",
    token: "0xa97e46dc17e2b678e5f049a2670fae000b57f05e"
  },
  {
    hive: "0x38b2f5038F70b8A4a54A2CC8d35d85Cc5f0794e4",
    token: "0xc8da40f8a354530f04ce2dde98ebc2960a9ea449"
  },
  {
    hive: "0x3dF96fE4E92f38F7C931fA5A00d1f644D1c60dbF",
    token: "0x075e794f631ee81df1aadb510ac6ec8803b0fa35"
  },
  {
    hive: "0x9Ce89aba449135539A61C57665547444a92784aB",
    token: "0x3c552e8ac4473222e3d794adecfa432eace85929"
  },
  {
    hive: "0xc750432473eABE034e84d373CB92f16e6EB0d273",
    token: "0x3ec80a1f547ee6fd5d7fc0dc0c1525ff343d087c"
  },
  {
    hive: "0xf01F9e8A5C6B9Db49e851e8d72B70569042F0e1C",
    token: "0x63db6ba9e512186c2faadacef342fb4a40dc577c"
  },
  {
    hive: "0xF7DE4A13669CB33D54b59f35FE71dFcD67e4635E",
    token: "0x34b897289fccb43c048b2cea6405e840a129e021"
  }
]

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  block = chainBlocks.bsc;

  const [{ output: hiveBalancesGrizzly },
    { output: hiveBalancesStandard },
    { output: hiveBalancesStable },
    { output: stableHiveBalancesGrizzly },
    { output: stableHiveBalancesStandard },
    { output: stableHiveBalancesStable },
    { output: farmBalances },
    { output: yearnBalances }] = await Promise.all([
      sdk.api.abi.multiCall({
        calls: pcsHives.map(h => ({ target: h.hive })),
        abi: abiGrizzly,
        chain: "bsc",
        block
      }),
      sdk.api.abi.multiCall({
        calls: pcsHives.map(h => ({ target: h.hive })),
        abi: abiStandard,
        chain: "bsc",
        block
      }),
      sdk.api.abi.multiCall({
        calls: pcsHives.map(h => ({ target: h.hive })),
        abi: abiStable,
        chain: "bsc",
        block
      }),
      sdk.api.abi.multiCall({
        calls: stableHives.map(h => ({ target: h.hive })),
        abi: abiGrizzly,
        chain: "bsc",
        block
      }),
      sdk.api.abi.multiCall({
        calls: stableHives.map(h => ({ target: h.hive })),
        abi: abiStandard,
        chain: "bsc",
        block
      }),
      sdk.api.abi.multiCall({
        calls: stableHives.map(h => ({ target: h.hive })),
        abi: abiStable,
        chain: "bsc",
        block
      }),
      sdk.api.abi.multiCall({
        calls: farms.map(h => ({ target: h.hive })),
        abi: abiFarm,
        chain: "bsc",
        block
      }),
      sdk.api.abi.multiCall({
        calls: yearnHives.map(h => ({ target: h.hive })),
        abi: abiYearn,
        chain: "bsc",
        block
      }),
    ]);

  const lpPositions = hiveBalancesGrizzly.map((b, i) => {
    const grizzly = new BigNumber(b.output);
    const standard = new BigNumber(hiveBalancesStandard[i].output);
    const stable = new BigNumber(hiveBalancesStable[i].output);

    return {
      balance: grizzly.plus(standard).plus(stable).toString(),
      token: pcsHives[i].token
    }
  });

  const lpPositionsStable = stableHiveBalancesGrizzly.map((b, i) => {
    const grizzly = new BigNumber(b.output);
    const standard = new BigNumber(stableHiveBalancesStandard[i].output);
    const stable = new BigNumber(stableHiveBalancesStable[i].output);

    return {
      balance: grizzly.plus(standard).plus(stable).toString(),
      token: stableHives[i].token,
      swap: stableHives[i].swap
    }
  });

  const farmLpPositions = farmBalances.map((b, i) => ({
    balance: b.output,
    token: farms[i].token
  }));

  const thenaLpPositions = yearnBalances.map((b, i) => ({
    balance: b.output,
    token: yearnHives[i].token
  }));

  await unwrapStablePcsLPs(
    balances,
    lpPositionsStable,
    block,
    "bsc",
    await transformBscAddress()
  )

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    "bsc",
    await transformBscAddress()
  );

  await unwrapUniswapLPs(
    balances,
    farmLpPositions,
    block,
    "bsc",
    await transformBscAddress()
  )

  await unwrapUniswapLPs(
    balances,
    thenaLpPositions,
    block,
    "bsc",
    await transformBscAddress()
  );

  return balances;
}

async function unwrapStablePcsLPs(balances, lpPositions, block, chain = 'ethereum', transformAddress = null, excludeTokensRaw = [],) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)
  lpPositions = lpPositions.filter(i => +i.balance > 0)
  const excludeTokens = excludeTokensRaw.map(addr => addr.toLowerCase())
  const lpTokenCalls = lpPositions.map(lpPosition => ({
    target: lpPosition.token
  }))
  const lpTokenCalls0 = lpPositions.map(lpPosition => ({
    target: lpPosition.swap,
    params: [0]
  }))
  const lpTokenCalls1 = lpPositions.map(lpPosition => ({
    target: lpPosition.swap,
    params: [1]
  }))
  const lpStableSwapCalls0 = lpPositions.map(lpPosition => ({
    target: lpPosition.swap,
    params: [0]
  }))
  const lpStableSwapCalls1 = lpPositions.map(lpPosition => ({
    target: lpPosition.swap,
    params: [1]
  }))
  const lpReserves0 = sdk.api.abi.multiCall({
    block,
    abi: lpReservesAbi,
    calls: lpStableSwapCalls0,
    chain
  })
  const lpReserves1 = sdk.api.abi.multiCall({
    block,
    abi: lpReservesAbi,
    calls: lpStableSwapCalls1,
    chain
  })
  const lpSupplies = sdk.api.abi.multiCall({
    block,
    abi: lpSuppliesAbi,
    calls: lpTokenCalls,
    chain
  })
  const tokens0 = sdk.api.abi.multiCall({
    block,
    abi: tokenAbi,
    calls: lpTokenCalls0,
    chain
  })
  const tokens1 = sdk.api.abi.multiCall({
    block,
    abi: tokenAbi,
    calls: lpTokenCalls1,
    chain
  })
  await Promise.all(lpPositions.map(async lpPosition => {
    try {
      let token0, token1, supply
      const lpToken = lpPosition.token
      const swap = lpPosition.swap
      const token0_ = (await tokens0).output.find(call => call.input.target === swap)
      const token1_ = (await tokens1).output.find(call => call.input.target === swap)
      const supply_ = (await lpSupplies).output.find(call => call.input.target === lpToken)

      token0 = token0_.output.toLowerCase()
      token1 = token1_.output.toLowerCase()
      supply = supply_.output
      //console.log(token0_, supply_, token1_, lpToken)
      if (supply === "0") {
        return
      }

      let _reserve0, _reserve1
      _reserve0 = (await lpReserves0).output.find(call => call.input.target === swap).output;
      _reserve1 = (await lpReserves1).output.find(call => call.input.target === swap).output;

      if (!excludeTokens.includes(token0)) {
        const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply))
        sdk.util.sumSingleBalance(balances, await transformAddress(token0), token0Balance.toFixed(0))
      }
      if (!excludeTokens.includes(token1)) {
        const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply))
        sdk.util.sumSingleBalance(balances, await transformAddress(token1), token1Balance.toFixed(0))
      }
    } catch (e) {
      sdk.log(e)
      console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
      throw e
    }
  }))
}

module.exports = {
  bsc: {
    tvl,
    staking: stakings(
      [
        "0x6F42895f37291ec45f0A307b155229b923Ff83F1",
        "0xB80287c110a76e4BbF0315337Dbc8d98d7DE25DB"
      ],
      "0xa045e37a0d1dd3a45fefb8803d22457abc0a728a",
      "bsc"
    )
  }
};
