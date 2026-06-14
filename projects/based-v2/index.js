const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress, } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

//BASED V2
const smelt = "0x141FaA507855E56396EAdBD25EC82656755CD61e";
const BoardroomV2 = "0x8ff9eFB99D522fAC6a21363b7Ca54d25477637F6";
const usdc = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
const wftm = ADDRESSES.fantom.WFTM;
const treasuryAddress = '0x0A10daD90b9C6FB8B87BFf3857A4B012890C53A5';

//BASED V2 Twisted Nodes
const shortNodes = "0xAEbfF260074782a3DfD8981352b44767A05fa2eD";
const mediumNodes = "0x525ca3877a78c6AE12292D0a55765775e3943379";
const longNodes = "0x62A2Ff4BcCC5dD5316C358cDF079EC5e5c0851fe";

async function treasury(api) {
  return sumTokens2({
    owner: treasuryAddress, tokens: [
      usdc,
      wftm,
      nullAddress,
    ], api,
  })
}

module.exports = {
  fantom: {
    tvl: async () => ({}),
    treasury,
    staking: stakings([BoardroomV2, shortNodes, mediumNodes, longNodes,], smelt),
  },
};