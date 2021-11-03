const sdk = require('@defillama/sdk');
const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl');

const elkAddress = '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c';

const stakingContracts = {
  "heco": "0xdE16c49fA4a4B78071ae0eF04B2E496dF584B2CE",
  "polygon": "0xB8CBce256a713228F690AC36B6A0953EEd58b957",
  "bsc": "0xD5B9b0DB5f766B1c934B5d890A2A5a4516A97Bc5",
  "avax": "0xB105D4D17a09397960f2678526A4063A64FAd9bd",
  "fantom": "0x6B7E64854e4591f8F8E552b56F612E1Ab11486C3",
  "xdai": "0xAd3379b0EcC186ddb842A7895350c4657f151e6e"
};

async function staking(timestamp, ethBlock, chainBlocks) {
  balance = 0;
  for (const key of Object.keys(stakingContracts)) {
    balance += Number((await sdk.api.erc20.balanceOf({
      target: elkAddress,
      owner: stakingContracts[key],
      block: chainBlocks[key],
      chain: key
    })).output)
  };

  return { 'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': balance };
};

module.exports = {
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
  staking:{
    tvl: staking
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
  okex: {
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
  }
};