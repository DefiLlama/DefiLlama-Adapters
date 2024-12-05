const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

let pools = [
  {
    "name": "USDC (Portal)",
    "address": "0xc0ba93d4aaf90d39924402162ee4a213300d1d60",
    "tokens": [
      ADDRESSES.celo.cUSD,
      "0x37f750B7cC259A2f741AF45294f6a16572CF5cAd"
    ],
    "lp": "0xe10fd4788a76d19ba0110b1bfda5e13d35ed4359"
  },
  {
    "name": "Staked CELO",
    "address": "0xebf0536356256f8ff2a5eb6c65800839801d8b95",
    "tokens": [
      ADDRESSES.celo.CELO,
      "0xC668583dcbDc9ae6FA3CE46462758188adfdfC24"
    ],
    "lp": "0x4730ff6bc3008a40cf74d660d3f20d5b51646da3"
  },
  {
    "name": "UST (Allbridge)",
    "address": "0x9f4adbd0af281c69a582eb2e6fa2a594d4204cae",
    "tokens": [
      ADDRESSES.celo.cUSD,
      ADDRESSES.celo.atUST
    ],
    "lp": "0x9438e7281d7e3e99a9dd21e0ead9c6a254e17ab2"
  },
  {
    "name": "WETH (Optics V2)",
    "address": "0x74ef28d635c6c5800dd3cd62d4c4f8752daacb09",
    "tokens": [
      "0x2DEf4285787d58a2f811AF24755A8150622f4361",
      "0x122013fd7dF1C6F636a5bb8f03108E876548b455"
    ],
    "lp": "0x4ff08e2a4e7114af4b575aef9250144f95790982"
  },
  {
    "name": "USDC (Optics V2)",
    "address": "0x9906589ea8fd27504974b7e8201df5bbde986b03",
    "tokens": [
      ADDRESSES.celo.cUSD,
      "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a"
    ],
    "lp": "0x39b6f09ef97db406ab78d869471adb2384c494e3"
  },
  {
    "name": "DAI (Optics V2)",
    "address": "0xf3f65dfe0c8c8f2986da0fec159abe6fd4e700b4",
    "tokens": [
      ADDRESSES.celo.cUSD,
      ADDRESSES.celo.DAI
    ],
    "lp": "0x274dd2df039f1f6131419c82173d97770e6af6b7"
  },
  {
    "name": "WBTC (Optics V2)",
    "address": "0xaefc4e8cf655a182e8346b24c8abce45616ee0d2",
    "tokens": [
      "0xD629eb00dEced2a080B7EC630eF6aC117e614f1b",
      ADDRESSES.celo.WBTC
    ],
    "lp": "0x20d7274c5af4f9de6e8c93025e44af3979d9ab2b"
  },
  {
    "name": "pUSDC (Optics V2)",
    "address": "0xcce0d62ce14fb3e4363eb92db37ff3630836c252",
    "tokens": [
      ADDRESSES.celo.cUSD,
      "0x1bfc26cE035c368503fAE319Cc2596716428ca44"
    ],
    "lp": "0x68b239b415970dd7a5234a9701cbb5bfab544c7c"
  },
  {
    "name": "USDC (Optics V1)",
    "address": "0xa5037661989789d0310ac2b796fa78f1b01f195d",
    "tokens": [
      ADDRESSES.celo.cUSD,
      ADDRESSES.celo.USDC
    ],
    "lp": "0xd7bf6946b740930c60131044bd2f08787e1ddbd4"
  },
  {
    "name": "aaUSDC (Allbridge)",
    "address": "0x0986b42f5f9c42feeef66fc23eba9ea1164c916d",
    "tokens": [
      ADDRESSES.celo.cUSD,
      ADDRESSES.celo.aaUSDC
    ],
    "lp": "0x730e677f39c4ca96012c394b9da09a025e922f81"
  },
  {
    "name": "Poof cUSD V2",
    "address": "0xa2f0e57d4ceacf025e81c76f28b9ad6e9fbe8735",
    "tokens": [
      ADDRESSES.celo.cUSD,
      "0xEadf4A7168A82D30Ba0619e64d5BCf5B30B45226"
    ],
    "lp": "0x07e137e5605e15c93f22545868fa70cecfcbbffe"
  },
  {
    "name": "Poof CELO V2",
    "address": "0xfc9e2c63370d8deb3521922a7b2b60f4cff7e75a",
    "tokens": [
      ADDRESSES.celo.cUSD,
      "0x301a61D01A63c8D670c2B8a43f37d12eF181F997"
    ],
    "lp": "0xaffd8d6b5e5a0e25034dd3d075532f9ce01c305c"
  },
  {
    "name": "Poof cEUR V2",
    "address": "0x23c95678862a229fac088bd9705622d78130bc3e",
    "tokens": [
      "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
      "0xD8761DD6c7cB54febD33adD699F5E4440b62E01B"
    ],
    "lp": "0xec8e37876fd9de919b58788b87a078e546149f87"
  },
  {
    "name": "Poof cUSD V1",
    "address": "0x02db089fb09fda92e05e92afcd41d9aafe9c7c7c",
    "tokens": [
      ADDRESSES.celo.cUSD,
      "0xB4aa2986622249B1F45eb93F28Cfca2b2606d809"
    ],
    "lp": "0x18d71b8664e69d6dd61c79247dbf12bfaaf66c10"
  },
  {
    "name": "asUSDC (Allbridge)",
    "address": "0x63c1914bf00a9b395a2bf89aada55a5615a3656e",
    "tokens": [
      ADDRESSES.celo.cUSD,
      ADDRESSES.celo.asUSDC
    ],
    "lp": "0xafee90ab6a2d3b265262f94f6e437e7f6d94e26e"
  },
  {
    "name": "pUSDC (Optics V1)",
    "address": "0x2080aaa167e2225e1fc9923250ba60e19a180fb2",
    "tokens": [
      ADDRESSES.celo.cUSD,
      "0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941"
    ],
    "lp": "0xf5b454cf47caca418d95930aa03975ee4bf409bc"
  },
  {
    "name": "wBTC (Optics V1)",
    "address": "0x19260b9b573569ddb105780176547875fe9feda3",
    "tokens": [
      "0xD629eb00dEced2a080B7EC630eF6aC117e614f1b",
      "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE"
    ],
    "lp": "0x8cd0e2f11ed2e896a8307280deeee15b27e46bbe"
  },
  {
    "name": "wETH (Optics V1)",
    "address": "0xe0f2cc70e52f05edb383313393d88df2937da55a",
    "tokens": [
      "0x2DEf4285787d58a2f811AF24755A8150622f4361",
      "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4"
    ],
    "lp": "0x846b784ab5302155542c1b3952b54305f220fd84"
  },
  {
    "name": "USDT (Moss)",
    "address": "0xdbf27fd2a702cc02ac7acf0aea376db780d53247",
    "tokens": [
      ADDRESSES.celo.cUSD,
      ADDRESSES.celo.cUSDT
    ],
    "lp": "0xc7a4c6ef4a16dc24634cc2a951ba5fec4398f7e0"
  },
  {
    "name": "USDC (Moss)",
    "address": "0x0ff04189ef135b6541e56f7c638489de92e9c778",
    "tokens": [
      ADDRESSES.celo.cUSD,
      ADDRESSES.celo.cUSDC
    ],
    "lp": "0x635aec36c4b61bac5eb1c3eee191147d006f8a21"
  },
  {
    "name": "Poof Celo V1",
    "address": "0x413ffcc28e6cdde7e93625ef4742810fe9738578",
    "tokens": [
      ADDRESSES.celo.CELO,
      "0xE74AbF23E1Fdf7ACbec2F3a30a772eF77f1601E1"
    ],
    "lp": "0x4d6b17828d0173668e8eb730106444556a98c0f9"
  },
  {
    "name": "Poof cEUR V1",
    "address": "0x382ed834c6b7dbd10e4798b08889eaed1455e820",
    "tokens": [
      "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
      "0x56072D4832642dB29225dA12d6Fd1290E4744682"
    ],
    "lp": "0x2642ab16bfb7a8b36ee42c9cba2289c4ca9f33b9"
  },
  {
    "name": "Poof cUSD V1 [DISABLED]",
    "address": "0x81b6a3d9f725ab5d706d9e552b128bc5bb0b58a1",
    "tokens": [
      "0xB4aa2986622249B1F45eb93F28Cfca2b2606d809",
      "0xd7bf6946b740930c60131044bd2f08787e1ddbd4"
    ],
    "lp": "0x57f008172cf89b972db3db7dd032e66be4af1a8c"
  },
  {
    "name": "cUSD (Mento 1:1 Pool)",
    "address": "0xfa3df877f98ac5ecd87456a7accaa948462412f0",
    "tokens": [
      ADDRESSES.celo.cUSD,
      "0x37f750B7cC259A2f741AF45294f6a16572CF5cAd"
    ],
    "lp": "0x552b9aa0eee500c60f09456e49fbc1096322714c"
  }
]

// pools = []

const chain = 'celo'
async function tvl(_, _b, {[chain]: block }) {
  const tokensAndOwners = pools.map(i => i.tokens.map(t => ([t, i.address]))).flat()
  const lpTokens = pools.map(i => i.lp)
  return sumTokens2({ chain, block, tokensAndOwners, blacklistedTokens: lpTokens, })
}

module.exports = {
  celo: { tvl }
};
