// new version release amarok

// dependency 
const { chainExports } = require("../helper/exports");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getConfig } = require('../helper/cache');
// const sdk = require('@defillama/sdk');
const { SdkUtils } = require("@connext/sdk");


const config = {
    // signerAddress: "<wallet_address>",
    network: "mainnet",
    chains: {
      6648936: { // the domain ID for Ethereum Mainnet
        providers: ["https://rpc.ankr.com/eth"],
      },
      1869640809: { // the domain ID for Optimism
        providers: ["https://mainnet.optimism.io"]
      },
      1886350457: { // the domain ID for Polygon
        providers: ["https://polygon-rpc.com"]
      },
      1634886255: { // the domain ID for Arbitrum
        providers: ["https://arb1.arbitrum.io/rpc"]
      },
      6778479: { // the domain ID for Gnosis Chain
        providers: ["https://rpc.gnosis.io"]
      },
      6450786: { // the domain ID for BSC
        providers: ["https://bsc-dataseed.binance.org/"]
      }
    },
    logLevel: 5,
  
  }
  
  const SdkShared = async () =>{
    await SdkUtils.create(config);
  } 

  console.log(SdkShared);

  const sdk = async () =>{
    await SdkShared();
  } 
console.log(sdk);

sdk().then((sdkObj) => {
  sdkObj.getSupported()
    .then((supported) => {
      // handle the list of supported networks and assets
      console.log(supported.assets);
    })
    .catch((error) => {
      // handle any errors that may occur
      console.error(error);
    });
});


const chainNameToChainId = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    arbitrum: 42161,
    optimism: 10,
    xdai: 100,
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
// Taken from @connext/monorepo/package
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


// stableswap tvl
async function stableswapTVL(_, _b, { [chain]: block }) {
    const pools = [
      {
        name: 'USDC/USDT/USN',
        contract: '0x458459E48dbAC0C8Ca83F8D0b7b29FEfE60c3970',
        tokens: [
          '0x5183e1b1091804bc2602586919e6880ac1cf2896',
          '0x4988a896b1227218e4a686fde5eabdcabd91571f',
          '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
        ],
      },
      {
        name: 'USDC/USDT',
        contract: '0x13e7a001EC72AB30D66E2f386f677e25dCFF5F59',
        tokens: [
          '0x4988a896b1227218e4a686fde5eabdcabd91571f',
          '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
        ],
      },
      {
        name: 'nUSD-USDC/USDT',
        contract: '0x3CE7AAD78B9eb47Fd2b487c463A17AAeD038B7EC',
        tokens: [
          '0x07379565cd8b0cae7c60dc78e7f601b34af2a21c',
        ],
      },
    ]
  
    const tokensAndOwners = pools.map(({ contract, tokens }) => tokens.map(t => [t, contract])).flat()
    return sumTokens2({ chain, block, tokensAndOwners })
  }

const chains = [
"ethereum",
"bsc",
"polygon",
"optimism",
"arbitrum",
"xdai",
];


// module exports
module.exports = chainExports(chainTvl, Array.from(chains));
