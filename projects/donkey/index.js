const Web3 = require('web3')
const Caver = require('caver-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path')
dotenv.config({path : path.resolve(__dirname, "../../env.sample")});

const DTokenAbi = require('./abi/DToken.json').abi;
const PriceOracleAbi = require('./abi/PriceOracleView.json').abi

const PriceOracleAddress = {
  ethereum : '0x44EA07640609E60Ad0CFC27E9D63b68a1E240a13',
  klaytn : '0x2299dCFdeC881f8B5169b7033b4bd2a6b337655F'
}

const ethMarkets = [
  {
    symbol: 'dKNC',
    underlyingSymbol: 'KNC',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xCC62B24a9fC939502feE6269402329b90C91b847',
  },
  {
    symbol: 'dSNT',
    underlyingSymbol: 'SNT',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xeB167917A8f2Bf28d22CaBb03EC597c386E04079',
  },
  {
    symbol: 'dPOLY',
    underlyingSymbol: 'POLY',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x30635728B43596Fd07A855af332f82cFFa95D80B',
  },
  {
    symbol: 'dAXS',
    underlyingSymbol: 'AXS',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xBBdc8d915BF30d53df420eCb5dc2D8FB4538Ed8a',
  },
  {
    symbol: 'dELF',
    underlyingSymbol: 'ELF',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xf732FdDb3c5cC0aD7215D3dB4875a94E67a09C26',
  },
  {
    symbol: 'dOMG',
    underlyingSymbol: 'OMG',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x6a4FB30DcB6fc184ACF3c306081930f234d5A143',
  },
  {
    symbol: 'dWBTC',
    underlyingSymbol: 'WBTC',
    decimals: 8,
    underlyingDecimals: 8,
    contractAddress: '0x3a52e4863c52D15b384Be651939f8E33eE69716A',
  },
  {
    symbol: 'dHUNT',
    underlyingSymbol: 'HUNT',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x8622f8d39cAEA7f85EE1d50aF2e4479fa2012923',
  },
  {
    symbol: 'dETH',
    underlyingSymbol: 'ETH',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xEc0D3f28D37a3393cf09ee3aD446c485b6afDaA3',
  },
  {
    symbol: 'dUSDT',
    underlyingSymbol: 'USDT',
    decimals: 8,
    underlyingDecimals: 6,
    contractAddress: '0x3f5fA4Ba2e595230c3E89543f404631429D0DD26',
  },
  {
    symbol: 'dLINK',
    underlyingSymbol: 'LINK',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x8DE66D3CBb0e660EF48165F7Ef4EA35ad9625765',
  },
  {
    symbol: 'dTON',
    underlyingSymbol: 'TON',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x6D827EbB2d6303Ff38AeA22146B9799a846904c1',
  },
  {
    symbol: 'dCHZ',
    underlyingSymbol: 'CHZ',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x1c07bcA0ceE9FF1b93057D8af98f18D1C1E203C5',
  },
  {
    symbol: 'dMANA',
    underlyingSymbol: 'MANA',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x1dca9c08E493A6a2A5ef2E3cbeD0Df2380245511',
  },
  {
    symbol: 'dSAND',
    underlyingSymbol: 'SAND',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xB2ec0d90561044aA8f09844daF417C59bE5345d1',
  },
  {
    symbol: 'dSTORJ',
    underlyingSymbol: 'STORJ',
    decimals: 8,
    underlyingDecimals: 8,
    contractAddress: '0xc31A07bD0792f8fE556D607776ff4F6570eFc3d5',
  },
  {
    symbol: 'dBORA',
    underlyingSymbol: 'BORA',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x9D6DaE758d5C2E81ea4D813caD0056e0de59c5b2',
  },
  {
    symbol: 'dCBK',
    underlyingSymbol: 'CBK',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x45f9BE645c19f07c5643599435A7b106e5D8A79c',
  },
  {
    symbol: 'dPLA',
    underlyingSymbol: 'PLA',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x9Dc533e6c168e153F0241E36E31436387631b1da',
  },
  {
    symbol: 'dMTL',
    underlyingSymbol: 'MTL',
    decimals: 8,
    liquidationIncentive: 1.1,
    underlyingDecimals: 8,
    contractAddress: '0x303f5b535CBC47836D4bc8bcE99992B8d7987E43',
  },
  {
    symbol: 'dSRM',
    underlyingSymbol: 'SRM',
    decimals: 8,
    underlyingDecimals: 6,
    contractAddress: '0x922bb502dE4F82C61E96133f92286b291056E356',
  },
  {
    symbol: 'dDON',
    underlyingSymbol: 'DON',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xc1d7187A3ab7828443A218071b9c71b51044bF2d',
  },
  {
    symbol: 'dSTPT',
    underlyingSymbol: 'STPT',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x76081093616e8cba6fb3822357e3Af1FDB8E5faF',
  },
]

