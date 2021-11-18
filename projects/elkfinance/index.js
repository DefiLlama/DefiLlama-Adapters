const sdk = require('@defillama/sdk');
const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl');
const { getBlock } = require('../helper/getBlock');

const elkAddress = '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c';

const stakingContracts = {
  "heco": "0xdE16c49fA4a4B78071ae0eF04B2E496dF584B2CE",
  "polygon": "0xB8CBce256a713228F690AC36B6A0953EEd58b957",
  "bsc": "0xD5B9b0DB5f766B1c934B5d890A2A5a4516A97Bc5",
  "avax": "0xB105D4D17a09397960f2678526A4063A64FAd9bd",
  "fantom": "0x6B7E64854e4591f8F8E552b56F612E1Ab11486C3",
  "xdai": "0xAd3379b0EcC186ddb842A7895350c4657f151e6e",
  "okexchain": "0x1e0C4867253698355d0689567D2F7968542e6e9f",
  "elastos": "0x59d39bC9b0B36306b36895017A56B40eCC98D1d9",
  "hoo": "0x3A68B0dB21135E089AEaa13C5f5cd5E6cA158199",
  "moonriver": "0x64aA42D30428Cd53fD9F2fe01da161d90d878260",
  "kcc": "0x719a11f32340983E8D764C143d964CB3F4e5b49b",
  "harmony": "0xf4f3495a35c0a73268eEa08b258C7968E976F5D4",
  "cronos": "0x7D4fB4BFf1EE561a97394e29B7Fa5FdE96f6d44E",
  "telos": "0xB61b4ee3A00A8D01039625c13bd93A066c85EF2C",
};
// node test.js projects/elkfinance/index.js
function chainStaking(chain, contract){
 return async (timestamp, ethBlock, chainBlocks) => {
  balance = 0;
    const block = await getBlock(timestamp, chain, chainBlocks, true);

    balance += Number((await sdk.api.erc20.balanceOf({
      target: elkAddress,
      owner: contract,
      block: block,
      chain
    })).output);

  return { 'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': balance };
 }
};

const chainExports = {
  misrepresentedTokens: true,
  xdai: {
    tvl: calculateUsdUniTvl(
      "0xCB018587dA9590A18f49fFE2b85314c33aF3Ad3B", 
      "xdai", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  polygon: {
    tvl: calculateUsdUniTvl(
      "0xE3BD06c7ac7E1CeB17BdD2E5BA83E40D1515AF2a", 
      "polygon", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  fantom: {
    tvl: calculateUsdUniTvl(
      "0x7Ba73c99e6f01a37f3e33854c8F544BbbadD3420", 
      "fantom", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  bsc: {
    tvl: calculateUsdUniTvl(
      "0x31aFfd875e9f68cd6Cd12Cee8943566c9A4bBA13", 
      "bsc", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  heco:{
    tvl: calculateUsdUniTvl(
      "0x997fCE9164D630CC58eE366d4D275B9D773d54A4", 
      "heco", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  avalanche:{
    tvl: calculateUsdUniTvl(
      "0x091d35d7F63487909C863001ddCA481c6De47091", 
      "avax", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  kcc: {
    tvl: calculateUsdUniTvl(
      "0x1f9aa39001ed0630dA6854859D7B3eD255648599", 
      "kcc", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  harmony: {
    tvl: calculateUsdUniTvl(
      "0xCdde1AbfF5Ae3Cbfbdb55c1e866Ac56380e18720", 
      "harmony", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  okexchain: {
    tvl: calculateUsdUniTvl(
      "0x1116f8B82028324f2065078b4ff6b47F1Cc22B97", 
      "okexchain", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  moonriver: {
    tvl: calculateUsdUniTvl(
      "0xd45145f10fD4071dfC9fC3b1aefCd9c83A685e77", 
      "moonriver", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  cronos: {
    tvl: calculateUsdUniTvl(
      "0xEEa0e2830D09D8786Cb9F484cA20898b61819ef1", 
      "cronos", 
      elkAddress, 
      [], 
      "elk-finance"
      ),
  },
  /*telos: {
    tvl: calculateUsdUniTvl(
      "0x47c3163e691966f8c1b93B308A236DDB3C1C592d", 
      "telos", 
      elkAddress, 
      [], 
      "elk-finance", 
      18,
      true
      ),
  },*/
  hoo: {
    tvl: calculateUsdUniTvl(
      "0x9c03E724455306491BfD2CE0805fb872727313eA", 
      "hoo", 
      elkAddress, 
      [], 
      "elk-finance",
      18,
      true
      ),
  },
  elastos: {
    tvl: calculateUsdUniTvl(
      "0x440a1B8b8e968D6765D41E6b92DF3cBb0e9D2b1e", 
      "elastos", 
      elkAddress, 
      [], 
      "elk-finance",
      18,
      true
      ),
  }
};

Object.entries(stakingContracts).forEach(contract=>{
  chainExports[contract[0] === "avax"?"avalanche":contract[0]].staking = chainStaking(contract[0], contract[1])
})

module.exports = chainExports