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
const { fetchPrice } = require('../helpers/utils/prices');

// Marketplace contract address - replace with your deployed address
const MARKETPLACE_ADDRESS = "0x860C8d35E01B5071617d3A947B05AC75106B282C";

// ABI fragments for the events we need to track
const MARKETPLACE_ABI = [
    "event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 totalPrice)",
    "event ListingCreated(uint256 indexed listingId, address indexed nftContract, address indexed seller, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken)",
    "event ListingCancelled(uint256 indexed listingId)",
    "function listings(uint256) view returns (address nftContract, address seller, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken, bool active)"
];

// ERC20 ABI fragment for decimals
const ERC20_ABI = [
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
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
    const createdEvents = await marketplace.queryFilter(createdFilter, 0, blockNumber);

    // Get cancelled listings to ensure we dont count listings removed
    const cancelledFilter = marketplace.filters.ListingCancelled();
    const cancelledEvents = await marketplace.queryFilter(cancelledFilter, 0, blockNumber);
    const cancelledIds = new Set(cancelledEvents.map(e => e.args.listingId.toString()));

    // track sold items
    const soldFilter = marketplace.filters.ListingSold();
    const soldEvents = await marketplace.queryFilter(soldFilter, 0, blockNumber);

    // Map to track remaining amounts for each listing
    const remainingAmounts = {};
    createdEvents.forEach(event => {
        const listingId = event.args.listingId.toString();
        remainingAmounts[listingId] = event.args.amount;
    });

    soldEvents.forEach(event => {
        const listingId = event.args.listingId.toString();
        if (remainingAmounts[listingId]) {
            remainingAmounts[listingId] = remainingAmounts[listingId].sub(event.args.amount);
        }
    });


    // Calculate TVL from active listings
    for (const event of createdEvents) {
        const listingId = event.args.listingId.toString();

        // Skip if cancelled or fully sold
        if (cancelledIds.has(listingId) || !remainingAmounts[listingId]) {
            continue;
        }

        try {
            const listing = await marketplace.listings(event.args.listingId);
            const paymentToken = listing.paymentToken;

            // Get token information if not already cached
            if (!tokenDecimals[paymentToken]) {
                try {
                    const tokenContract = new ethers.Contract(paymentToken, ERC20_ABI, provider);
                    tokenDecimals[paymentToken] = await tokenContract.decimals();
                    tokenSymbols[paymentToken] = await tokenContract.symbol();
                } catch (e) {
                    console.error(`Error fetching token info for ${paymentToken}:`, e);
                    tokenDecimals[paymentToken] = 18; // Default to 18 decimals
                    tokenSymbols[paymentToken] = 'UNKNOWN';
                }
            }

            const value = listing.pricePerToken.mul(remainingAmounts[listingId]);

            if (!tokenBalances[paymentToken]) {
                tokenBalances[paymentToken] = ethers.BigNumber.from(0);
            }
            tokenBalances[paymentToken] = tokenBalances[paymentToken].add(value);
        } catch (e) {
            console.error(`Error checking listing ${listingId}:`, e);
        }
    }

    // Convert all token balances to USD
    let totalTvlUsd = 0;
    for (const [token, balance] of Object.entries(tokenBalances)) {
        try {
            // Convert raw balance to decimal format based on token decimals
            const formattedBalance = Number(ethers.utils.formatUnits(balance, tokenDecimals[token] || 18));
            // Fetch token price in USD using official helper function
            const tokenPrice = await fetchPrice({
                chain: CHAIN,
                token: token,
                timestamp
            });
            if (tokenPrice && tokenPrice > 0) {
                const valueUsd = formattedBalance * tokenPrice;
                totalTvlUsd += valueUsd;
                console.log(`TVL for ${tokenSymbols[token]}: $${valueUsd.toLocaleString()}`);
            } else {
                // Note: We primarily support Eth, Lsk and USDc so token support shouldnt be an issue, but just in case
                console.warn(`Could not fetch price for token ${token}`);
            }
        } catch (e) {
            console.error(`Error calculating USD value for token ${token}:`, e);
        }
    }
    return {
        [CHAIN]: totalTvlUsd
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

    // Track volume by payment token
    const tokenVolumes = {};
    const tokenDecimals = {};

    // Get all sale events
    const soldFilter = marketplace.filters.ListingSold();
    const soldEvents = await marketplace.queryFilter(soldFilter, 0, blockNumber);

    // Create a map of listingId to payment token
    const listingPaymentTokens = {};
    soldEvents.forEach(event => {
        const listingId = event.args.listingId.toString();
        listingPaymentTokens[listingId] = event.args.paymentToken;
    });


    // Aggregate volumes by token
    for (const event of soldEvents) {
        const listingId = event.args.listingId.toString();
        const paymentToken = listingPaymentTokens[listingId];

        if (paymentToken) {
            if (!tokenVolumes[paymentToken]) {
                tokenVolumes[paymentToken] = ethers.BigNumber.from(0);
            }
            tokenVolumes[paymentToken] = tokenVolumes[paymentToken].add(event.args.totalPrice);

            // Get token decimals if not already cached
            if (!tokenDecimals[paymentToken]) {
                try {
                    const tokenContract = new ethers.Contract(paymentToken, ERC20_ABI, provider);
                    tokenDecimals[paymentToken] = await tokenContract.decimals();
                } catch (e) {
                    console.error(`Error fetching decimals for ${paymentToken}:`, e);
                    tokenDecimals[paymentToken] = 18; // Default to 18 decimals
                }
            }
        }
    }

    // Convert all token volumes to USD
    let totalVolumeUsd = 0;

    for (const [token, volume] of Object.entries(tokenVolumes)) {
        try {
            // Convert raw balance to decimal format
            const formattedVolume = Number(ethers.utils.formatUnits(volume, tokenDecimals[token] || 18));
            // Fetch token price in USD using official helper function
            const tokenPrice = await fetchPrice({
                chain: CHAIN,
                token: token,
                timestamp
            });

            if (tokenPrice && tokenPrice > 0) {
                const volumeUsd = formattedVolume * tokenPrice;
                totalVolumeUsd += volumeUsd;
            } else {
                console.warn(`Could not fetch price for token ${token}`);
            }
        } catch (e) {
            console.error(`Error calculating USD volume for token ${token}:`, e);
        }
    }
    return {
        [CHAIN]: totalVolumeUsd
    };
}

module.exports = {
    methodology: "Calculates TVL as the as the USD values of all active listings in the Momint marketplace. Volume is the USD equivalent sum of all completed sales tracked through ListingSold events.",
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