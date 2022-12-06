
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const v1abi = require('./v1Abi.json');
const utils = require("../helper/utils");
// const BigNumber = require('bignumber.js');
const { BigNumber } = require("ethers");
const { ethers } = require("ethers")
const { lendingMarket } = require('../helper/methodologies')

// cache some data
const finalOutput = {}
// const oracleAddress = '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
const markets = [
  {
    underlying: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    symbol: 'DAI',
    decimals: 18,
    cToken: '0x7a668F56AffD511FFc83C31666850eAe9FD5BCC8',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  },
  {
    underlying: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    symbol: 'USDC',
    decimals: 6,
    cToken: '0x5E3F2AbaECB51A182f05b4b7c0f7a5da1942De90',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  },
  {
    underlying: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    symbol: 'WBTC',
    decimals: 8,
    cToken: '0xD2835B08795adfEfa0c2009B294ae84B08C6a67e',//cWBTC - legacy
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  },
  {
    underlying: '0x0',
    symbol: 'ETH',
    decimals: 18,
    cToken: '0xb4d58C1F5870eFA4B05519A72851227F05743273',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  }, //cETH => WETH
  {
    underlying: '0x5326e71ff593ecc2cf7acae5fe57582d6e74cff1',
    symbol: 'plvGLP',
    decimals: 18,
    cToken: '0xCC25daC54A1a62061b596fD3Baf7D454f34c56fF',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  },
  {
    underlying: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    symbol: 'USDT',
    decimals: 6,
    cToken: '0xeB156f76Ef69be485c18C297DeE5c45390345187',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  },
  {
    underlying: '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
    symbol: 'FRAX',
    decimals: 18,
    cToken: '0x5FfA22244D8273d899B6C20CEC12A88a7Cd9E460',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  },
  {
    underlying: '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a',
    symbol: 'MIM',
    decimals: 18,
    cToken: '0x46178d84339A04f140934EE830cDAFDAcD29Fba9',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  },
  {
    underlying: '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55',
    symbol: 'DPX',
    decimals: 18,
    cToken: '0xc33cCF8d387DB5e84De13496E40DD83934F3251B',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  },
  {
    underlying: '0x539bde0d7dbd336b79148aa742883198bbf60342',
    symbol: 'MAGIC',
    decimals: 18,
    cToken: '0x12997C5C005acc6933eDD5e91D9338e7635fc0BB',
    oracle: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A'
  }
];

const CTOKEN_WETH = '0xb4d58C1F5870eFA4B05519A72851227F05743273'.toLowerCase()

// ask comptroller for all markets array
async function getAllCTokens() {
  return (await sdk.api.abi.call({
    target: '0x8f2354F9464514eFDAe441314b8325E97Bf96cdc',
    params: [],
    abi: abi['getAllMarkets'],
    chain: "arbitrum"
  })).output;
}

async function getMarkets(block) {
  if (block < 10271924) {
    // the allMarkets getter was only added in this block.
    return markets;
  } else {
    const markets = [{
      cToken: CTOKEN_WETH,
      underlying: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', //cETH => WETH
    }]

    const allCTokens = await getAllCTokens()
    const calls = allCTokens.filter(i => i.toLowerCase() !== CTOKEN_WETH).map(i => ({ target: i }))
    const { output } = await sdk.api.abi.multiCall({
      abi: abi['underlying'], calls, chain: "arbitrum",
    })
    output.forEach(({ input: { target: cToken }, output: underlying}) => markets.push({ cToken, underlying, }))
    // const { decimals } = await sdk.api.abi.multiCall({
    //   abi: abi['underlying'], calls, chain: "arbitrum",
    // })
    return markets;
  }
}


async function tvl(timestamp, block) {
  let balance = calculateTVLUSD();
  // await v1Tvl(balances, block, false)
  // await v2Tvl(balances, block, false)
  return balance;
}

