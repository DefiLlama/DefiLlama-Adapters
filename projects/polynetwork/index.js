// Import the required utility module
const utils = require('../helper/utils');

// Define a base URL for the API
const baseURL = 'https://explorer.poly.network/api/v1/';

async function fetchTVL(path) {
    const url = `${baseURL}${path}`; // Construct the full URL
    const response = await utils.fetchURL(url); // Use the utility function to fetch data from the URL
    return Number(response.data); // Convert the response data to a number and return it
}

// Define a mapping of blockchain names to their API endpoints
const blockchainEndpoints = {
    ethereum: 'getTVLEthereum',
    ontology: 'getTVLOntology',
    neo: 'getTVLNeo',
    carbon: 'getTVLCarbon',
    bsc: 'getTVLBNBChain',
    heco: 'getTVLHeco',
    okexchain: 'getTVLOKC',
    neo3: 'getTVLNeo3',
    polygon: 'getTVLPolygon',
    palette: 'getTVLPalette',
    arbitrum: 'getTVLArbitrum',
    xdai: 'getTVLGnosisChain',
    zilliqa: 'getTVLZilliqa',
    avax: 'getTVLAvalanche',
    fantom: 'getTVLFantom',
    optimism: 'getTVLOptimistic',
    metis: 'getTVLAndromeda',
    boba: 'getTVLBoba',
    oasis: 'getTVLOasis',
    harmony: 'getTVLHarmony',
    hoo: async () => 0, // Made async to match other functions
    bytomsidechain: 'getTVLBytomSidechain',
    kcc: 'getTVLKCC',
    kava: 'getTVLKava',
    starcoin: 'getTVLStarcoin',
    celo: 'getTVLCelo',
    clv: async () => 0, // Made async to match other functions
    conflux: 'GetTVLConflux',
    astar: 'GetTVLAstar',
    aptos: 'GetTVLAptos',
    bitgert: 'GetTVLBitgert',
    dexit: 'GetTVLDexit',
};

// Programmatically generate the fetch functions for each blockchain, ensuring they are async
const fetchFunctions = Object.entries(blockchainEndpoints).reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'function' ? value : async () => await fetchTVL(value);
    return acc;
}, {});

// Export the functions as part of the module's public interface
module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    ...Object.keys(fetchFunctions).reduce((acc, key) => {
        acc[key] = { fetch: fetchFunctions[key] };
        return acc;
    }, {}),
    // Special case for fetching total TVL
    fetch: async () => await fetchTVL('getTVLTotal'),
};
