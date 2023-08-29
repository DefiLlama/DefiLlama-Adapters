const ADDRESSES = require('../helper/coreAssets.json')
const Ss = {
  id: 'tez',
  name: 'Tezos',
  shortName: 'tez',
  decimals: 6,
  symbol: 'tez',
  targetSymbol: 'tez',
  unit: 'tez',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, ws = {
  id: 'YOU',
  name: 'Youves Governance YOU',
  shortName: 'YOU',
  decimals: 12,
  symbol: 'YOU',
  targetSymbol: 'YOU',
  unit: 'YOU',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Ts = {
  id: 'xtztzbtc',
  name: 'XTZ/tzBTC Liquidity Baking Token',
  shortName: 'tzBTC LB',
  decimals: 0,
  symbol: 'xtztzbtc',
  targetSymbol: 'XTZ/tzBTC LP',
  unit: 'XTZ/tzBTC LP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Bs = {
  id: 'tzbtc',
  name: 'tzBTC',
  shortName: 'tzBTC',
  decimals: 8,
  symbol: 'tzbtc',
  targetSymbol: 'tzBTC',
  unit: 'tzBTC',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 6,
  inputDecimalPlaces: 8
}, Rs = {
  id: 'kusd',
  name: 'Kolibri USD',
  shortName: 'kUSD',
  decimals: 18,
  symbol: 'kusd',
  targetSymbol: 'kUSD',
  unit: 'kUSD',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Ps = {
  id: 'usdtz',
  name: 'USDtz',
  shortName: 'USDtz',
  decimals: 6,
  symbol: 'usdtz',
  targetSymbol: 'USDtz',
  unit: 'USDtz',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Ds = {
  id: 'uUSD',
  name: 'youves uUSD',
  shortName: 'uUSD',
  decimals: 12,
  symbol: 'uUSD',
  targetSymbol: 'USD',
  unit: 'uUSD',
  impliedPrice: 1.25,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Fd = {
  id: 'usdt',
  name: 'USDt',
  shortName: 'USDt',
  decimals: 6,
  symbol: 'usdt',
  targetSymbol: 'USDt',
  unit: 'USDt',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, ks = {
  id: 'uDEFI',
  name: 'youves uDEFI',
  shortName: 'uDEFI',
  decimals: 12,
  symbol: 'uDEFI',
  targetSymbol: 'DEFI',
  unit: 'uDEFI',
  impliedPrice: 1.25,
  tokenId: 1,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Ns = {
  id: 'uBTC',
  name: 'youves uBTC',
  shortName: 'uBTC',
  decimals: 12,
  symbol: 'uBTC',
  targetSymbol: 'BTC',
  unit: 'uBTC',
  impliedPrice: 1.25,
  tokenId: 2,
  decimalPlaces: 6,
  inputDecimalPlaces: 8
}, Os = {
  id: 'plenty',
  name: 'Plenty',
  shortName: 'Plenty',
  decimals: 18,
  symbol: 'plenty',
  targetSymbol: 'plenty',
  unit: 'plenty',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, xs = {
  id: 'wusdc',
  name: 'wUSDC',
  shortName: 'wUSDC',
  decimals: 6,
  symbol: 'wusdc',
  targetSymbol: 'wUSDC',
  unit: 'wusdc',
  impliedPrice: 1,
  tokenId: 17,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Ms = {
  id: 'wwbtc',
  name: 'wwBTC',
  shortName: 'wwBTC',
  decimals: 8,
  symbol: 'wwbtc',
  targetSymbol: 'wwBTC',
  unit: 'wwbtc',
  impliedPrice: 1,
  tokenId: 19,
  decimalPlaces: 6,
  inputDecimalPlaces: 8
}, Us = {
  id: 'uusdwusdcLP',
  name: 'uUSD/wUSDC LP',
  shortName: 'uUSD/wUSDC LP',
  decimals: 12,
  symbol: 'uusdwusdcLP',
  targetSymbol: 'uUSD/wUSDC LP',
  unit: 'uusdwusdcLP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Qs = {
  id: 'ubtctzbtcLP',
  name: 'uBTC/tzBTC LP',
  shortName: 'uBTC/tzBTC LP',
  decimals: 12,
  symbol: 'ubtctzbtcLP',
  targetSymbol: 'uBTC/tzBTC LP',
  unit: 'ubtctzbtcLP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Ls = {
  id: 'tzbtcwwbtcLP',
  name: 'tzBTC/wWBTC LP',
  shortName: 'tzBTC/wWBTC LP',
  decimals: 8,
  symbol: 'tzbtcwwbtcLP',
  targetSymbol: 'tzBTC/wWBTC LP',
  unit: 'tzbtcwwbtcLP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Fs = {
  id: 'uusdyouLP',
  name: 'uUSD/YOU LP',
  shortName: 'uUSD/YOU LP',
  decimals: 12,
  symbol: 'uusdyouLP',
  targetSymbol: 'uUSD/YOU LP',
  unit: 'uusdyouLP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Gs = {
  id: 'uusdudefiLP',
  name: 'uUSD/uDEFI LP',
  shortName: 'uUSD/uDEFI LP',
  decimals: 12,
  symbol: 'uusdudefiLP',
  targetSymbol: 'uUSD/uDEFI LP',
  unit: 'uusdudefiLP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, js = {
  id: 'uusdkusdLP',
  name: 'uUSD/kUSD LP',
  shortName: 'uUSD/kUSD LP',
  decimals: 18,
  symbol: 'uusdkusdLP',
  targetSymbol: 'uUSD/kUSD LP',
  unit: 'uusdkusdLP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Hs = {
  id: 'uusdusdtzLP',
  name: 'uUSD/USDtz LP',
  shortName: 'uUSD/USDtz LP',
  decimals: 12,
  symbol: 'uusdusdtzLP',
  targetSymbol: 'uUSD/USDtz LP',
  unit: 'uusdusdtzLP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, Vs = {
  id: 'uusdubtcLP',
  name: 'uUSD/uBTC LP',
  shortName: 'uUSD/uBTC LP',
  decimals: 6,
  symbol: 'uusdubtcLP',
  targetSymbol: 'uUSD/uBTC LP',
  unit: 'uusdubtcLP',
  impliedPrice: 1,
  tokenId: 21,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
}, uT = {
  id: 'uusdusdtLP',
  name: 'uUSD/USDt LP',
  shortName: 'uUSD/USDt LP',
  decimals: 12,
  symbol: 'uusdusdtLP',
  targetSymbol: 'uUSD/USDt LP',
  unit: 'uusdusdtLP',
  impliedPrice: 1,
  tokenId: 0,
  decimalPlaces: 2,
  inputDecimalPlaces: 4
},
  Ws = {

    uusdusdtLP: Object.assign(Object.assign({
    }, uT), {
      contractAddress: 'KT1H41VCk8FgskYy4RbLXH8Fwt83PJ5MNvno'
    }),
    xtzToken: Object.assign(Object.assign({
    }, Ss), {
      contractAddress: 'EMPTY'
    }),
    youToken: Object.assign(Object.assign({
    }, ws), {
      contractAddress: ADDRESSES.tezos.YOU
    }),
    uusdToken: Object.assign(Object.assign({
    }, Ds), {
      contractAddress: ADDRESSES.tezos.uUSD
    }),
    udefiToken: Object.assign(Object.assign({
    }, ks), {
      contractAddress: ADDRESSES.tezos.uUSD
    }),
    ubtcToken: Object.assign(Object.assign({
    }, Ns), {
      contractAddress: ADDRESSES.tezos.uUSD
    }),
    tzbtcToken: Object.assign(Object.assign({
    }, Bs), {
      contractAddress: ADDRESSES.tezos.tzBTC
    }),
    kusdToken: Object.assign(Object.assign({
    }, Rs), {
      contractAddress: ADDRESSES.tezos.kUSD
    }),
    usdtzToken: Object.assign(Object.assign({
    }, Ps), {
      contractAddress: ADDRESSES.tezos.USDtz
    }),
    usdtToken: Object.assign(Object.assign({
    }, Fd), {
      contractAddress: ADDRESSES.tezos.USDt
    }),
    wusdcToken: Object.assign(Object.assign({
    }, xs), {
      contractAddress: ADDRESSES.tezos.AAVE
    }),
    wwbtcToken: Object.assign(Object.assign({
    }, Ms), {
      contractAddress: ADDRESSES.tezos.AAVE
    }),
    plentyToken: Object.assign(Object.assign({
    }, Os), {
      contractAddress: ADDRESSES.tezos.PLENTY
    }),
    tzbtcLP: Object.assign(Object.assign({
    }, Ts), {
      contractAddress: 'KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo'
    }),
    uusdwusdcLP: Object.assign(Object.assign({
    }, Us), {
      contractAddress: 'KT1Exm6UTCNEbBHANZ7S53t7QN8NJFwAytxg'
    }),
    tzbtcwwbtcLP: Object.assign(Object.assign({
    }, Ls), {
      contractAddress: 'KT1CuqpjqPPvcZCrvzJunCvHvPaujASdmFJZ'
    }),
    ubtctzbtcLP: Object.assign(Object.assign({
    }, Qs), {
      contractAddress: 'KT1TzHdwC4KHbGxsXVVvaxdrjVPgUsrHEgJr'
    }),
    uusdkusdLP: Object.assign(Object.assign({
    }, js), {
      contractAddress: 'KT1NZt7NTYs7m3VhB8rrua7WwVQ9uhKgpgCN'
    }),
    uusdusdtzLP: Object.assign(Object.assign({
    }, Hs), {
      contractAddress: 'KT1Toztq42271zT2wXDnu2hFVVdJJ8qWrETu'
    }),
    uusdubtcLP: Object.assign(Object.assign({
    }, Vs), {
      contractAddress: 'KT1VNEzpf631BLsdPJjt2ZhgUitR392x6cSi'
    }),
    uusdyouLP: Object.assign(Object.assign({
    }, Fs), {
      contractAddress: 'KT1Tmncfgpp4ZSp6aEogL7uhBqHTiKsSPegK'
    }),
    uusdudefiLP: Object.assign(Object.assign({
    }, Gs), {
      contractAddress: 'KT1RQvdYD9yc763j8FiVLyXbKPVVbZqGRx5m'
    })
  }, qs = [
    {
      token1: Ws.uusdToken,
      token2: Ws.usdtToken,
      lpToken: Ws.uusdusdtLP,
      rewardToken: Ws.youToken,
      farmContract: 'KT1USKq4gHFVs7WJSVsqKn8j8P4tmqZcgSbd',
      expectedWeeklyRewards: 1015,
    },
    {
      token1: Ws.wusdcToken,
      token2: Ws.uusdToken,
      lpToken: Ws.uusdwusdcLP,
      rewardToken: Ws.youToken,
      farmContract: 'KT1TkNadQ9Cw5ZNRyS4t9SKmUbmAMkqY8bkV',
      expectedWeeklyRewards: 0,
    },
    {
      token1: Ws.uusdToken,
      token2: Ws.ubtcToken,
      lpToken: Ws.uusdubtcLP,
      rewardToken: Ws.youToken,
      farmContract: 'KT1KGfEyxBeCU873RfuwrU1gy8sjC1s82WZV',
      expectedWeeklyRewards: 1000,
    },
    {
      token1: Ws.uusdToken,
      token2: Ws.kusdToken,
      lpToken: Ws.uusdkusdLP,
      rewardToken: Ws.youToken,
      farmContract: 'KT1HaWDWv7XPsZ54JbDquXV6YgyazQr9Jkp3',
      expectedWeeklyRewards: 1000,
    },
    {
      token1: Ws.uusdToken,
      token2: Ws.usdtzToken,
      lpToken: Ws.uusdusdtzLP,
      rewardToken: Ws.youToken,
      farmContract: 'KT1JFsKh3Wcnd4tKzF6EwugwTVGj3XfGPfeZ',
      expectedWeeklyRewards: 1000,
    },
    {
      token1: Ws.wusdcToken,
      token2: Ws.uusdToken,
      lpToken: Ws.uusdwusdcLP,
      rewardToken: Ws.youToken,
      farmContract: 'KT1Ug9wWbRuUs1XXRuK11o6syWdTFZQsmvw3',
      expectedWeeklyRewards: 1250,
    },
    {
      token1: Ws.uusdToken,
      token2: Ws.youToken,
      lpToken: Ws.uusdyouLP,
      rewardToken: Ws.youToken,
      farmContract: 'KT1Goz5Dsi8Hf7fqjx5nSEcjp6osD9ufECB2',
      expectedWeeklyRewards: 2000,
    },
    {
      token1: Ws.uusdToken,
      token2: Ws.udefiToken,
      lpToken: Ws.uusdudefiLP,
      rewardToken: Ws.youToken,
      farmContract: 'KT1W78rDHfwp3CKev7u7dWRJTBqLdwYVcPg9',
      expectedWeeklyRewards: 500,
    }
  ], Ys = [
    {
      token1: Ws.usdtToken,
      token2: Ws.uusdToken,
      contractAddress: 'KT1UJBvm4hv11Uvu6r4c8zE5K2EfmwiRVgsm',
      liquidityToken: Ws.uusdusdtLP
    },
    {
      token1: Ws.wusdcToken,
      token2: Ws.uusdToken,
      contractAddress: 'KT1JeWiS8j1kic4PHx7aTnEr9p4xVtJNzk5b',
      liquidityToken: Ws.uusdwusdcLP
    },
    {
      token1: Ws.tzbtcToken,
      token2: Ws.wwbtcToken,
      contractAddress: 'KT1T974a8qau4xP3RAAWPYCZM9xtwU9FLjPS',
      liquidityToken: Ws.tzbtcwwbtcLP
    },
    {
      token1: Ws.tzbtcToken,
      token2: Ws.ubtcToken,
      contractAddress: 'KT1XvH5f2ja2jzdDbv6rxPmecZFU7s3obquN',
      liquidityToken: Ws.ubtctzbtcLP
    },
    {
      token1: Ws.kusdToken,
      token2: Ws.uusdToken,
      contractAddress: 'KT1AVbWyM8E7DptyBCu4B5J5B7Nswkq7Skc6',
      liquidityToken: Ws.uusdkusdLP
    },
    {
      token1: Ws.usdtzToken,
      token2: Ws.uusdToken,
      contractAddress: 'KT1Xbx9pykNd38zag4yZvnmdSNBknmCETvQV',
      liquidityToken: Ws.uusdusdtzLP
    },
    {
      token1: Ws.xtzToken,
      token2: Ws.uusdToken,
      address: 'KT1EtjRRCBC2exyCRXz8UfV7jz7svnkqi7di'
    },
    {
      token1: Ws.xtzToken,
      token2: Ws.udefiToken,
      address: 'KT1H8sJY2VzrbiX4pYeUVsoMUd4iGw2DV7XH'
    },
    {
      token1: Ws.uusdToken,
      token2: Ws.youToken,
      address: 'KT1TnrLFrdemNZ1AnnWNfi21rXg7eknS484C'
    },
    {
      token1: Ws.uusdToken,
      token2: Ws.udefiToken,
      address: 'KT1EAw8hL5zseB3SLpJhBqPQfP9aWrWh8iMW'
    },
  ]

module.exports = {
  tokens: Ws,
  farms: qs,
  dexes: Ys,
}