async function calculateTVLUSD() {
  let finalOutput = {}

  // TODO: get markets, underlying, and decimals
  // and build into above markets shape dynamically once below calculation is working

  // let markets = await getMarkets()
  // console.log(markets)

  // gather borrows
  let cTokenBorrows = (
    await sdk.api.abi.multiCall({
      calls: markets.map((token) => ({ target: token.cToken })),
      abi: abi['totalBorrows'],
      chain: "arbitrum"
    })
  ).output;

  cTokenBorrows.forEach((ctoken) => {
    finalOutput[ctoken.input.target] = {'borrowAmount': ctoken.output}
  })

  // gather cash values
  let cashValues = (
    await sdk.api.abi.multiCall({
      calls: markets.map((token) => ({ target: token.cToken })),
      abi: abi['getCash'],
      chain: "arbitrum"
    })
  ).output;
  
  cashValues.forEach((ctoken) => {
    finalOutput[ctoken.input.target] = Object.assign({}, {'cashAmount': ctoken.output}, finalOutput[ctoken.input.target])
  })

  // gather underlyingPrices
  let underlyingPrices = (
    await sdk.api.abi.multiCall({
      calls: markets.map((token) => ({ target: token.oracle, params: token.cToken })),
      abi: abi['getUnderlyingPrice'],
      chain: "arbitrum"
    })
  ).output;

  underlyingPrices.forEach((ctoken) => {
    // console.log('top', ctoken.input.params[0])
    finalOutput[ctoken.input.params[0]] = Object.assign({}, {'oraclePrice': ctoken.output}, finalOutput[ctoken.input.params[0]])
  })

  for (const [key, value] of Object.entries(markets)) {
    finalOutput[value['cToken']] = Object.assign({}, {'decimals': value['decimals']}, finalOutput[value['cToken']])
  }

  let usdcPrice = (
    await sdk.api.abi.call({
      target: '0xcC3D0d211dF6157cb94b5AaCfD55D41acd3a9A7A',
      params: '0x5E3F2AbaECB51A182f05b4b7c0f7a5da1942De90',
      abi: abi['getUnderlyingPrice'],
      chain: "arbitrum"
    })
  ).output;

  finalOutput.usdcPrice = usdcPrice

  try {
    for (const [key, value] of Object.entries(finalOutput)) {
      if (value['borrowAmount']) {
        let borrowAmount = ethers.BigNumber.from((value['borrowAmount']).toString());
        let cashAmount = ethers.BigNumber.from((value['cashAmount']).toString());
        let oraclePrice = ethers.BigNumber.from((value['oraclePrice']).toString());

        const underlyingDecimals = value['decimals'];
        const decimalScale = 18 - underlyingDecimals;
        const decimalExp = (10 ** decimalScale).toString();
        let denominator = ethers.BigNumber.from(decimalExp);

        let borrowAmountInETH = borrowAmount.mul(oraclePrice).div(denominator);
        let cashAmountInETH = cashAmount.mul(oraclePrice).div(denominator);
        let summedAmountInETH = cashAmountInETH.add(borrowAmountInETH);
        // console.log('cashAmountInETH', cashAmountInETH)
        finalOutput[key] = Object.assign({}, {'cashAmountInETH': cashAmountInETH}, finalOutput[key]);
        finalOutput[key] = Object.assign({}, {'borrowAmountInETH': borrowAmountInETH}, finalOutput[key]);
        finalOutput[key] = Object.assign({}, {'summedAmountInETH': summedAmountInETH}, finalOutput[key]);
      }
    }
  } catch(error) {
    console.log('hit an error iterating finalOutput', error)
  };

  try {
    let tvlInETH = ethers.BigNumber.from(0);
    console.log('starting tvlInETH', tvlInETH)
    for (const [key, value] of Object.entries(finalOutput)) {
      let _summedAmountInETH = value['summedAmountInETH'];
      // console.log('_summedAmountInETHhere', key, _summedAmountInETH)
      // console.log('_usdcPrice here', key, _usdcPrice)

      // ignore the usdcPrice entry and any others that aren't token related
      // sum up everything else
      if (_summedAmountInETH) {
        tvlInETH = tvlInETH.add(_summedAmountInETH)
        // console.log('tvlInETH', tvlInETH)
      }
      // let cashAmount = ethers.BigNumber.from((value['cashAmount']).toString());
      // let oraclePrice = ethers.BigNumber.from((value['oraclePrice']).toString());

      // const underlyingDecimals = value['decimals'];
      // const decimalScale = 18 - underlyingDecimals;
      // const decimalExp = (10 ** decimalScale).toString();
      // let denominator = ethers.BigNumber.from(decimalExp);

      // let borrowAmountInETH = borrowAmount.mul(oraclePrice).div(denominator);
      // let cashAmountInETH = cashAmount.mul(oraclePrice).div(denominator);
      // let summedAmountInETH = cashAmountInETH.add(borrowAmountInETH);
      // // console.log('cashAmountInETH', cashAmountInETH)
      // finalOutput[key] = Object.assign({}, {'cashAmountInETH': cashAmountInETH}, finalOutput[key]);
      // finalOutput[key] = Object.assign({}, {'borrowAmountInETH': borrowAmountInETH}, finalOutput[key]);
      // finalOutput[key] = Object.assign({}, {'summedAmountInETH': summedAmountInETH}, finalOutput[key]);
    }
    let tvlInETHFixed = parseFloat(tvlInETH).toFixed(2)
    let tvlInETHString = tvlInETHFixed.toString()
    console.log('final tvlInETH', tvlInETH)
    console.log('final tvlInETHFixed', tvlInETHFixed)
    console.log('final tvlInETHString', tvlInETHString)
    console.log('final tvlInUSDC', tvlInETH.mul(finalOutput.usdcPrice))
    console.log('final tvlInUSDC',  parseFloat((tvlInETH.mul(finalOutput.usdcPrice))).toFixed(2))
  } catch(error) {
    console.log('hit an error iterating finalOutput', error)
  };

  // console.log('done???')
  // console.log('finalOutput', finalOutput)
  // (b.underlyingBorrowBalance * (e.value / POWER(10, (18-f.underlyingTokenDecimals)))) as underlying_borrow_value_in_eth,

  // add cash + borrows + convert price to eth for each market, sum up, convert total sum to usdc = tvl?

  // multiply two numbers together and divide by 1e18 (borrow*price)/1e18 = borrow price in eth,
  // same for supply with cash, add two together to get summed price in ether wei

    // for loop
    // extract value calculate
    // bignumber stuff
    // return = final tvl in usd in bignumber.toFixed()

  // console.log('top', finalOutput)
}

