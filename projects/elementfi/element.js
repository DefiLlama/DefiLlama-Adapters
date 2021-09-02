const sdk = require("@defillama/sdk");
const web3 = require("./../config/web3.js");
const abis = require("./../config/abis.js");
const abi = require("./abi.json");
const curveAbi = require("./curveAbi.json");
var balances = {};
//node test.js projects/elementfi/element.js
let wrappedCoins = [
  "0x53b1aEAa018da00b4F458Cc13d40eB3e8d1B85d6", //wrapped-lusd3crv-f
  "0x97278Ce17D4860f8f49afC6E4c1C5AcBf2584cE5"  //wrapped-crvtricrypto
];
let crvTokens = [
  "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA", //lusd3crv-f
  "0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5", //crvtricrypto
];
let yVaults = [
  "0x5fA5B62c8AF877CB37031e0a3B2f34A78e3C56A6", //lusd3crv-f
	"0x3D980E50508CFd41a13837A60149927a11c03731", //crvtricrypto
]
async function getTrancheAddresses(block, trancheFactoryAddress) {
  const trancheFactory = new web3.eth.Contract(abi, trancheFactoryAddress);
  const trancheCreatedEvents = await trancheFactory.getPastEvents({
    fromBlock:0, 
    toBlock: block, 
    // tranche creation events
    topics: ['0x86944ab3f9722712d06f9d63f492e9893c0c77cc40e512ca1c1f3aaaec6bf2d3']
  });
  return trancheCreatedEvents.map(
    (event) => event['returnValues'][0]);
};
async function getTokenBalances(block, addresses, coins) {
  var i = 0;
  // each element-fi vault contains wrapped (curve pool yearn tokens)
  // these wrapped positions are backed 1:1
  for (coin of coins) {
    var totalCoins = 0;

    // find pricePerShare
    var yVaultContract = new web3.eth.Contract(abis.abis.minYvV2, yVaults[i]);
    var pricePerShare = await yVaultContract.methods.pricePerShare().call();

    // sum token  balances across tranches
    for (address of addresses) {
      var coinContract = new web3.eth.Contract(abis.abis.minABI, coin);
      var addressCoinBalance = await coinContract.methods.balanceOf(address).call({}, block);

      totalCoins += parseInt(addressCoinBalance) * parseInt(pricePerShare) * 10**-36;
    }

    // use virtual_price to find ratio crv pool tokens to underlying
    const poolContract = await new web3.eth.Contract(curveAbi, crvTokens[i]);
    var poolVirtualPrice = await poolContract.methods.get_virtual_price().call();
    totalCoins = totalCoins * poolVirtualPrice * 10**-18;

    // use crvTokens[i] instead of coin because wrapped is backed 1:1
    sdk.util.sumSingleBalance(balances, crvTokens[i], totalCoins);
    i++;
  }
};
async function tvl(timestamp, block) {
  console.log('tvl', block)
  const trancheFactoryAddress = "0x62F161BF3692E4015BefB05A03a94A40f520d1c0";
  const trancheAddresses = await getTrancheAddresses(block, trancheFactoryAddress);
  // this gets quantities of crv tokens
  await getTokenBalances(block, trancheAddresses, wrappedCoins);
  console.log(balances);
  // now I need to unwrap crvToken balances => USD balances
  // I have found this difficult because address(wrappedCoins) != address(crvTokens)
  return balances;
};

module.exports = {
  tvl
}