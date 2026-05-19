const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // Arbitrum One USDC

const SAFE = "0xDA1f681eEC73bC4a7CB6C90696F0744D46C282d6";
const HOT_DEPOSIT = "0x5Fd54D6835D32AdFAd96339051Fc8CD2E441a65D";
const HOT_WITHDRAW = "0xdF582Ae88f1Abd0AdF6D48988A87ceD1594f4791";

async function tvl(api) {
  const owners = [SAFE, HOT_DEPOSIT, HOT_WITHDRAW];
  return api.sumTokens({
    tokensAndOwners: owners.map((o) => [USDC, o]),
  });
}

module.exports = {
  methodology: "Counts USDC held in Gambit custody wallets.",
  timetravel: true,
  misrepresentedTokens: false,
  start: 0,
  arbitrum: { tvl },
};