// getAllCTokens().then(
//   cTokenDataArray => {
//     getCash().then(
//     cTokenCashArray => {
//     console.log('here', cTokenCashArray)
//     getTotalBorrows().then(
//       cTokenBorrowsArray => {
//       console.log('here2', cTokenBorrowsArray)
//     })
//   })
// });

// get
// getTvl()


// const CTOKEN_WETH = '0xb4d58C1F5870eFA4B05519A72851227F05743273'.toLowerCase()

// // returns {[underlying]: {cToken, decimals, symbol}}
// async function getMarkets(block) {
//   // if (block < 10271924) {
//   //   // the allMarkets getter was only added in this block.
//   //   return markets;
//   // } else {
//   //   const markets = [{
//   //     cToken: CTOKEN_WETH,
//   //     underlying: '0x0', //cETH => WETH
//   //   }]
//     const allCTokens = await getAllCTokens(block)
//     console.log('tokens', allCTokens)
//     const calls = allCTokens.filter(i => i.toLowerCase() !== CTOKEN_WETH).map(i => ({ target: i }))
//     const { output } = await sdk.api.abi.multiCall({
//       abi: abi['underlying'], calls, block,
//     })
//     output.forEach(({ input: { target: cToken }, output: underlying}) => markets.push({ cToken, underlying, }))
//     return markets;
//   }

// async function v2Tvl(balances, block, borrowed) {
//   let markets = await getMarkets(block);

//   // Get V2 tokens locked
//   let v2Locked = await sdk.api.abi.multiCall({
//     block,
//     calls: markets.map((market) => ({
//       target: market.cToken,
//     })),
//     abi: borrowed ? abi.totalBorrows : abi['getCash'],
//   });

//   markets.forEach((market) => {
//     let getCash = v2Locked.output.find((result) => result.input.target === market.cToken);
//     balances[market.underlying] = BigNumber(balances[market.underlying] || 0)
//       .plus(getCash.output)
//       .toFixed();
//   });
//   return balances;
// }

// async function borrowed(timestamp, block) {
//   const balances = {};
//   await v2Tvl(balances, block, true)
//   return balances
// }

// async function tvl(timestamp, block) {
//   let balances = {};

//   await v2Tvl(balances, block, false)
//   return balances;
// }

// getAllCTokens()
// console.log(cTokens)

module.exports = {
  hallmarks: [],
  timetravel: true,
  arbitrum: {
    tvl: tvl
    // borrowed
  },
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
};
