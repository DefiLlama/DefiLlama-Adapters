const { ethers } = require("ethers");

const MARKETPLACE_ADDRESS = "0xb50b1dC8Ba1a4491cC6f18BCEd73101e4ABc7A7f";
const START_BLOCK_LISK = 13782903;
const CHAIN = "lisk";
const RPC_URL = "https://rpc.api.lisk.com/";

const MARKETPLACE_ABI = [
  "event ListingCreated(uint256 indexed listingId, address indexed nftContract, address indexed seller, address listedBy, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken)",
  "event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 totalPrice)",
  "event ListingCancelled(uint256 indexed listingId)",
  "function listings(uint256) view returns (address nftContract, address seller, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken, bool active)",
];

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const marketplaceInterface = new ethers.Interface(MARKETPLACE_ABI);

// Token ID mapping from createOwnerEntries
const tokenIdMapping = {
  "0x8161AFB150064CcF4b2b9Af430D9C8002D8291cF": {
    "The ZAR 1892 Proof Coin Set - Silver Tier": 1,
    "The ZAR 1892 Proof Coin Set - Bronze Tier": 2,
    "The ZAR 1892 Proof Coin Set - Gold Tier": 3,
  },
  // TODO: Add Ivyson Tour, Up in Smoke
};

// Symbol mapping (for logging, not pricing)
const symbolToCoingecko = {
  'LSK': 'lisk',
  'USDC': 'usd-coin',
  'WETH': 'weth',
  'WBTC': 'wrapped-bitcoin',
};

