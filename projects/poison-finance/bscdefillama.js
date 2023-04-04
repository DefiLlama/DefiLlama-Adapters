const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const axios = require('axios');
const ethers = require('ethers');

const USDC_TOKEN_CONTRACT = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
const DAI_TOKEN_CONTRACT = '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3';

const BUSD_TOKEN_CONTRACT = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const USD_TOKEN_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

const POTION_VAULT_CONTRACT = '0xd5e31fc5f4a009A49312C20742DF187b35975528';
const POISON_TOKEN_CONTRACT = '0x31C91D8Fb96BfF40955DD2dbc909B36E8b104Dde';
const POISON_STAKED_CONTRACT = '0x04fCB69aa48f9151741A5D238b5c3cDb2A788e05';

const url = 'https://coins.llama.fi/prices/current/bsc:'+POISON_TOKEN_CONTRACT;

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
const POISON_TOKEN_SYMBOL = 'usd'; // Replace with the actual token symbol
const POISON_TOKEN_COINGECKO_ID = 'poison-finance'; // Replace with the actual CoinGecko ID

const coindeckoURL = `${COINGECKO_API_BASE_URL}/simple/price?ids=${POISON_TOKEN_COINGECKO_ID}&vs_currencies=${POISON_TOKEN_SYMBOL}`;

function convertTo18DecimalWei(amount, decimals) {
  const multiplier = new BigNumber(10).exponentiatedBy(18 - decimals);
  const amount18DecimalWei = new BigNumber(amount).times(multiplier);
  return amount18DecimalWei.toString(10);
}

async function convertWeiAmountToDecimal(amountInWei, tokenDecimal){

  let amountInWeiBignumber = new BigNumber(amountInWei.toString());
  let tokenDecimalBignumber = new BigNumber(tokenDecimal);
  let decimal = new BigNumber(10).pow(tokenDecimalBignumber);
  decimal = new BigNumber(decimal.toString());
  let amount = amountInWeiBignumber.div( decimal );
  return amount.toString();
 }

 async function tvl(_, _1, _2, { api }) {
  const balances = {};
  const collateralBalance0 = await sdk.api.abi.call({
    target: USDC_TOKEN_CONTRACT,
    params: [POTION_VAULT_CONTRACT],
    abi: "erc20:balanceOf",
    chain: "bsc"
  });
  let token0Decimal = await sdk.api.abi.call({
    target: USDC_TOKEN_CONTRACT,
    abi: "erc20:decimals",
    chain: "bsc"
  });
  let token0Balance18Decimals = await convertTo18DecimalWei(collateralBalance0.output, token0Decimal.output);
  token0Balance18Decimals = new BigNumber(token0Balance18Decimals.toString());
  await sdk.util.sumSingleBalance(balances, USDC_TOKEN_CONTRACT, collateralBalance0.output, "bsc");

  const collateralBalance1 = await sdk.api.abi.call({
    target: DAI_TOKEN_CONTRACT,
    params: [POTION_VAULT_CONTRACT],
    abi: 'erc20:balanceOf',
    chain: "bsc"
  });
  let token1Decimal = await sdk.api.abi.call({
    target: DAI_TOKEN_CONTRACT,
    abi: "erc20:decimals",
    chain: "bsc"
  });
  let token1Balance18Decimals = await convertTo18DecimalWei(collateralBalance1.output, token1Decimal.output);
  token1Balance18Decimals = new BigNumber(token1Balance18Decimals.toString());
  await sdk.util.sumSingleBalance(balances, DAI_TOKEN_CONTRACT, collateralBalance1.output,  "bsc");
  
  const collateralBalance2 = await sdk.api.abi.call({
    target: BUSD_TOKEN_CONTRACT,
    params: [POTION_VAULT_CONTRACT],
    abi: "erc20:balanceOf",
    chain: "bsc"
  });
  let token2Decimal = await sdk.api.abi.call({
    target: BUSD_TOKEN_CONTRACT,
    abi: "erc20:decimals",
    chain: "bsc"
  });
  let token2Balance18Decimals = await convertTo18DecimalWei(collateralBalance2.output, token2Decimal.output);
  token2Balance18Decimals = new BigNumber(token2Balance18Decimals.toString());
  await sdk.util.sumSingleBalance(balances, BUSD_TOKEN_CONTRACT, collateralBalance2.output, "bsc");

  const collateralBalance3 = await sdk.api.abi.call({
    target: USD_TOKEN_CONTRACT,
    params: [POTION_VAULT_CONTRACT],
    abi: 'erc20:balanceOf',
    chain: "bsc"
  });
  let token3Decimal = await sdk.api.abi.call({
    target: USD_TOKEN_CONTRACT,
    abi: "erc20:decimals",
    chain: "bsc"
  });
  let token3Balance18Decimals = await convertTo18DecimalWei(collateralBalance3.output, token3Decimal.output);
  token3Balance18Decimals = new BigNumber(token3Balance18Decimals.toString());
  await sdk.util.sumSingleBalance(balances, USD_TOKEN_CONTRACT, collateralBalance3.output,  "bsc");



  let totalBalance0 = token0Balance18Decimals.plus(token1Balance18Decimals);
  totalBalance0 = new BigNumber(totalBalance0.integerValue().toFixed());

  let totalBalance1 = totalBalance0.plus(token2Balance18Decimals);
  totalBalance1 = new BigNumber(totalBalance1.integerValue().toFixed());

  let totalBalance2 = totalBalance1.plus(token3Balance18Decimals);

  await sdk.util.sumSingleBalance(balances, POTION_VAULT_CONTRACT, totalBalance2.integerValue().toFixed(),  "bsc");
  
  return balances;
}

