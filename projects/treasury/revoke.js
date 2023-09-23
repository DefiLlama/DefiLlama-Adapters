const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xe126b3E5d052f1F575828f61fEBA4f4f2603652a" //

module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        nullAddress,
        ADDRESSES.optimism.DAI,
        ADDRESSES.optimism.WETH,
        ADDRESSES.optimism.USDT,
        ADDRESSES.optimism.USDC,
        "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4", //snx
     ],
    owners: [treasury],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", //ens
        "0xDd1Ad9A21Ce722C151A836373baBe42c868cE9a4", //ubi
        "0x7aE1D57b58fA6411F32948314BadD83583eE0e8C", //paper
        "0xb24cd494faE4C180A89975F1328Eab2a7D5d8f11", //code
        "0x6243d8CEA23066d098a15582d81a598b4e8391F4", //flx
        "0xc4De189Abf94c57f396bD4c52ab13b954FebEfD8", //b20
        "0xad32A8e6220741182940c5aBF610bDE99E737b2D", //dough
        "0x90DE74265a416e1393A450752175AED98fe11517", //udt
        "0x6fB3e0A217407EFFf7Ca062D46c26E5d60a14d69", //iotx
        "0x5dD57Da40e6866C9FcC34F4b6DDC89F1BA740DfE", //bright
        "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d", //fox
        "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF", //alcx
        "0x4F14cDBd815B79E9624121f564f24685c6B1211b", //anfd
        "0xE41d2489571d322189246DaFA5ebDe1F4699F498", //zrx
        "0x7b35Ce522CB72e4077BaeB96Cb923A5529764a00", //imx
     ],
    owners: [treasury],
  },
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.BUSD, //busd
        "0xF68C9Df95a18B2A5a5fa1124d79EEEffBaD0B6Fa", //any
     ],
    owners: [treasury],
  },
  polygon: {
    tokens: [ 
        nullAddress,
        ADDRESSES.polygon.USDT, //usdt
        ADDRESSES.polygon.DAI, //dai
        ADDRESSES.polygon.USDC, //usdc
        "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4", //ammatic
     ],
    owners: [treasury],
  },
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.ARB, //arb
        "0x539bdE0d7Dbd336b79148AA742883198BBF60342", //magic
        ADDRESSES.arbitrum.USDC, //usdc
        "0x1F52145666C862eD3E2f1Da213d479E61b2892af", //fuc
     ],
    owners: [treasury],
  },
  arbitrum_nova: {
    tokens: [ 
        nullAddress,
        ADDRESSES.optimism.DAI, //dai
     ],
    owners: [treasury],
  },
  xdai: {
    tokens: [ 
        nullAddress,
        "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9", //hny
     ],
    owners: [treasury],
  },

})