const ADDRESSES = require('./helper/coreAssets.json')
const { compoundExports } = require('./helper/compound')

const wBNB = ADDRESSES.bsc.WBNB;
const cBNB = "0xC5a83aD9f3586e143D2C718E8999206887eF9dDc";

const wCRO = "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23";
const cCRO = "0x61FCA31c51aCc4CC683291Be936E6799AeAAFe41";

const wKAVA = ADDRESSES.kava.WKAVA;
const cKAVA = "0x5642Aa2fC7028a203C689Bf21c1a92861D8C449B";

module.exports = {
  methodology: 'TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL. Data is pull from the Annex API "https://api.annex.finance/api/v1/governance/annex".',
  bsc: compoundExports("0xb13026db8aafa2fd6d23355533dccccbd4442f4c", "bsc", cBNB, wBNB,),
  cronos: compoundExports("0xbC1f72e751DE303Ff545D2E348fef2E84D493645", "cronos", cCRO, wCRO,),
  kava: compoundExports("0xFb6FE7d66E55831b7e108B77D11b8e4d479c2986", "kava", cKAVA, wKAVA,),
}; // node test.js projects/annex.js