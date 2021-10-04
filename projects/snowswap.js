const BigNumber = require("bignumber.js");
const web3 = require('./config/web3.js');
const curveAbis = require('./config/curve/abis.js')
const minAbi = require('./config/abis.js').abis.minABI
const utils = require('./helper/utils')

async function fetch() {
  const wBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
  const y2DAI = {addr: "0xacd43e627e64355f1861cec6d3a6688b31a6f952", dec: 18, getPrice: false, type: 'yv', pfsDec: 18} ///y2DAI                      yv
  const y2USDC = {addr: "0x597ad1e0c13bfe8025993d9e79c69e1c0233522e", dec: 6, getPrice: false, type: 'yv', pfsDec: 18} ///y2USDC                      yv
  const y2USDT = {addr: "0x2f08119c6f07c006695e079aafc638b8789faf18", dec: 6, getPrice: false, type: 'yv', pfsDec: 18} ///y2USDT                      yv
  const Y2TUSD = {addr: "0x37d19d1c4e1fa9dc47bd1ea12f742a0887eda74a", dec: 18, getPrice: false, type: 'yv', pfsDec: 18} ///Y2TUSD                      yv
  const yyDAIT = {addr: "0x5dbcf33d8c2e976c6b560249878e6f1491bca25c", dec: 18, getPrice: false, type: 'yv', pfsDec: 18} ///yyDAI+yUSDC+yUSDT+yTUSD    hbtc
  const yyDAIB = {addr: "0x2994529c0652d127b7842094103715ec5299bbed", dec: 18, getPrice: false, type: 'yv', pfsDec: 18} ///yyDAI+yUSDC+yUSDT+yBUSD    hbtc
  const WETH = {addr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dec: 18, get getPrice(){return this.addr}, type: ''} ///WETH                       crvETH
  const eCRV = {addr: "0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", dec: 18, getPrice: WETH.getPrice, type: ''} ///eCRV                       crvETH
  const steCRV = {addr: "0x06325440d014e39736583c165c2963ba99faf14e", dec: 18, getPrice: WETH.getPrice, type: ''} ///steCRV                      crvETH
  const ankrCRV = {addr: "0xaa17a236f2badc98ddc0cf999abb47d47fc0a6cf", dec: 18, getPrice: WETH.getPrice, type: ''} ///ankrCRV                    crvETH
  
  const usdc = {addr: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", dec: 6, getPrice: false, type: ''} ///fUSD
  const fUSDC = {addr: "0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe", dec: 6, getPrice: false, type: 'yv', pfsDec: 6} ///fUSD
  const fUSDT = {addr: "0x053c80ea73dc6941f518a68e2fc52ac45bde7c9c", dec: 6, getPrice: false, type: 'yv', pfsDec: 6} ///fUSD
  const fDAI = {addr: "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c", dec: 18, getPrice: false, type: 'yv', pfsDec: 18} ///fUSD

  const yvDAI = {addr: '0xda816459f1ab5631232fe5e97a05bbbb94970c95', dec: 18, getPrice: false, type: 'yv2', pfsDec: 18} ///yVault v3
  const yvUSDC = {addr: '0x5f18c75abdae578b483e5f43f12a39cf75b973a9', dec: 6, getPrice: false, type: 'yv2', pfsDec: 6} ///yVault v3
  const yvUSDT = {addr: '0x7da96a3891add058ada2e826306d812c638d87a7', dec: 6, getPrice: false, type: 'yv2', pfsDec: 6} ///yVault v3

  //    WETH                                                                                                      ///eth2SNOW
  const vETH2 = {addr: "0x898bad2774eb97cf6b94605677f43b41871410b1", dec: 18, getPrice: WETH.getPrice, type: ''} ///eth2SNOW
  const aETHc = {addr: "0xe95a203b1a91a908f9b9ce46459d101078c2c3cb", dec: 18, getPrice: WETH.getPrice, type: 'ankr', pfsDec: 18} ///eth2SNOW
  const CRETH2 = {addr: "0xcbc1065255cbc3ab41a6868c22d1f1c573ab89fd", dec: 18, getPrice: WETH.getPrice, type: ''} ///eth2SNOW


  const ycrvRenWSBTC = {addr: '0x7ff566e1d69deff32a7b244ae7276b9f90e9d0f6', dec: 18, getPrice: wBTC, type: 'yv', pfsDec: 18} ///btcSnow
  // TODO: the next should be yv
  const fcrvRenWBTC = {addr: '0x5f18c75abdae578b483e5f43f12a39cf75b973a9', dec: 18, getPrice: wBTC, type: '', pfsDec: 18} ///btcSnow
  
  const snow = {addr: '0xfe9a29ab92522d14fc65880d817214261d8479ae', dec: 18, get getPrice(){return this.addr}} ///Frosty

  let swaps = [
    {
      'name': 'yv',
      'addr': '0x4571753311e37ddb44faa8fb78a6df9a6e3c6c0b',
      'coins': [ y2DAI, y2USDC, y2USDT, Y2TUSD ],
      'abi': curveAbis.abis.abisBTC
    },
    {
      'name': 'hbtc',
      'addr': '0xbf7ccd6c446acfcc5df023043f2167b62e81899b',
      'coins': [yyDAIT, yyDAIB],
      'abi': curveAbis.abis.abisBTC
    },
    {
      'name': 'crvETH',
      'addr': '0x3820a21c6d99e57fb6a17ab3fbdbe22552af9bb0',
      'coins': [ WETH, eCRV, steCRV, ankrCRV ],
      // 'abi': abi
      'abi': curveAbis.abis.abiNew
    },
    {
      'name': 'fUSD',
      'addr': '0x8470281f5149eb282ce956d8c0e4f2ebbc0c21fc',
      'coins': [usdc, fUSDC, fUSDT, fDAI],
      'abi': curveAbis.abis.abiNew
    },
    {
      'name': 'yVault v3',
      'addr': '0x668e76F1E74e6391ed3fe947E923878109647879',
      'coins': [yvDAI, yvUSDC, yvUSDT],
      'abi': curveAbis.abis.abiNew
    },
    {
      'name': 'eth2SNOW',
      'addr': '0x16BEa2e63aDAdE5984298D53A4d4d9c09e278192',
      'coins': [WETH, vETH2, aETHc, CRETH2],
      'abi': curveAbis.abis.abiNew
    },
    {
      'name': 'btcSnow',
      'addr': '0xeF034645b9035C106acC04cB6460049D3c95F9eE',
      'coins': [ycrvRenWSBTC, fcrvRenWBTC],
      'abi': curveAbis.abis.abisBTC
    }
  ]
  const pools = [
    {
      'name': 'frosty',
      'addr': '0x7d2c8B58032844F222e2c80219975805DcE1921c',
      'coins': [snow]
    }
  ]

  var tvl = 0;
  const tokensForPrice = [WETH.getPrice, wBTC, snow.getPrice]
  const prices = await utils.getPricesFromContract(tokensForPrice);

  await Promise.all(
    pools.map(async pool => {
      await Promise.all(
        pool.coins.map(async coin => {
          var coinContract = new web3.eth.Contract(minAbi, coin.addr);
          const balance = await coinContract.methods.balanceOf(pool.addr).call()
          var poolAmount = await new BigNumber(balance).div(10 ** coin.dec).toFixed(2);

          if(coin.getPrice){
            poolAmount = poolAmount * prices.data[coin.getPrice].usd
          }
          tvl+=poolAmount
        }))
    }),
    swaps.map(async item => {
     await Promise.all(
       item.coins.map(async (coin, index) => {
         var dacontract = new web3.eth.Contract(item.abi, item.addr)
         var balance = await dacontract.methods.balances(index).call();
         var poolAmount = await new BigNumber(balance).div(10 ** coin.dec).toFixed(2);

         if (coin.type) {
           var multiplier = 1;
           switch (coin.type){
             case 'yv': // getPricePerFullShare
              var coinContract = new web3.eth.Contract(curveAbis.abis.yTokens, coin.addr);
              var virtualPrice = await coinContract.methods
              .getPricePerFullShare()
              .call();
              break;
            case 'yv2': // pricePerShare
              var coinContract = new web3.eth.Contract(yv2abi, coin.addr);
              var virtualPrice = await coinContract.methods
              .pricePerShare()
              .call();
              break;
            case 'ankr': // ratio
                var coinContract = new web3.eth.Contract(ankrAbi, coin.addr);
                var virtualPrice = await coinContract.methods
                .ratio()
                .call();
                break;
            default:
              virtualPrice = 1;
            }

             multiplier = await new BigNumber(virtualPrice)
             .div(10 ** coin.pfsDec)
             .toFixed(4);

           poolAmount = poolAmount * multiplier;
         }
         if(coin.getPrice){
          poolAmount = poolAmount * prices.data[coin.getPrice].usd
         }
         tvl += parseFloat(poolAmount )
       })
     )
   })
  )
  return tvl;
}

module.exports = {
  fetch
}

const yv2abi = [{"stateMutability":"view","type":"function","name":"pricePerShare","inputs":[],"outputs":[{"name":"","type":"uint256"}],"gas":77734}]
const ankrAbi = [{"inputs":[],"name":"ratio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