async function tvl(timestamp, _ethBlock, _chainBlocks, { api }) {
  const balances = {};
  const blockNumber = api.block;
  console.log(`Timestamp: ${timestamp}, Block: ${blockNumber}, Chain: ${CHAIN}`);

  // Fetch events using DefiLlama SDK
  const eventTopics = {
    ListingCreated: marketplaceInterface.getEventTopic("ListingCreated"),
    ListingSold: marketplaceInterface.getEventTopic("ListingSold"),
    ListingCancelled: marketplaceInterface.getEventTopic("ListingCancelled"),
  };

  const [createdLogs, soldLogs, cancelledLogs] = await Promise.all([
    api.getLogs({
      target: MARKETPLACE_ADDRESS,
      topic: eventTopics.ListingCreated,
      fromBlock: START_BLOCK_LISK,
      toBlock: blockNumber,
    }).catch(e => {
      console.error(`Error querying ListingCreated events:`, e.message);
      return [];
    }),
    api.getLogs({
      target: MARKETPLACE_ADDRESS,
      topic: eventTopics.ListingSold,
      fromBlock: START_BLOCK_LISK,
      toBlock: blockNumber,
    }).catch(e => {
      console.error(`Error querying ListingSold events:`, e.message);
      return [];
    }),
    api.getLogs({
      target: MARKETPLACE_ADDRESS,
      topic: eventTopics.ListingCancelled,
      fromBlock: START_BLOCK_LISK,
      toBlock: blockNumber,
    }).catch(e => {
      console.error(`Error querying ListingCancelled events:`, e.message);
      return [];
    }),
  ]);

  console.log(`Found ${createdLogs.length} ListingCreated, ${soldLogs.length} ListingSold, ${cancelledLogs.length} ListingCancelled events`);

  const createdEvents = createdLogs.map(log => marketplaceInterface.parseLog(log));
  const soldEvents = soldLogs.map(log => marketplaceInterface.parseLog(log));
  const cancelledEvents = cancelledLogs.map(log => marketplaceInterface.parseLog(log));

  // Process events
  const cancelledIds = new Set(cancelledEvents.map(e => e.args.listingId.toString()));
  const remainingAmounts = {};

  createdEvents.forEach((event) => {
    const listingId = event.args.listingId.toString();
    console.log(`Listing ${listingId} created with amount ${event.args.amount}`);
    console.log("Event args:", event.args);
    try {
      const amount = event.args.amount !== undefined ? event.args.amount : event.args[5];
      remainingAmounts[listingId] = BigInt(amount);
    } catch (e) {
      console.error(`Error parsing amount for listing ${listingId}:`, e.message);
      remainingAmounts[listingId] = BigInt(0);
    }
  });

  console.log("Remaining amounts after creation:", remainingAmounts);

  soldEvents.forEach((event) => {
    const listingId = event.args.listingId.toString();
    if (remainingAmounts[listingId]) {
      try {
        const soldAmount = BigInt(event.args.amount);
        if (remainingAmounts[listingId] >= soldAmount) {
          remainingAmounts[listingId] -= soldAmount;
          console.log(`Listing ${listingId}: reduced amount by ${soldAmount} to ${remainingAmounts[listingId]}`);
        } else {
          console.warn(`Sold amount ${soldAmount} exceeds remaining ${remainingAmounts[listingId]} for listing ${listingId}`);
          remainingAmounts[listingId] = BigInt(0);
        }
      } catch (e) {
        console.error(`Error processing sold amount for listing ${listingId}:`, e.message);
        remainingAmounts[listingId] = BigInt(0);
      }
    }
  });

  console.log("Remaining amounts after sales:", remainingAmounts);

  let activeListings = 0;
  for (const event of createdEvents) {
    const listingId = event.args.listingId;
    const listingIdStr = listingId.toString();
    const paymentToken = event.args.paymentToken;

    if (
      cancelledIds.has(listingIdStr) ||
      !remainingAmounts[listingIdStr] ||
      remainingAmounts[listingIdStr] === BigInt(0)
    ) {
      console.log(`Skipping listing ${listingIdStr}: cancelled or fully sold`);
      continue;
    }

    try {
      const listing = await api.call({
        target: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI.find(f => f.name === "listings"),
        params: [listingId],
        block: blockNumber,
      });

      if (!listing.active) {
        console.log(`Skipping listing ${listingIdStr}: not active`);
        continue;
      }

      const currentRemainingAmount = remainingAmounts[listingIdStr];
      const pricePerToken = BigInt(listing.pricePerToken);
      const valueInPaymentTokenRaw = currentRemainingAmount * pricePerToken;

      if (valueInPaymentTokenRaw === BigInt(0)) {
        console.log(`Skipping listing ${listingIdStr}: zero value`);
        continue;
      }

      let paymentTokenIdentifier = paymentToken;
      let symbol;
      let decimals = 18; // Default for LSK

      // Fetch symbol and decimals
      try {
        if (paymentToken === "0x0000000000000000000000000000000000000000") {
          symbol = "LSK";
          paymentTokenIdentifier = "coingecko:lisk";
        } else {
          const tokenContract = new ethers.Contract(paymentToken, ERC20_ABI, provider);
          [symbol, decimals] = await Promise.all([
            tokenContract.symbol(),
            tokenContract.decimals().then(Number),
          ]);
        }
      } catch (e) {
        console.warn(`Failed to fetch symbol/decimals for ${paymentToken}:`, e.message);
        symbol = "USDC"; // Fallback for 0xac485391...
        decimals = 6;
      }

      console.log(
        `Processing listing ${listingIdStr}: token=${paymentTokenIdentifier}, symbol=${symbol}, amount=${currentRemainingAmount.toString()}`
      );

      // Add value to balances using DefiLlama SDK
      try {
        await api.add(paymentTokenIdentifier, valueInPaymentTokenRaw.toString());
        activeListings++;
        console.log(`Listing ${listingIdStr}: added ${valueInPaymentTokenRaw} ${symbol} to balances`);
      } catch (e) {
        console.warn(`api.add failed for ${paymentTokenIdentifier} (symbol: ${symbol}):`, e.message);
        continue; // Skip if pricing fails
      }

      // Log NFT metadata
      const templateName = Object.keys(tokenIdMapping[event.args.nftContract] || {}).find(
        key => tokenIdMapping[event.args.nftContract][key] === Number(event.args.tokenId)
      );
      console.log(
        `Listing ${listingIdStr}: ${templateName || "Unknown"} (Value: ${valueInPaymentTokenRaw}, Token: ${paymentTokenIdentifier}, Symbol: ${symbol})`
      );
    } catch (e) {
      console.error(`Error processing listing ${listingIdStr}:`, e.message);
    }
  }

  console.log(`Found ${activeListings} active listings`);
  console.log("TVL balances:", balances);
  return balances;
}

module.exports = {
  methodology:
    "Calculates TVL by summing the USD value of all active listings in the Momint marketplace. For each active listing, the value is determined by its pricePerToken multiplied by the remaining amount of listed items, denominated in the respective payment token (native LSK or various ERC20 tokens). Event logs for ListingCreated, ListingSold, and ListingCancelled are processed to ascertain the current state and quantity of active listings up to the queried block height. The DefiLlama SDK handles the conversion of these payment token values to USD.",
  misrepresentedTokens: false,
  timetravel: true,
  start: 13782903, // TODO: Replace with actual UNIX timestamp
  [CHAIN]: { tvl },
  hallmarks: [[Date.parse("2025-03-12") / 1000, "Momint Marketplace OP Stack Launch"]],
};