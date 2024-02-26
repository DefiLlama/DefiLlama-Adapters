/** BakerFI Vault TVL */
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
    "arbitrum": {
        vaults: ["0x5c1b2312FaE6c0d61B6A15A8093842E9fE5b1e44"]
    },  
}
/**
 * BakerFi Function to get the total assets locked on vault
 */
const VAUL_ABI = {
    totalAssets: {
        type: "function",        
        stateMutability: "view",
        inputs: [],
        name: "totalAssets",
        outputs: [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],      
    }
}

async function getVaultTVL(api, vaults)  {    
    for( const vault of vaults) {
        const tvl =  await api.call({
            abi: VAUL_ABI.totalAssets,
            target: vault,
            params: [],
        });
        api.add(ADDRESSES.null, tvl)
    }
}

module.exports = {
    methodology: 'Counts the number of assets that are deployed through the protocol',
    misrepresentedTokens: false,
}

Object.keys(config).forEach(chain => {
    const { vaults  = []} = config[chain]
    module.exports[chain] = {
        tvl: async (_, _1, _2, { api }) => await getVaultTVL(api, vaults),    
    }
})

