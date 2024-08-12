const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');

const owners = [
'bc1ql6yu2xywnmslnameu6376wzut4nwnafdj483ez',
'bc1q7uf083n9rsn8zgds0eg9kyzugjcz7pe4sq2jzf',
'bc1ql54ftzuh6k76wcn7330vlwxahhth8lqjc55lkc',
'bc1qhq052tz9pvjp4x2vu6ndc4rlpxesc9dz37uqt5',
'bc1q3rtrkav9l6m0e5vxya77mtlvqh8rk0eyf74277',
'bc1qde4ggwj2jp5tetjztfml3peyvwzvpwtr9ng6we',
'bc1qrzk68h8l2kvkvky00l8xvwz45pr4mmtyfpf0j8',
'bc1qkza8dm07rr5pxedam5w5v5g627j0lrwwzncsvd',
'bc1qrw5tn47ea05seyetlywltrdk06rldpk746etc9',
'bc1qcwkzqwfyqc7frec2g0rmjlrsw3d8vdwxrksn62',
'bc1qpdrzltkxg742jk8tr0pe7hltkme5p25ezmllz6',
'bc1qpqrm609emjpl35v2fu3frq0r87d29vm8ffygkf',
'bc1qhqlyelhwffrwdz4xzfe5whqxxft8quzvdscc8g',
'bc1qpaz0dp264pakv6f6ljmg2f3x27xmsj6la33mhc',
'bc1q9alywjvrsxu024a2m25lltl6h070l6lqfya45c',
'bc1q8cwt90ck2uvzwqj7q3dwvwclnprz7rk4qzk05k',
'bc1q2xygt58u9r6hc32uxruh93ap8q9898rep04xdk',
'bc1q4rheadle4sgdgdatkeuqfm90qv3wpkd7q8yp0m',
'bc1qrflqxl5pwet9tgv4uex6a6srmh3u4cvefeq0h6',
'bc1qqu0nw5n5n6uvjw5m3hwh8zvzckd8cnth8nt80k',
'bc1q3las75huex5jjhunheqycegw2x8fvhc6y0q3nu',
]

module.exports = {
  methodology: "BTC on btc chain",
  ethereum: {tvl: () =>  ({}) },
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners }),
    ]),
  },
};
