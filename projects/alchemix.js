var Web3 = require("web3");
const env = require("dotenv").config();
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`
  )
);

const BigNumber = require("bignumber.js");

const abis = require("./config/abis.js");
const { getTokenPriceCoinGecko } = require("./config/bella/utilities.js");

let coins = [
  "0x6b175474e89094c44da98b954eedeac495271d0f", //DAI
  "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9", //alUSD
  "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF", //ALCX
  "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8", //Sushiswap ALCX-WETH LP Token
];

let daiHolders = [
  "0xaB7A49B971AFdc7Ee26255038C82b4006D122086", //Transmuter
  "0xc21D353FF4ee73C572425697f4F5aaD2109fe35b", //Alchemist
];
async function weiToFloat(wei) {
  wei = await new BigNumber(wei).div(10 ** 18).toFixed(2);
  return parseFloat(wei);
}
async function getBalInFloat(contract, user) {
  let balances = await contract.methods.balanceOf(user).call();
  balances = await weiToFloat(balances);
  return balances;
}

async function getTotalSupplyFloat(contract) {
  let supply = await contract.methods.totalSupply().call();
  supply = await weiToFloat(supply);
  return supply;
}

async function fetch() {
  const stakingPool = "0xAB8e74017a8Cc7c15FFcCd726603790d26d7DeCa";

  const daicontract = new web3.eth.Contract(abis.abis.minABI, coins[0]);
  const alusdcontract = new web3.eth.Contract(abis.abis.minABI, coins[1]);
  const alcxcontract = new web3.eth.Contract(abis.abis.minABI, coins[2]);
  const alcxlpcontract = new web3.eth.Contract(abis.abis.minABI, coins[3]);

  let tvl = 0;
  //Get total DAI TVL from transmuter and alchemist contracts
  for (let i = 0; i < daiHolders.length; i++) {
    let daibal = await getBalInFloat(daicontract, daiHolders[i]);
    tvl += daibal;
  }

  //Get total amount of ALCX staked in staking pool
  const stakedALCX = await getBalInFloat(alcxcontract, stakingPool);
  //Convert ALCX to USD Via coingecko
  const baseTokenPriceInUsd = await getTokenPriceCoinGecko("usd")("alchemix");
  tvl += stakedALCX * baseTokenPriceInUsd;

  //Get total amount of SLP staked in staking contract
  const stakedLP = await getBalInFloat(alcxlpcontract, stakingPool);
  //Get amount of ALCX in lp shares
  const totalLP = await getTotalSupplyFloat(alcxlpcontract);
  let shareOfTotalStaked = totalLP / stakedLP; //Gets ratio of total staked
  //Get total ALCX in lp token
  const totalALCXinLP = await getBalInFloat(alcxcontract, coins[3]);
  let totalALCXShareInLP = shareOfTotalStaked * totalALCXinLP;
  //Get approx tvl from lp staking by doubling the alcx * usd price
  tvl += totalALCXShareInLP * 2 * baseTokenPriceInUsd;

  //Get alusd supply,multiply it by 2 to get total dai deposited to mint alusd
  const totalALUSDSupply = await getTotalSupplyFloat(alusdcontract);
  tvl += totalALUSDSupply * 2;

  console.log(`Alchemix TVL is ${tvl.toLocaleString()}`);

  return tvl;
}

module.exports = {
  fetch,
};
