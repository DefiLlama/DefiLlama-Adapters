const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens');

const v2graph = getChainTvl({
  bahamut: "https://bahamut-rpc.publicnode.com"
})

//I could not find bahamut chain in this repo even tho it is listed on website 
// https://defillama.com/chain/Bahamut
//and swap address on bahamut https://www.ftnscan.com/address/0xF660558a4757Fb5953d269FF32E228Ae3d5f6c68/
module.exports = {
  misrepresentedTokens: true,
  methodology: `its a dex which operates on bahamut chain `,
  bahamut: {
    tvl: v2graph('bahamut'),
  },
}

const config = {
"bahamut" : "0xF660558a4757Fb5953d269FF32E228Ae3d5f6c68" //address of smart contract on bahamut chain
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, })
  }
})
