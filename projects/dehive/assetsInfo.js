const ADDRESSES = require('../helper/coreAssets.json')
// Auto generated at 9-2-2022 16:14
module.exports = {
  'ethereum' : [
    {//DHV (solo)
      meta: {
        stakingAddress: '0x04595f9010F79422a9b411ef963e4dd1F7107704', // StakingDHV
        tokenAddress: '0x62Dc4817588d53a056cBbD18231d91ffCcd34b2A', // DHV
        poolId: 0
      },
      tvl: "stakingDhvTvl"
    },
    {//DHV/ETH (lp)
      meta: {
        stakingAddress: '0x4964B3B599B82C3FdDC56e3A9Ffd77d48c6AF0f0', // StakingPools
        lpAddress: '0x60c5bf43140d6341bebfe13293567fafbe01d65b', // UNI-DHV-WETH
        dhvToken: '0x62Dc4817588d53a056cBbD18231d91ffCcd34b2A',
        underlying: [
          '0x62Dc4817588d53a056cBbD18231d91ffCcd34b2A', // DHV
          ADDRESSES.ethereum.WETH, // WETH
        ],
        isPool2: true,
        poolId: 0
      },
      tvl: "lpStakingTvl"
    },
    {//DECR (cluster)
      meta: {
        clusterAddress: '0x6Bc3F65Fc50E49060e21eD6996be96ee4B404752', // DECR
      },
      tvl: "clusterTvl"
    },
  ],
  'polygon' : [
    {//DHV (solo)
      meta: {
        stakingAddress: '0x88cFC1bc9aEb80f6C8f5d310d6C3761c2a646Df7', // StakingDHV
        tokenAddress: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26', // DHV
        poolId: 0
      },
      tvl: "stakingDhvTvl"
    },
    {//Stable Curve 3-Pool (impulse-multiple)
      meta: {
        stakingAddress: '0xE6E6982fb5dDF4fcc74cCCe4e4eea774E002D17F', // ImpulseMultiStaking
        poolId: 1
      },
      tvl: "crvStakingTvl"
    },
    {//Curve 5-Pool (impulse-multiple)
      meta: {
        stakingAddress: '0xE6E6982fb5dDF4fcc74cCCe4e4eea774E002D17F', // ImpulseMultiStaking
        poolId: 0
      },
      tvl: "crvStakingTvl"
    },
    {//DHV/QUICK (impulse)
      meta: {
        stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
        lpAddress: '0xfd0E242c95b271844bf6860D4bC0E3e136bC0f7C', // QCK-DHV-QUICK
        dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
        underlying: [
          '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26', // DHV
          '0x831753DD7087CaC61aB5644b308642cc1c33Dc13', // QUICK
        ],
        poolId: 0
      },
      tvl: "impulseStakingTvl"
    },
    {//WETH/DAI (impulse)
      meta: {
        stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
        lpAddress: '0x4A35582a710E1F4b2030A3F826DA20BfB6703C09', // QCK-WETH-DAI
        dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
        underlying: [
          ADDRESSES.polygon.WETH_1, // WETH
          ADDRESSES.polygon.DAI, // DAI
        ],
        poolId: 1
      },
      tvl: "impulseStakingTvl"
    },
    // COMMENTED THIS OUT BECAUSE 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT'
    // {//USDC/QUICK (impulse)
    //   meta: {
    //     stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
    //     lpAddress: '0x1F1E4c845183EF6d50E9609F16f6f9cAE43BC9Cb', // QCK-USDC-QUICK
    //     dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
    //     underlying: [
    //       ADDRESSES.polygon.USDC, // USDC
    //       '0x831753DD7087CaC61aB5644b308642cc1c33Dc13', // QUICK
    //     ],
    //     poolId: 2
    //   },
    //   tvl: "impulseStakingTvl"
    // },
    // COMMENTED THIS OUT BECAUSE 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT'
    // {//USDT/MAI (impulse)
    //   meta: {
    //     stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
    //     lpAddress: '0xE89faE1B4AdA2c869f05a0C96C87022DaDC7709a', // QCK-MAI-USDT
    //     dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
    //     underlying: [
    //       ADDRESSES.polygon.USDT, // USDT
    //       '0xa3fa99a148fa48d14ed51d610c367c61876997f1', // MAI
    //     ],
    //     poolId: 4
    //   },
    //   tvl: "impulseStakingTvl"
    // },
    {//AVAX/WETH (impulse)
      meta: {
        stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
        lpAddress: '0x1274De0DE2e9D9b1d0E06313c0E5EdD01CC335eF', // SUSHI-AVAX-WETH
        dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
        underlying: [
          '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b', // AVAX
          ADDRESSES.polygon.WETH_1, // WETH
        ],
        poolId: 5
      },
      tvl: "impulseStakingTvl"
    },
    {//WMATIC/WETH (impulse)
      meta: {
        stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
        lpAddress: '0xc4e595acDD7d12feC385E5dA5D43160e8A0bAC0E', // SUSHI-WMATIC-WETH
        dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
        underlying: [
          ADDRESSES.polygon.WMATIC_2, // WMATIC
          ADDRESSES.polygon.WETH_1, // WETH
        ],
        poolId: 6
      },
      tvl: "impulseStakingTvl"
    },
    {//CRV/WETH (impulse)
      meta: {
        stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
        lpAddress: '0x396E655C309676cAF0acf4607a868e0CDed876dB', // SUSHI-CRV-WETH
        dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
        underlying: [
          '0x172370d5Cd63279eFa6d502DAB29171933a610AF', // CRV
          ADDRESSES.polygon.WETH_1, // WETH
        ],
        poolId: 7
      },
      tvl: "impulseStakingTvl"
    },
    {//SNX/WETH (impulse)
      meta: {
        stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
        lpAddress: '0x116Ff0d1Caa91a6b94276b3471f33dbeB52073E7', // SUSHI-SNX-WETH
        dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
        underlying: [
          '0x50B728D8D964fd00C2d0AAD81718b71311feF68a', // SNX
          ADDRESSES.polygon.WETH_1, // WETH
        ],
        poolId: 8
      },
      tvl: "impulseStakingTvl"
    },
    {//WMATIC/GHST (impulse)
      meta: {
        stakingAddress: '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868', // ImpulseStaking
        lpAddress: '0xf69e93771F11AECd8E554aA165C3Fe7fd811530c', // SUSHI-WMATIC-GHST
        dhvToken: '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26',
        underlying: [
          ADDRESSES.polygon.WMATIC_2, // WMATIC
          '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7', // GHST
        ],
        poolId: 9
      },
      tvl: "impulseStakingTvl"
    },
    {//DPOL (cluster)
      meta: {
        clusterAddress: '0x4964B3B599B82C3FdDC56e3A9Ffd77d48c6AF0f0', // DPOL
      },
      tvl: "clusterTvl"
    },
    {//DGAME (cluster)
      meta: {
        clusterAddress: '0x589Ea336092184d9eD74b8263c4eecA73Ed0cE7a', // DGAME
      },
      tvl: "clusterTvl"
    },
  ],
  'bsc' : [
    {//DHV (solo)
      meta: {
        stakingAddress: '0x35f28aA0B2F34eFF17d2830135312ab2a777De36', // StakingDHV
        tokenAddress: '0x58759dd469ae5631c42cf8a473992335575b58d7', // DHV
        poolId: 0
      },
      tvl: "stakingDhvTvl"
    },
    {//DHV/BUSD (lp)
      meta: {
        stakingAddress: '0xF2e8CD1c40C766FEe73f56607fDffa526Ba8fa6c', // StakingPools
        lpAddress: '0x72ba008B631D9FD5a8E8013023CB3c05E19A7CA9', // PANCAKE-DHV-BUSD
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x58759dd469ae5631c42cf8a473992335575b58d7', // DHV
          ADDRESSES.bsc.BUSD, // BUSD
        ],
        isPool2: true,
        poolId: 0
      },
      tvl: "lpStakingTvl"
    },
    {//CAKE/BUSD (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0x804678fa97d91B974ec2af3c843270886528a9E6', // PANCAKE-CAKE-BUSD
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
          ADDRESSES.bsc.BUSD, // BUSD
        ],
        poolId: 0
      },
      tvl: "impulseStakingTvl"
    },
    {//USDT/USDC (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0xEc6557348085Aa57C72514D67070dC863C0a5A8c', // PANCAKE-BUSDT-USDC
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          ADDRESSES.bsc.USDT, // BUSDT
          ADDRESSES.bsc.USDC, // BUSDC
        ],
        poolId: 1
      },
      tvl: "impulseStakingTvl"
    },
    {//USDT/WBNB (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE', // PANCAKE-BUSDT-WBNB
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          ADDRESSES.bsc.USDT, // BUSDT
          ADDRESSES.bsc.WBNB, // WBNB
        ],
        poolId: 2
      },
      tvl: "impulseStakingTvl"
    },
    {//XVS/WBNB (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0x7EB5D86FD78f3852a3e0e064f2842d45a3dB6EA2', // PANCAKE-XVS-WBNB
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63', // XVS
          ADDRESSES.bsc.WBNB, // WBNB
        ],
        poolId: 3
      },
      tvl: "impulseStakingTvl"
    },
    {//ALPACA/BUSD (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0x7752e1FA9F3a2e860856458517008558DEb989e3', // PANCAKE-ALPACA-BUSD
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F', // ALPACA
          ADDRESSES.bsc.BUSD, // BUSD
        ],
        poolId: 4
      },
      tvl: "impulseStakingTvl"
    },
    {//LINK/WBNB (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0x824eb9faDFb377394430d2744fa7C42916DE3eCe', // PANCAKE-LINK-WBNB
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', // LINK
          ADDRESSES.bsc.WBNB, // WBNB
        ],
        poolId: 5
      },
      tvl: "impulseStakingTvl"
    },
    {//CAKE/USDT (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0xA39Af17CE4a8eb807E076805Da1e2B8EA7D0755b', // PANCAKE-CAKE-BUSDT
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
          ADDRESSES.bsc.USDT, // BUSDT
        ],
        poolId: 6
      },
      tvl: "impulseStakingTvl"
    },
    {//DODO/WBNB (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0xA9986Fcbdb23c2E8B11AB40102990a08f8E58f06', // PANCAKE-DODO-WBNB
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2', // DODO
          ADDRESSES.bsc.WBNB, // WBNB
        ],
        poolId: 7
      },
      tvl: "impulseStakingTvl"
    },
    {//BANANA/WBNB (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713', // APE-BANANA-WBNB
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95', // BANANA
          ADDRESSES.bsc.WBNB, // WBNB
        ],
        poolId: 8
      },
      tvl: "impulseStakingTvl"
    },
    {//BANANA/BUSD (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914', // APE-BANANA-BUSD
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95', // BANANA
          ADDRESSES.bsc.BUSD, // BUSD
        ],
        poolId: 9
      },
      tvl: "impulseStakingTvl"
    },
    {//TWT/WBNB (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0x4c48D692e3de076C7b844B956b28cdd1DD5C0945', // APE-TWT-WBNB
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x4B0F1812e5Df2A09796481Ff14017e6005508003', // TWT
          ADDRESSES.bsc.WBNB, // WBNB
        ],
        poolId: 10
      },
      tvl: "impulseStakingTvl"
    },
    {//AVAX/WBNB (impulse)
      meta: {
        stakingAddress: '0xA9c97Ff825dB9dd53056d65aE704031B4959d99a', // ImpulseStaking
        lpAddress: '0x40aFc7CBd0Dc2bE5860F0035b717d20Afb4827b2', // APE-AVAX-WBNB
        dhvToken: '0x58759dd469ae5631c42cf8a473992335575b58d7',
        underlying: [
          '0x1CE0c2827e2eF14D5C4f29a091d735A204794041', // AVAX
          ADDRESSES.bsc.WBNB, // WBNB
        ],
        poolId: 11
      },
      tvl: "impulseStakingTvl"
    },
    {//DBSC (cluster)
      meta: {
        clusterAddress: '0x0a684421ef48b431803BFd75F38675EAb1e38Ed5', // DBSC
      },
      tvl: "clusterTvl"
    },
  ],
  'xdai' : [
    {//DHV (solo)
      meta: {
        stakingAddress: '0x589Ea336092184d9eD74b8263c4eecA73Ed0cE7a', // StakingDHV
        tokenAddress: '0xFbdd194376de19a88118e84E279b977f165d01b8', // DHV
        poolId: 0
      },
      tvl: "stakingDhvTvl"
    },
    {//DHV/XDAI (lp)
      meta: {
        stakingAddress: '0xa4E7BE054000603B82B79208aC3eE5428554CaF6', // StakingPools
        lpAddress: '0x14EE6d20B8167eacb885F4F2F45C3Bf2d4FD06f4', // HONEY-DHV-WXDAI
        dhvToken: '0xFbdd194376de19a88118e84E279b977f165d01b8',
        underlying: [
          '0xFbdd194376de19a88118e84E279b977f165d01b8', // DHV
          ADDRESSES.xdai.WXDAI, // WXDAI
        ],
        isPool2: true,
        poolId: 1
      },
      tvl: "lpStakingTvl"
    },
    {//Stable Curve 3-Pool (impulse-multiple)
      meta: {
        stakingAddress: '0xfa7Ca14a28CD419a69E45e8416cA4FA87457aCE8', // ImpulseMultiStaking
        poolId: 0
      },
      tvl: "crvStakingTvl"
    },
    {//DXDC (cluster)
      meta: {
        clusterAddress: '0xF557B2B73b872E6d2F43826f9D77B7402A363Bc0', // DXDC
      },
      tvl: "clusterTvl"
    },
    {//DXIN (cluster)
      meta: {
        clusterAddress: '0xA6C090c5572f54d529B0839b8fd2D50a4afB1E6B', // DXIN
      },
      tvl: "clusterTvl"
    },
  ],
};

