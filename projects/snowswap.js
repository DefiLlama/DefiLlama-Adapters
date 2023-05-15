const ADDRESSES = require('./helper/coreAssets.json')
const { staking } = require('./helper/staking');
const { sumTokens2, } = require('./helper/unwrapLPs');

const wBTC = ADDRESSES.ethereum.WBTC
const y2DAI = { addr: "0xacd43e627e64355f1861cec6d3a6688b31a6f952", dec: 18, getPrice: false, type: 'yv', pfsDec: 18 } ///y2DAI                      yv
const y2USDC = { addr: "0x597ad1e0c13bfe8025993d9e79c69e1c0233522e", dec: 6, getPrice: false, type: 'yv', pfsDec: 18 } ///y2USDC                      yv
const y2USDT = { addr: "0x2f08119c6f07c006695e079aafc638b8789faf18", dec: 6, getPrice: false, type: 'yv', pfsDec: 18 } ///y2USDT                      yv
const Y2TUSD = { addr: "0x37d19d1c4e1fa9dc47bd1ea12f742a0887eda74a", dec: 18, getPrice: false, type: 'yv', pfsDec: 18 } ///Y2TUSD                      yv
const yyDAIT = { addr: "0x5dbcf33d8c2e976c6b560249878e6f1491bca25c", dec: 18, getPrice: false, type: 'yv', pfsDec: 18 } ///yyDAI+yUSDC+yUSDT+yTUSD    hbtc
const yyDAIB = { addr: "0x2994529c0652d127b7842094103715ec5299bbed", dec: 18, getPrice: false, type: 'yv', pfsDec: 18 } ///yyDAI+yUSDC+yUSDT+yBUSD    hbtc
const WETH = { addr: ADDRESSES.ethereum.WETH, dec: 18, get getPrice() { return this.addr }, type: '' } ///WETH                       crvETH
const eCRV = { addr: "0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", dec: 18, getPrice: WETH.getPrice, type: '' } ///eCRV                       crvETH
const steCRV = { addr: "0x06325440d014e39736583c165c2963ba99faf14e", dec: 18, getPrice: WETH.getPrice, type: '' } ///steCRV                      crvETH
const ankrCRV = { addr: "0xaa17a236f2badc98ddc0cf999abb47d47fc0a6cf", dec: 18, getPrice: WETH.getPrice, type: '' } ///ankrCRV                    crvETH

