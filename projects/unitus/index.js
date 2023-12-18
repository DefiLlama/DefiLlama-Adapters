const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const {getCompoundUsdTvl} = require('../helper/compound')
const {generalizedChainExports} = require('../helper/exports')


let allControllers = {
  ethereum: ["0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113"],
  bsc: ["0x0b53E608bD058Bb54748C35148484fD627E6dc0A"],
  arbitrum: ["0x8E7e9eA9023B81457Ae7E6D2a51b003D421E5408"],
  optimism: ["0xA300A84D8970718Dac32f54F61Bd568142d8BCF4"],
  polygon: ["0x52eaCd19E38D501D006D2023C813d7E37F025f37"],
  conflux: ["0xA377eCF53253275125D0a150aF195186271f6a56"]
};


function getLendingTvl(chain, borrowed){
  return sdk.util.sumChainTvls(allControllers[chain].map(controller =>
    getCompoundUsdTvl(controller, chain, "", borrowed,
      {
        oracle: abi['oracle'],
        underlyingPrice: abi['getUnderlyingPrice'],
        getAllMarkets: abi['getAlliTokens']
      })
  ))
}

function chainTvl(chain) {
  return {
    tvl: sdk.util.sumChainTvls([getLendingTvl(chain, false)]),
    borrowed: getLendingTvl(chain, true),
  };
}


module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  ...generalizedChainExports(chainTvl, ["ethereum", "bsc", "arbitrum", "optimism", "polygon", "conflux"]),
}
