// new version release amarok

// dependency 
const { chainExports } = require("../helper/exports");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getConfig } = require('../helper/cache')

const chainNameToChainId = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    arbitrum: 42161,
    optimism: 10,
    gnosis: 100,
};
  
let getContractsPromise

async function getContracts() {
    if (!getContractsPromise)
      getContractsPromise = getConfig('connect/contracts', 'https://raw.githubusercontent.com/connext/monorepo/main/packages/deployments/contracts/deployments.json')
    return getContractsPromise
  }
  

async function getDeployedContractAddress(chainId) {
    const contracts = await getContracts()
    const record = contracts[String(chainId)] || {}
    const name = Object.keys(record)[0];
    if (!name) {
        return undefined;
    }
    const contract = record[name]?.contracts?.TransactionManager;
    return contract ? contract.address : undefined;
}

let getAssetsPromise
// Taken from @connext/nxtp-utils
async function getAssetIds(chainId) {
    const url = "https://raw.githubusercontent.com/connext/chaindata/main/crossChain.json"
    if (!getAssetsPromise)
        getAssetsPromise = getConfig('connect/assets/'+chainId, url)
    const data = await getAssetsPromise
    const chainData = data.find(item => item.chainId === chainId) || {}
    return Object.keys(chainData.assetId || {}).map(id => id.toLowerCase())
}


// calculate tvl

function chainTvl(chain) {
return async (time, ethBlock, { [chain]: block }) => {
    const chainId = chainNameToChainId[chain]
    const contractAddress = await getDeployedContractAddress(chainId)
    if (!contractAddress)
    return {}
    const tokens = await getAssetIds(chainId)
    return sumTokens2({ owner: contractAddress, tokens, chain, block, })
};
}


const chains = [
"ethereum",
"bsc",
"polygon",
"optimism",
"arbitrum",
"gnosis",
];


// module exports
module.exports = chainExports(chainTvl, Array.from(chains));



// 1. First, we define a variable called chains, which will be used to define the chains we want to calculate TVL for.
// 2. We then define a function called chainTvl, which will be used to calculate the TVL for each chain defined in the chains array.
// 3. Next, we define a variable called chainNameToChainId, which maps the chain name to the chain ID.
// 4. We then define a variable called getContractsPromise, which will be used to store the promise returned by the getContracts function.
// 5. Next, we define a function called getContracts, which will be used to get the contracts from the connext/monorepo repository.
// 6. We then define a function called getDeployedContractAddress, which will be used to get the deployed contract address for the chain ID that is passed as a parameter.
// 7. We then define a variable called getAssetsPromise, which will be used to store the promise returned by the getAssetIds function.
// 8. Next, we define a function called getAssetIds, which will be used to get the asset IDs for the chain ID that is passed as a parameter.
// 9. We then define a function called chainExports, which will be used to export the TVL for each chain defined in the chains array.
// 10. Finally, we export the chainExports function. 