const usdc = { addr: ADDRESSES.ethereum.USDC, dec: 6, getPrice: false, type: '' } ///fUSD
const fUSDC = { addr: "0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe", dec: 6, getPrice: false, type: 'yv', pfsDec: 6 } ///fUSD
const fUSDT = { addr: "0x053c80ea73dc6941f518a68e2fc52ac45bde7c9c", dec: 6, getPrice: false, type: 'yv', pfsDec: 6 } ///fUSD
const fDAI = { addr: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c", dec: 18, getPrice: false, type: 'yv', pfsDec: 18 } ///fUSD

const yvDAI = { addr: '0xda816459f1ab5631232fe5e97a05bbbb94970c95', dec: 18, getPrice: false, type: 'yv2', pfsDec: 18 } ///yVault v3
const yvUSDC = { addr: '0x5f18c75abdae578b483e5f43f12a39cf75b973a9', dec: 6, getPrice: false, type: 'yv2', pfsDec: 6 } ///yVault v3
const yvUSDT = { addr: '0x7da96a3891add058ada2e826306d812c638d87a7', dec: 6, getPrice: false, type: 'yv2', pfsDec: 6 } ///yVault v3

//    WETH                                                                                                      ///eth2SNOW
const vETH2 = { addr: "0x898bad2774eb97cf6b94605677f43b41871410b1", dec: 18, getPrice: WETH.getPrice, type: '' } ///eth2SNOW
const aETHc = { addr: "0xe95a203b1a91a908f9b9ce46459d101078c2c3cb", dec: 18, getPrice: WETH.getPrice, type: 'ankr', pfsDec: 18 } ///eth2SNOW
const CRETH2 = { addr: "0xcbc1065255cbc3ab41a6868c22d1f1c573ab89fd", dec: 18, getPrice: WETH.getPrice, type: '' } ///eth2SNOW


const ycrvRenWSBTC = { addr: '0x7ff566e1d69deff32a7b244ae7276b9f90e9d0f6', dec: 18, getPrice: wBTC, type: 'yv', pfsDec: 18 } ///btcSnow
// TODO: the next should be yv
const fcrvRenWBTC = { addr: '0x5f18c75abdae578b483e5f43f12a39cf75b973a9', dec: 18, getPrice: wBTC, type: '', pfsDec: 18 } ///btcSnow

const polyDai = { addr: ADDRESSES.polygon.DAI, dec: 18, getPrice: false } ///penguin
const polyUsdc = { addr: ADDRESSES.polygon.USDC, dec: 6, getPrice: false } ///penguin
const polyUSDT = { addr: ADDRESSES.polygon.USDT, dec: 6, getPrice: false } ///penguin

const snow = { addr: '0xfe9a29ab92522d14fc65880d817214261d8479ae', dec: 18, get getPrice() { return this.addr } } ///Frosty

const polySnow = { addr: "0x33c9f7c0afe2722cb9e426360c261fb755b4483d", dec: 18, getPrice: snow.getPrice }; /// Olaf's

let swaps = [
  {
    'name': 'yv',
    'addr': '0x4571753311e37ddb44faa8fb78a6df9a6e3c6c0b',
    'coins': [y2DAI, y2USDC, y2USDT, Y2TUSD],
  },
  {
    'name': 'hbtc',
    'addr': '0xbf7ccd6c446acfcc5df023043f2167b62e81899b',
    'coins': [yyDAIT, yyDAIB],
  },
  {
    'name': 'crvETH',
    'addr': '0x3820a21c6d99e57fb6a17ab3fbdbe22552af9bb0',
    'coins': [WETH, eCRV, steCRV, ankrCRV],
  },
  {
    'name': 'fUSD',
    'addr': '0x8470281f5149eb282ce956d8c0e4f2ebbc0c21fc',
    'coins': [usdc, fUSDC, fUSDT, fDAI],
  },
  {
    'name': 'yVault v3',
    'addr': '0x668e76F1E74e6391ed3fe947E923878109647879',
    'coins': [yvDAI, yvUSDC, yvUSDT],
  },
  {
    'name': 'eth2SNOW',
    'addr': '0x16BEa2e63aDAdE5984298D53A4d4d9c09e278192',
    'coins': [WETH, vETH2, aETHc, CRETH2],
  },
  {
    'name': 'btcSnow',
    'addr': '0xeF034645b9035C106acC04cB6460049D3c95F9eE',
    'coins': [ycrvRenWSBTC, fcrvRenWBTC],
  }
]
const pools = [
  {
    'name': 'penguin',
    'addr': '0x6852E7399C6cC73256Ca46A4921e1c7b2682D912',
    'coins': [polyDai, polyUsdc, polyUSDT],
    'chain': 'polygon'
  }
]

async function polygon(ts, _block, { polygon: block }, { api }) {
  const poolsPolygon = pools.filter(p => p.chain === "polygon")
  const toa = []
  poolsPolygon.forEach(pool => {
    pool.coins.map(coin => toa.push([coin.addr, pool.addr]))
  })
  return sumTokens2({ api, tokensAndOwners: toa, })
}

async function ethereum(ts, block, _, { api }) {
  const toa = []
  swaps.map(({ addr, coins }) => {
    coins.forEach(i => toa.push([i.addr, addr]))
  })
  return sumTokens2({ api, tokensAndOwners: toa, })
}

module.exports = {
  ethereum: {
    tvl: ethereum,
    staking: staking('0x7d2c8B58032844F222e2c80219975805DcE1921c', snow.addr)
  },
  polygon: {
    tvl: polygon
  },
}
