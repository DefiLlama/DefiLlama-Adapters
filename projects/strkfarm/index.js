/**
 * STRKFarm is a yield aggregator and strategy builder on Starknet
 * - We use various DeFi protocols on starknet to design yield strategies
 */

const { multiCall } = require("../helper/chain/starknet");
const ADDRESSES = require('../helper/coreAssets.json');
const { SINGLETONabiMap } = require('./singleton');
const { endurABIMap } = require('./endur');

const STRATEGIES = {
  "xSTRKStrats": [{
    address: "0x7023a5cadc8a5db80e4f0fde6b330cbd3c17bbbf9cb145cbabd7bd5e6fb7b0b",
    token: ADDRESSES.starknet.STRK,
    xSTRK: ADDRESSES.starknet.XSTRK,
    vesu: "0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef"
  }] 
}

async function computeXSTRKStratTVL(api) {
  const pool_id = "0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161";
  const contracts = STRATEGIES.xSTRKStrats;

  // fetch price of xSTRK from Endur using preview_redeem fn  
  // and calculate actual price after dividing by 10**18
  const price = await multiCall({
    calls: contracts.map(c => ({
      target: c.xSTRK,
      params: ['0xDE0B6B3A7640000', '0x0']
    })),
    abi: { ...endurABIMap.preview_redeem, customInput: 'address' }
  });  
  let xstrk_price = Number(price[0]) / 10**18 // Assuming `price` is returned as a BigInt array

  // our strategy deposits xSTRK received from endur and deposits
  // to vesu as collateral and borrows STRK as debt 
  // hence we calculate collateral and debt values in asset terms
  const data = await multiCall({
    calls: contracts.map(c => ({
      target: c.vesu,
      params: [pool_id, c.xSTRK, c.token, c.address] 
    })),
    abi: {...SINGLETONabiMap.position, customInput: 'address'},
  });

  let collateral = Number(data[0]['2']);
  let debt = Number(data[0]['3']);

  
  let tvl = (collateral * xstrk_price) - debt;
  
  api.addTokens(contracts[0].token, [tvl]);
}

async function tvl(api) {
  await computeXSTRKStratTVL(api);
}

module.exports = {
  doublecounted: true,
  methodology: "The TVL is calculated as a sum of total assets deposited into strategies",
  starknet: {
    tvl,
  },
};