const klaytnMarkets = [
  {
    symbol: 'dKLAY',
    underlyingSymbol: 'KLAY',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xACC72a0cA4E85f79876eD4C5E6Ea29BE1cD26c2e',
  },
  {
    symbol: 'dKSP',
    underlyingSymbol: 'KSP',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xC820e7b1EC1077Da8667149632A1A41a506cA690',
  },
  {
    symbol: 'dKETH',
    underlyingSymbol: 'KETH',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x4Ca4282C39Fe621152244eA693c28Fbe2Aa78a18',
  },
  {
    symbol: 'dKUSDT',
    underlyingSymbol: 'KUSDT',
    decimals: 8,
    underlyingDecimals: 6,
    contractAddress: '0xC55F4F5fe1EE6C4C2f391fDc28e31445cDBf58af',
  },
  {
    symbol: 'dKXRP',
    underlyingSymbol: 'KXRP',
    decimals: 8,
    underlyingDecimals: 6,
    contractAddress: '0x26105e8880473bc53D591baAf0Fbf3995D1B4a3A',
  },
  {
    symbol: 'dKWBTC',
    underlyingSymbol: 'KWBTC',
    decimals: 8,
    underlyingDecimals: 8,
    contractAddress: '0x12b472a6250B7536183ce6eA25D4219c5d0cC3c0',
  },
  {
    symbol: 'dkDON',
    underlyingSymbol: 'kDON',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x1E935b6A81208DBA26a8063277551886625E0bE6',
  },
  {
    symbol: 'dKUSDC',
    underlyingSymbol: 'KUSDC',
    decimals: 8,
    underlyingDecimals: 6,
    contractAddress: '0x4B3000BbBb19a0B009C12a8a1117B6fDF208595c',
  },
  {
    symbol: 'dKDAI',
    underlyingSymbol: 'KDAI',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0x5B0B4772865F54C8662067D36B77A2ADC2E05929',
  },
  {
    symbol: 'dWEMIX',
    underlyingSymbol: 'WEMIX',
    decimals: 8,
    underlyingDecimals: 18,
    contractAddress: '0xE537a7658700537589E00EA8f772F7cC1050CfCE',
  }, 
]

async function fetch() {
  const result = await axios.get('https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD');
  const currency = result.data[0].basePrice;

  const web3 = new Web3(process.env.ETHEREUM_RPC);
  const priceOracleContract = new web3.eth.Contract(PriceOracleAbi, PriceOracleAddress.ethereum);
  const { 0 : symbols, 1 : prices} = await priceOracleContract.methods.getPrices().call();

  const priceObj = symbols.reduce((accum, symbol, index) => {
    return {
      ...accum,
      [Web3.utils.hexToUtf8(symbol)] : prices[index]
    }
  }, {});

  let totalTvlKrw = 0;

  for(let i=0; i<ethMarkets.length; i++) {
    const market = ethMarkets[i];
    const contract = new web3.eth.Contract(DTokenAbi, market.contractAddress);
    const totalSupply = await contract.methods.totalSupply().call() / 10 ** market.underlyingDecimals;
    const exchangeRate = await contract.methods.exchangeRateCurrent().call() / 1e18;
    const cash = totalSupply * exchangeRate;
    const tvlKrw = cash * priceObj[market.underlyingSymbol];
    totalTvlKrw += tvlKrw;
  }

  const option = {
    headers: [
      {
        name: 'Authorization',
        value: `Basic ${Buffer.from(`${process.env.KLAYTN_ACCESS_KEY_ID}:${process.env.KLAYTN_SECRET_ACCESS_KEY}`).toString('base64')}`,
      },
      { name: 'x-chain-id', value: '8217' },
    ],
    keepAlive: false,
  };

  const provider = new Caver.providers.HttpProvider('https://node-api.klaytnapi.com/v1/klaytn', option);
  const caver = new Caver(provider);
  const klaytnPriceOracleContract = new caver.klay.Contract(PriceOracleAbi, PriceOracleAddress.klaytn);
  const { 0 : klaytnSymbols, 1 : klaytnPrices} = await klaytnPriceOracleContract.methods.getPrices().call();

  const klaytnPriceObj = klaytnSymbols.reduce((accum, symbol, index) => {
    return {
      ...accum,
      [Web3.utils.hexToUtf8(symbol)] : klaytnPrices[index]
    }
  }, {})

  for(let i=0; i<klaytnMarkets.length; i++) {
    const market = klaytnMarkets[i];
    const contract = new caver.klay.Contract(DTokenAbi, market.contractAddress);

    const totalSupply = await contract.methods.totalSupply().call() / 10 ** market.underlyingDecimals;
    const exchangeRate = await contract.methods.exchangeRateCurrent().call() / 1e18;
    const cash = totalSupply * exchangeRate;

    const tvlKrw = cash * klaytnPriceObj[market.underlyingSymbol];
    totalTvlKrw += tvlKrw
  }
  
  return totalTvlKrw * currency;
}

fetch();

