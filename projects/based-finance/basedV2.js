const sdk = require("@defillama/sdk");
const { sumTokens2, nullAddress, } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");
const chain = 'fantom'

//BASED V2
const obol = "0x1539C63037D95f84A5981F96e43850d1451b6216";
const smelt = "0x141FaA507855E56396EAdBD25EC82656755CD61e";
const BoardroomV2 = "0x8ff9eFB99D522fAC6a21363b7Ca54d25477637F6";
const SmeltRewardPool = "0x66d1C92f2319C67DA822BAe1Ef33b2C85C391a7b";
const usdc = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
const usdcFtmLp = "0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c";
const wftm = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
const godNft = '0xc5777AD2250D7b12a3f2383afB4464b9E49bE297';
const treasuryAddress = '0x0A10daD90b9C6FB8B87BFf3857A4B012890C53A5';
const WFTM_SMELT_LP = '0x02e060a4b8453c5da554d66c2035e3163d453daa'
const WFTM_OBOL_LP = '0x47fce13359ac80cc1fc98d46688701b2bb54300c'

//BASED V2 Twisted Nodes
const shortNodes = "0xAEbfF260074782a3DfD8981352b44767A05fa2eD";
const mediumNodes = "0x525ca3877a78c6AE12292D0a55765775e3943379";
const longNodes = "0x62A2Ff4BcCC5dD5316C358cDF079EC5e5c0851fe";

async function pool2(_, _b, {fantom: block }) {
  return sumTokens2({ owner: SmeltRewardPool, tokens: [
    WFTM_SMELT_LP,
    WFTM_OBOL_LP,
  ], block, chain, })
}

async function treasury(_, _b, { fantom: block }) {
  return sumTokens2({ owner: treasuryAddress, tokens: [
    usdc,
    WFTM_SMELT_LP,
    WFTM_OBOL_LP,
    wftm,
    nullAddress,
  ], block, chain, })
}

module.exports = {
  fantom: {
    tvl: async () => ({}),
    pool2,
    treasury,
    staking: stakings([BoardroomV2, shortNodes, mediumNodes, longNodes, ], smelt, "fantom"),
  },
};

