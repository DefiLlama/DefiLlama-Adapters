const { sumTokens2 } = require("../helper/solana");

// realize Revenue Router legs the protocol keeps (program 5BEMuVyRY43q8ZnsTVJHqj6fGjXrGew4HCXbNwWXCoKJ,
// Revenue account EZgaJTGzLrSEbHsEXf6FyJK3HayKQihn82ufuw2qzL5K lists them as recipients)
const BUYBACK_VAULT = "5YkYBwNEYZ6dGpLRLetYjcBcanwMB5QbR2mQmEyt1EGp"; // program PDA ["buyback_vault", authority], 40% leg
const OPERATIONS = "Ec72a1cXtLWf4BdMmzStGZkip7hAieZ4J38ZVvBnUMee"; // operations and security, 15% leg
const BUILDER_REWARDS_VAULT = "ABjqEqWP3Pvtnzo2VZXTQRC4zTUCwy2FHutZ8ksDMbdk"; // Builder Rewards, 5% leg

async function tvl(api) {
  return sumTokens2({ api, solOwners: [BUYBACK_VAULT, OPERATIONS, BUILDER_REWARDS_VAULT] });
}

module.exports = { solana: { tvl } };
