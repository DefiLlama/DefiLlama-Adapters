const Web3 = require('web3')
const Caver = require('caver-js');
const axios = require('axios');
const web3 = require('../config/web3')

const DTokenAbi = require('./abi/DToken.json').abi;
const PriceOracleAbi = require('./abi/PriceOracleView.json').abi;
const StakingAbi = require('./abi/Staking.json').abi;
const VDONStakingAbi = require('./abi/VDONStaking.json').abi;
const ControllerAbi = require('./abi/Controller.json').abi;
const IERC20Abi = require('./abi/IERC20.json').abi;
const DERC20Abi = require('./abi/DERC20.json').abi;

const PriceOracleAddress = {
  ethereum : '0x44EA07640609E60Ad0CFC27E9D63b68a1E240a13',
  klaytn : '0x2299dCFdeC881f8B5169b7033b4bd2a6b337655F'
}

const controllerAddress = {
  ethereum : '0x55e41bc3a99aa24E194D507517b1e8b65eFdAa9e',
  klaytn : '0x35dc04eE1D6E600C0d13B21FdfB5C83D022CEF25'
}

const mainDTokenAddress = {
  ethereum : '0xEc0D3f28D37a3393cf09ee3aD446c485b6afDaA3',
  klaytn : '0xACC72a0cA4E85f79876eD4C5E6Ea29BE1cD26c2e' 
}


const stakings = [
  '0x4f2ED52bC4CbdE54e2b3547D3758474A21598D7c',
  '0x024510151204DeC56Cc4D54ed064f62efAC264d5',
  '0x2EacD2D7cF5Cba9dA031C0a9C5d7FDeDc056216C',
  '0x8c9886Aca8B6984c10F988078C5e1D91976dFD16',
] 

const VDONStakingAddress = '0x63D21dBD5A30940C605d77882D065736e8fffC94';

async function getDonkeySwapRatio() {
  return axios
  .post('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
    query: '{ pool(id: "0xe73fe82f905e265d26e4a5a3d36d0d03bc4119fc") { token0Price } }',
  })
  .then((res) => res.data.data.pool.token0Price);
}

async function staking() {
  let totalTvlKrw = 0;
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

  const donRatio = await getDonkeySwapRatio();
  const ethPrice = priceObj['ETH'];

  const donkeyPrice = Math.ceil(ethPrice / Math.floor(donRatio));
  priceObj['DON'] = donkeyPrice;

  for(let i=0; i<stakings.length; i++) {
    const address = stakings[i];
    const contract = new web3.eth.Contract(StakingAbi, address);
    const stakingMetaData = await contract.methods.stakingMetaData().call();
    const totalPrincipal = stakingMetaData['totalPrincipalAmount'] / 1e18;
    totalTvlKrw += totalPrincipal * priceObj['DON'];
  }

  const contract = new web3.eth.Contract(VDONStakingAbi, VDONStakingAddress);
  const productInfoList = await contract.methods.productInfoList().call();
  const totalPrincipal = productInfoList.reduce((accum, current) => {
    return accum + current['totalPrincipalAmount'] / 1e18;
  }, 0)
  totalTvlKrw += totalPrincipal * priceObj['DON']
  return totalTvlKrw / currency;
}

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

  const donRatio = await getDonkeySwapRatio();
  const ethPrice = priceObj['ETH'];
  const donkeyPrice = Math.ceil(ethPrice / Math.floor(donRatio));

  priceObj['DON'] = donkeyPrice;
  priceObj['kDON'] = donkeyPrice;

  let totalTvlKrw = 0;

  const controllerContrat = new web3.eth.Contract(ControllerAbi, controllerAddress.ethereum)
  const ethMarkets = await controllerContrat.methods.getAllMarkets().call();

  for(let i=0; i<ethMarkets.length; i++) {
    const marketAddress = ethMarkets[i];
    if(marketAddress === mainDTokenAddress.ethereum) {
      const contract = new web3.eth.Contract(DTokenAbi, marketAddress);
      const underlyingDecimals = 18;
      const cash = await contract.methods.getCash().call() / 1e18;
      const tvlKrw = cash * priceObj['ETH'];
      totalTvlKrw += tvlKrw;
    } else{
      const contract = new web3.eth.Contract(DERC20Abi, marketAddress);
      const underlyingAddress = await contract.methods.underlying().call();
      const underlyingContract = new web3.eth.Contract(IERC20Abi, underlyingAddress);
      const underlyingDecimals = await underlyingContract.methods.decimals().call();
      const cash = await contract.methods.getCash().call() / 10 ** underlyingDecimals;
      const underlyingSymbol = await contract.methods.underlyingSymbol().call();
      const tvlKrw = cash * priceObj[Web3.utils.hexToUtf8(underlyingSymbol)];
      totalTvlKrw += tvlKrw;
    }
  }

  const KLAYTN_ACCESS_KEY_ID = "KASK19AHMII2AZN1MAJDRFOU"
  const KLAYTN_SECRET_ACCESS_KEY = "I1Iwgwt1C6z_jA79eh6JBJKOHTGLIK-tAozkz-bl"

  const option = {
    headers: [
      {
        name: 'Authorization',
        value: `Basic ${Buffer.from(`${KLAYTN_ACCESS_KEY_ID}:${KLAYTN_SECRET_ACCESS_KEY}`).toString('base64')}`,
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

  const controllerContract = new caver.klay.Contract(ControllerAbi, controllerAddress.klaytn);
  const klaytnMarkets = await controllerContract.methods.getAllMarkets().call();

  for(let i=0; i<klaytnMarkets.length; i++) {
    const marketAddress = klaytnMarkets[i];
    if(marketAddress === mainDTokenAddress.klaytn) {
      const contract = new caver.klay.Contract(DTokenAbi, marketAddress);
      const underlyingDecimals = 18;
      const cash = await contract.methods.getCash().call() / 1e18;
      const tvlKrw = cash * klaytnPriceObj['KLAY'];
      totalTvlKrw += tvlKrw;
    } else {
      const contract = new caver.klay.Contract(DERC20Abi, marketAddress);
      const underlyingAddress = await contract.methods.underlying().call();
      const underlyingContract = new caver.klay.Contract(IERC20Abi, underlyingAddress);
      const underlyingDecimals = await underlyingContract.methods.decimals().call();
      const cash = await contract.methods.getCash().call() / 10 ** underlyingDecimals;
      const underlyingSymbol = await contract.methods.underlyingSymbol().call();
      const tvlKrw = cash * klaytnPriceObj[Web3.utils.hexToUtf8(underlyingSymbol)];
      totalTvlKrw += tvlKrw;
    }
  }
  return totalTvlKrw / currency;
}
fetch()

module.exports = {
  fetch,
  staking
}
