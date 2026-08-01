const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { BigNumber } = require("bignumber.js");

const abiGrizzly = "uint256:grizzlyStrategyDeposits"
const abiStandard = "uint256:standardStrategyDeposits"
const abiStable = "uint256:stablecoinStrategyDeposits"
const abiFarm = "uint256:totalDeposits"
const abiYearn = "uint256:totalAssets"
const abiV3 = "function getUnderlyingBalances() view returns (uint256, uint256)"

const lpReservesAbi = 'function balances(uint256 index) view returns (uint256)'
const tokenAbi = 'function coins(uint256 index) view returns (address)'
const lpSuppliesAbi = "uint256:totalSupply"
const transformAddress = i => 'bsc:' + i

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

const pcsV3 = [
  {
    hive: "0x25223015ee4dbaf9525ddd43797cae1dcd83f6b5",
    token0: ADDRESSES.bsc.USDT,
    token1: ADDRESSES.bsc.BUSD
  },
  {
    hive: "0x9eab3bf245da9b6d8705b1a906ee228382c38f93",
    token0: ADDRESSES.bsc.USDT,
    token1: ADDRESSES.bsc.USDC
  },
  {
    hive: "0x76ab668d93135bcd64df8e4a7ab9dd05fac4cdbf",
    token0: ADDRESSES.bsc.USDC,
    token1: ADDRESSES.bsc.BUSD
  }
]

async function tvl(api) {
  const balances = api.getBalances();

  const getHive = i => i.hive

  const [hiveBalancesGrizzly,
    hiveBalancesStandard,
    hiveBalancesStable,
    stableHiveBalancesGrizzly,
    stableHiveBalancesStandard,
    stableHiveBalancesStable,
    farmBalances,
    yearnBalances,
    pcsV3Balances] = await Promise.all([
      api.multiCall({ calls: pcsHives.map(getHive), abi: abiGrizzly, }),
      api.multiCall({ calls: pcsHives.map(getHive), abi: abiStandard, }),
      api.multiCall({ calls: pcsHives.map(getHive), abi: abiStable, }),
      api.multiCall({ calls: stableHives.map(getHive), abi: abiGrizzly, }),
      api.multiCall({ calls: stableHives.map(getHive), abi: abiStandard, }),
      api.multiCall({ calls: stableHives.map(getHive), abi: abiStable, }),
      api.multiCall({ calls: farms.map(getHive), abi: abiFarm, }),
      api.multiCall({ calls: yearnHives.map(getHive), abi: abiYearn, }),
      api.multiCall({ calls: pcsV3.map(getHive), abi: abiV3, }),
    ]);

  hiveBalancesGrizzly.map((b, i) => {
    const token = pcsHives[i].token
    api.add(token, b)
    api.add(token, hiveBalancesStandard[i])
    api.add(token, hiveBalancesStable[i])
  });

  const lpPositionsStable = stableHiveBalancesGrizzly.map((b, i) => {
    const grizzly = new BigNumber(b);
    const standard = new BigNumber(stableHiveBalancesStandard[i]);
    const stable = new BigNumber(stableHiveBalancesStable[i]);

    return {
      balance: grizzly.plus(standard).plus(stable).toString(),
      token: stableHives[i].token,
      swap: stableHives[i].swap
    }
  });

  farmBalances.forEach((b, i) => api.add(farms[i].token, b));
  yearnBalances.forEach((b, i) => api.add(yearnHives[i].token, b));

  pcsV3Balances.forEach((b, i) => {
    api.add(pcsV3[i].token0, b[0])
    api.add(pcsV3[i].token1, b[1])
  });

  await unwrapStablePcsLPs(balances, lpPositionsStable, api)
  await unwrapLPsAuto({ ...api, balances, })
  return balances;
}

async function unwrapStablePcsLPs(balances, lpPositions, api) {
  lpPositions = lpPositions.filter(i => +i.balance > 0)
  const swaps = lpPositions.map(i => i.swap)

  const [
    lpReserves0,
    lpReserves1,
    lpSupplies,
    tokens0,
    tokens1,
  ] = await Promise.all([
    api.multiCall({ abi: lpReservesAbi, calls: swaps.map(i => ({ target: i, params: [0] })) }),
    api.multiCall({ abi: lpReservesAbi, calls: swaps.map(i => ({ target: i, params: [1] })) }),
    api.multiCall({ abi: lpSuppliesAbi, calls: lpPositions.map(i => i.token), }),
    api.multiCall({ abi: tokenAbi, calls: swaps.map(i => ({ target: i, params: [0] })), }),
    api.multiCall({ abi: tokenAbi, calls: swaps.map(i => ({ target: i, params: [1] })), }),
  ])


  lpPositions.map((lpPosition, i) => {
    const token0 = tokens0[i].toLowerCase()
    const token1 = tokens1[i].toLowerCase()
    const supply = lpSupplies[i]
    const _reserve0 = lpReserves0[i]
    const _reserve1 = lpReserves1[i]

    const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply))
    sdk.util.sumSingleBalance(balances, transformAddress(token0), token0Balance.toFixed(0))
    const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply))
    sdk.util.sumSingleBalance(balances, transformAddress(token1), token1Balance.toFixed(0))
  })
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl,
    staking: stakings(
      [
        "0x6F42895f37291ec45f0A307b155229b923Ff83F1",
        "0xB80287c110a76e4BbF0315337Dbc8d98d7DE25DB"
      ],
      "0xa045e37a0d1dd3a45fefb8803d22457abc0a728a",
    )
  }
};
