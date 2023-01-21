const sdk = require("@defillama/sdk");
const bpsABI = require('./bps.json');
const utils = require('../helper/utils');
const {BigNumber} = require("ethers")

let _response;
const GLP_BEEFY_VAULT="0x9dbbBaecACEDf53d5Caa295b8293c1def2055Adc";
const GLP_TOKEN = "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258";

function fetchTVL(chainId) {
  return async (chainBlocks) => {
    const ethTVL = {};
    const polygonTVL = {};
    const arbTVL = {};
    
    if (!_response) _response = utils.fetchURL('https://h.oliveapp.finance/api/rest/vaults/tvl')
    const response = await _response;

    const vaults = response.data["vault_meta_data"];
    for (const v in vaults) {      
      if (chainId == vaults[v]['vault_object']['chain_id']) {
        const asset = vaults[v]['vault_object']['underlying_asset'];
        const balance = vaults[v]['vault_object']['total_balance'];

        switch (chainId) {
          case 1:
            sdk.util.sumSingleBalance(ethTVL,asset,balance);
            break;
          case 137:
            sdk.util.sumSingleBalance(polygonTVL,'polygon:'+asset,balance);
            break;
          case 42161:            
            if (vaults[v]["name"] == "GLP") {
              // Get BPS for beefy vault
              const bps = await sdk.api.abi.call({
                target: GLP_BEEFY_VAULT,
                abi: bpsABI['bps'],
                block: chainBlocks['arbitrum'],
                chain: 'arbitrum'
            })

            const glp = BigNumber.from(bps.output).mul(BigNumber.from(balance)).div(BigNumber.from('1000000000000000000')).toString();
            sdk.util.sumSingleBalance(arbTVL,'arbitrum:'+GLP_TOKEN,glp)
            } else {
              sdk.util.sumSingleBalance(arbTVL,'arbitrum:'+asset,balance)
            }            
            break;
          default:
            break;
        }
      }
    }    
    return chainId == 1 ?ethTVL: chainId == 137 ? polygonTVL : arbTVL;
  }  
}

const chains = {
  ethereum: 1,
  polygon: 137,
  arbitrum: 42161
}

module.exports = {  
  ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
    tvl: fetchTVL(chain[1])    
  }]))
}
