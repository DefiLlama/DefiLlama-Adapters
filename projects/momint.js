//
//    /$$      /$$   /$$$$$$   /$$      /$$  /$$$$$$  /$$   /$$  /$$$$$$$$
//   | $$$    /$$$  /$$__  $$ | $$$    /$$$ |_  $$_/ | $$$ | $$ |__  $$__/
//   | $$$$  /$$$$ | $$  \ $$ | $$$$  /$$$$   | $$   | $$$$| $$    | $$   
//   | $$ $$/$$ $$ | $$  | $$ | $$ $$/$$ $$   | $$   | $$ $$ $$    | $$   
//   | $$  $$$| $$ | $$  | $$ | $$  $$$| $$   | $$   | $$  $$$$    | $$   
//   | $$\  $ | $$ | $$  | $$ | $$\  $ | $$   | $$   | $$\  $$$    | $$   
//   | $$ \/  | $$ |  $$$$$$/ | $$ \/  | $$  /$$$$$$ | $$ \  $$    | $$   
//   |__/     |__/  \______/  |__/     |__/ |______/ |__/  \__/    |__/   
//
// 
//     Adapter for the Momint marketplace on Lisk/OP stack
//     This adapter calculates TVL and volume for the Momint marketplace
//     TVL is calculated as the sum of all active listings
//     Volume is calculated as the sum of all completed sales
// 
const { ethers } = require("ethers");
const { getBlock } = require('../helpers/getBlock');

// Marketplace contract address - replace with your deployed address
const MARKETPLACE_ADDRESS = "0x860C8d35E01B5071617d3A947B05AC75106B282C";

// ABI fragments for the events we need to track
const MARKETPLACE_ABI = [
    "event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 totalPrice)",
    "event ListingCreated(uint256 indexed listingId, address indexed nftContract, address indexed seller, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken)",
    "event ListingCancelled(uint256 indexed listingId)",
    "function listings(uint256) view returns (address nftContract, address seller, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken, bool active)"
];

// Chain ID for your deployment
const CHAIN = 'lisk';

// Function to fetch the active listings and calculate TVL
async function tvl(timestamp, block, chainBlocks) {
    const provider = new ethers.providers.JsonRpcProvider(
        process.env[`${CHAIN.toUpperCase()}_RPC`]
    );

    const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        provider
    );

    // Use the actual block number for the requested timestamp
    const blockNumber = await getBlock(timestamp, CHAIN, chainBlocks);

    // We'll need to query for assets locked into the protocol, ensuring this meets accuracy requirements of DefiLlama
    const createdFilter = marketplace.filters.ListingCreated();
    const createdEvents = await marketplace.queryFilter(
        createdFilter,
        0,
        blockNumber
    );

    // Get cancelled listings to ensure we dont count listings removed
    const cancelledFilter = marketplace.filters.ListingCancelled();
    const cancelledEvents = await marketplace.queryFilter(
        cancelledFilter,
        0,
        blockNumber
    );
    const cancelledIds = new Set(
        cancelledEvents.map(e => e.args.listingId.toString())
    );

    // track sold items
    soldEvents.forEach(event => {
        const listingId = event.args.listingId.toString();
        if (remainingAmounts[listingId]) {
            remainingAmounts[listingId] = remainingAmounts[listingId].sub(event.args.amount);
        }
    });

    // Map to track remaining amounts for each listing
    const remainingAmounts = {};
    createdEvents.forEach(event => {
        const listingId = event.args.listingId.toString();
        remainingAmounts[listingId] = event.args.amount;
    });

    // Calculate TVL from active listings
    let tvl = ethers.BigNumber.from(0);
    for (const event of createdEvents) {
        const listingId = event.args.listingId.toString();
        // Skip if cancelled or fully sold
        if (cancelledIds.has(listingId) || !remainingAmounts[listingId]) {
            continue;
        }
        // Get current listing details to ensure it's active
        const listing = await marketplace.listings(event.args.listingId);
        const value = listing.pricePerToken.mul(remainingAmounts[listingId]);
        tvl = tvl.add(value);
    }

    // Convert to a reasonable number format
    return {
        [CHAIN]: { tvl: Number(ethers.utils.formatEther(tvl)) }
    };
}

// Function to calculate the total trading volume
async function volume(timestamp, block, chainBlocks) {
    const provider = new ethers.providers.JsonRpcProvider(
        process.env[`${CHAIN.toUpperCase()}_RPC`]
    );

    const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        provider
    );

    // Use the actual block number for the requested timestamp
    const blockNumber = await getBlock(timestamp, CHAIN, chainBlocks);

    // Get all sale events
    const soldFilter = marketplace.filters.ListingSold();
    const soldEvents = await marketplace.queryFilter(
        soldFilter,
        0,
        blockNumber
    );

    // Sum up the total volume
    let totalVolume = ethers.BigNumber.from(0);
    for (const event of soldEvents) {
        totalVolume = totalVolume.add(event.args.totalPrice);
    }

    return {
        [CHAIN]: Number(ethers.utils.formatEther(totalVolume))
    };
}

module.exports = {
    methodology: "Calculates TVL as the sum of all active listings in the Momint marketplace. Volume is the sum of all completed sales.",
    misrepresentedTokens: false,
    timetravel: true,
    [CHAIN]: {
        tvl,
    },
    volume: {
        [CHAIN]: volume
    },
    hallmarks: [
        [Date.parse("2025-03-12") / 1000, "Momint Marketplace OP Stack Launch"]
    ]
};

// Made with ❤️ by the Momint Team