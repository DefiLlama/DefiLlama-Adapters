const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 22095715, },
  hemi: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 1391406, },
  core: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 23086081, },
  sonic: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 23769061, },
  plume: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 1219008, },
  goat: { factory: '0xc5790164d3CCB6533b241EeE3Fd7f56862759376', fromBlock: 3742120, },
}


// Wrapper configuration for each chain
// This maps the wrapper address to the original asset address
const wrapper = {
  ethereum:[
    {
      wrapper:'0x59063FBE70d3B0F9312e5c89acDc476f5d2018e1',
      originalAsset:'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    },
    {
      wrapper:'0xdc0CcAd18ca645A03870676C78a81524B4655197',
      originalAsset:'0x6Bf340dB729d82af1F6443A0Ea0d79647b1c3DDf'
    }
  ],
  hemi:[
    {
      wrapper:'0xdc0CcAd18ca645A03870676C78a81524B4655197',
      originalAsset:'0xAA40c0c7644e0b2B224509571e10ad20d9C4ef28'
    },
    {
      wrapper:'0x59063FBE70d3B0F9312e5c89acDc476f5d2018e1',
      originalAsset:'0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3'
    },
  ],
  core:[],
  sonic:[
    {
      wrapper:'0x59063FBE70d3B0F9312e5c89acDc476f5d2018e1',
      originalAsset:'0xecAc9C5F704e954931349Da37F60E39f515c11c1'
    }
  ],
  plume:[
    {
      wrapper:'0x59063FBE70d3B0F9312e5c89acDc476f5d2018e1',
      originalAsset:'0x6A9A65B84843F5fD4aC9a0471C4fc11AFfFBce4a'
    }
  ],
  goat:[],

}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event NewDeployment (address collateral, address priceFeed, address troveManager, address sortedTroves)',
        onlyArgs: true,
        fromBlock,
      });

      const wrappedConfigForChain = wrapper[chain] || [];
      
      // Map logs to tokensAndOwners, replacing collateral with wrapper if found
      const tokensAndOwners = logs.map(log => {
        // Find if the current log.collateral exists in the wrappedConfigForChain
        const wrappedAssetInfo = wrappedConfigForChain.find(
          w => w.wrapper.toLowerCase() === log.collateral.toLowerCase()
        );

        // If found, use the wrapper address, otherwise use the original collateral
        if (wrappedAssetInfo) {
          return [wrappedAssetInfo.originalAsset, wrappedAssetInfo.wrapper];
        }else{
         return [log.collateral, log.troveManager]; 
        }
      });
      
      return api.sumTokens({ tokensAndOwners });
    }
  }
})