async function stakingTvl(_, _1, _2, { api }) {
  const balances = {};
  let token0Decimal = await sdk.api.abi.call({
    target: USDC_TOKEN_CONTRACT,
    abi: "erc20:decimals",
    chain: "bsc"
  });


  const collateralBalance5 = await sdk.api.abi.call({
    target: POISON_TOKEN_CONTRACT,
    params: [POISON_STAKED_CONTRACT],
    abi: 'erc20:balanceOf',
    chain: "bsc"
  });
  let token5Decimal = await sdk.api.abi.call({
    target: POISON_TOKEN_CONTRACT,
    abi: "erc20:decimals",
    chain: "bsc"
  });

  let poisonAmountInNumber = await convertWeiAmountToDecimal(collateralBalance5.output, token5Decimal.output);

  const response = await axios.get(coindeckoURL);
//   console.log(response);
  const data = await response.data;
//   console.log(" data :",data['poison-finance'].usd)
  let price = data['poison-finance'].usd;
  // console.log(poisonAmountInNumber.toString());
  let poisonAmountInNumberB = new BigNumber(poisonAmountInNumber.toString());
  let priceB = new BigNumber(price.toString());
  // console.log(priceB.toString());
  let totalStakedValueAmount = poisonAmountInNumberB.multipliedBy(priceB).toFixed( parseInt(token0Decimal.output) );
  // console.log(totalStakedValueAmount)
  totalStakedValueAmount = await ethers.utils.parseUnits(totalStakedValueAmount.toString(), token0Decimal.output);
  // console.log(totalStakedValueAmount.toString())
  let token5Balance18Decimals = await convertTo18DecimalWei(totalStakedValueAmount.toString(), token0Decimal.output);
  token5Balance18Decimals = new BigNumber(token5Balance18Decimals.toString());

  await sdk.util.sumSingleBalance(balances, USDC_TOKEN_CONTRACT, totalStakedValueAmount.toString(), "bsc");


  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'total',
  bsc: {
     tvl,
     staking: stakingTvl
  }
};











