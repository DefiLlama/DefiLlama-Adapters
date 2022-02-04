const sdk = require("@defillama/sdk");
const { getV2Reserves, getV2Tvl, getV2Borrowed } = require("../helper/aave");

const addressesProviderRegistryCSC =
  "0x9D15cf1a8ebF191A0df57fA0362ba535F371883b";
const USDT = "0x398dcA951cD4fc18264d995DCD171aa5dEbDa129";
const USDC = "0xF335B2440e62A953a42865aDf7bD73F4C6671A7b";

function waterloan(borrowed) {
  return async (timestamp, block) => {
    const balances = {};
    const [v2Atokens, v2ReserveTokens, dataHelper] = await getV2Reserves(
      block,
      addressesProviderRegistryCSC,
      "csc"
    );
    if (borrowed) {
      await getV2Borrowed(
        balances,
        block,
        "csc",
        v2ReserveTokens,
        dataHelper,
        (id) => id
      );
    } else {
      await getV2Tvl(
        balances,
        block,
        "csc",
        v2Atokens,
        v2ReserveTokens,
        (id) => id
      );
    }

    erc20Map = {
      "0xE6f8988d30614afE4F7124b76477Add79c665822":
        "0x081f67afa0ccf8c7b17540767bbe95df2ba8d97f", // CET
      "0x1D7C98750A47762FA8B45c6E3744aC6704F44698":
        "0x2731d151CBDf84A8A4C6d9D0BaE74012Db51E428", // IFT
      "0x398dcA951cD4fc18264d995DCD171aa5dEbDa129":
        "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
      "0xF335B2440e62A953a42865aDf7bD73F4C6671A7b":
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0x9F4165009e93b7f5BA61A477ad08Cd3D1aD8aa36":
        "0x0b342c51d1592c41068d5d4b4da4a68c0a04d5a4", // ONES
    };

    var ret = {};
    for (var addr in balances) {
      if (addr in erc20Map) {
        if (addr == USDT || addr == USDC) {
          ret[erc20Map[addr]] = balances[addr] / 1e12;
        } else {
          ret[erc20Map[addr]] = balances[addr];
        }
      } else {
        ret[addr] = balances[addr];
      }
    }

    return ret;
  };
}

module.exports = {
  timetravel: true,
  methodology: `Counts all tokens locked in the contracts to be used as collateral in lending pool. Borrowed coins are not counted towards the TVL, only the coins actually locked in the contracts are counted.`,
  csc: {
    tvl: waterloan(false),
    borrowed: waterloan(true),
  },
};
