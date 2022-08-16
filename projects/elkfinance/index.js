const sdk = require('@defillama/sdk');
const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl');
const { getBlock } = require('../helper/getBlock');
const { chainExports: getChainExports } = require('../helper/exports');

function elkAddress(chain) {
  switch(chain) {
    case 'iotex': 
    return '0xa00744882684c3e4747faefd68d283ea44099d03';
    default:
      return '0xeEeEEb57642040bE42185f49C52F7E9B38f8eeeE';
  }
} 

function geckoId(chain) {
  switch(chain) {
    case 'iotex': 
    return 'iotex';
    default:
      return 'elk-finance';
  }
}

function whitelist(chain) {
  switch(chain) {
    case 'iotex': 
    return ["0xeEeEEb57642040bE42185f49C52F7E9B38f8eeeE", "0x3b2bf2b523f54c4e454f08aa286d03115aff326c"];
    default:
      return [];
  }
}
const stakingContracts = {
  "heco": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "polygon": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "bsc": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "avax": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "fantom": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "xdai": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "okexchain": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "elastos": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "hoo": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "moonriver": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "kcc": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "harmony": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "cronos": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "telos": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "fuse": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
  "iotex": "0x57A1CE7686F3B2AB61F5191c76361F985b57E0fa",
};
// node test.js projects/elkfinance/index.js

const factories = {
  xdai: "0xCB018587dA9590A18f49fFE2b85314c33aF3Ad3B",
  polygon: "0xE3BD06c7ac7E1CeB17BdD2E5BA83E40D1515AF2a",
  fantom: "0x7Ba73c99e6f01a37f3e33854c8F544BbbadD3420",
  bsc: "0x31aFfd875e9f68cd6Cd12Cee8943566c9A4bBA13",
  heco: "0x997fCE9164D630CC58eE366d4D275B9D773d54A4",
  avax: "0x091d35d7F63487909C863001ddCA481c6De47091",
  kcc: "0x1f9aa39001ed0630dA6854859D7B3eD255648599",
  harmony: "0xCdde1AbfF5Ae3Cbfbdb55c1e866Ac56380e18720",
  okexchain: "0x1116f8B82028324f2065078b4ff6b47F1Cc22B97",
  moonriver: "0xd45145f10fD4071dfC9fC3b1aefCd9c83A685e77",
  cronos: "0xEEa0e2830D09D8786Cb9F484cA20898b61819ef1",
  telos: "0x47c3163e691966f8c1b93B308A236DDB3C1C592d",
  hoo: "0x9c03E724455306491BfD2CE0805fb872727313eA",
  elastos: "0x440a1B8b8e968D6765D41E6b92DF3cBb0e9D2b1e",
  fuse: "0x779407e40Dad9D70Ba5ADc30E45cC3494ec71ad2",
  iotex: "0xF96bE66DA0b9bC9DFD849827b4acfA7e8a6F3C42",
  ethereum: "0x6511eBA915fC1b94b2364289CCa2b27AE5898d80", 
  optimism: "0xedfad3a0F42A8920B011bb0332aDe632e552d846",
  arbitrum: "0xA59B2044EAFD15ee4deF138D410d764c9023E1F0"
}

function chainTvl(chain){
  return calculateUsdUniTvl(
    factories[chain], 
    chain, 
    elkAddress(chain), 
    whitelist(chain),
    geckoId(chain),
    18,
    true
  )
}

const chainExports = getChainExports(chainTvl, Object.keys(factories))
chainExports.misrepresentedTokens= true;
chainExports.timetravel= true
/*
Object.entries(stakingContracts).forEach(contract=>{
  chainExports[contract[0] === "avax"?"avalanche":contract[0]].staking = chainStaking(contract[0], contract[1])
})
*/

module.exports = chainExports
