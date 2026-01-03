const sdk = require("@defillama/sdk");

const MONY = "0x6a7c6aa2b8b8a6A891dE552bDEFFa87c3F53bD46";

async function tvl() {
  const supply = await sdk.api.erc20.totalSupply({
    target: MONY,
    chain: "ethereum",
  });

  return {
    [MONY.toLowerCase()]: supply.output,
  };
}

module.exports = {
  methodology:
    "TVL equals the total supply of the MONY token on Ethereum. Token address is published by J.P. Morgan Asset Management in the MONY launch press release.",
  misrepresentedTokens: true,
  ethereum: { tvl },
};

