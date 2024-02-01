const { sumTokens2 } = require("../helper/unwrapLPs");
const utils = require("../helper/utils");

const MINT_TOKEN_CONTRACT = "0x1f3Af095CDa17d63cad238358837321e95FC5915";
const V2_BOND_CONTRACTS = {
  1: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
  10: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
  42161: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
  43114: "0x3Fd5B4DcDa968C8e22898523f5343177F94ccfd1",
  137: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
  56: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
  8453: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
};

function tvl(chainId) {
  return async (_, _1, _2, { api }) => {
    const { data: stats } = await utils.fetchURL(
      `https://mint.club/api/tokens/reserve-token-stats?chainId=${chainId}`
    );

    const tokens = [];

    for (const { reserveToken } of stats) {
      tokens.push(reserveToken.tokenAddress);
    }

    return sumTokens2({ api, tokens, owner: V2_BOND_CONTRACTS[chainId] });
  };
}

module.exports = {
  methodology:
    "Calculates the total collateral value of all the Mint.club V2 Bonding Curve protocols.",
  timetravel: false,
  misrepresentedTokens: false,
  ethereum: {
    tvl: tvl(1),
  },
  optimism: {
    tvl: tvl(10),
  },
  arbitrum: {
    tvl: tvl(42161),
  },
  avax: {
    tvl: tvl(43114),
  },
  polygon: {
    tvl: tvl(137),
  },
  bsc: {
    tvl: tvl(56),
    ownTokens: [MINT_TOKEN_CONTRACT],
  },
  base: {
    tvl: tvl(8453),
  },
};
