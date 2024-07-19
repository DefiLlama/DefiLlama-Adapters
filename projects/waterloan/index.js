const ADDRESSES = require('../helper/coreAssets.json')
const { getV2Reserves, getTvl, getBorrowed } = require("../helper/aave");

const addressesProviderRegistry = {
  "csc": "0x9D15cf1a8ebF191A0df57fA0362ba535F371883b",
  "smartbch": "0xF7d79dC3A3e78745abEbE5A0e8d4735F02A854B9"
}
const USDT = ADDRESSES.csc.USDT;
const USDC = "0xF335B2440e62A953a42865aDf7bD73F4C6671A7b";

const FLEXUSD = ADDRESSES.smartbch.flexUSD;
const EBEN = "0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B";
const WBCH = ADDRESSES.smartbch.WBCH;
const MIST = "0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129";

function waterloan(chain, borrowed) {
  return async (timestamp, _, {[chain]: block }) => {
    const balances = {};

    const [v2Atokens, v2ReserveTokens, dataHelper] = await getV2Reserves(
      block,
      addressesProviderRegistry[chain],
      chain
    );
    if (borrowed) {
      await getBorrowed(
        balances,
        block,
        chain,
        v2ReserveTokens,
        dataHelper,
        (id) => id
      );
    } else {
      await getTvl(
        balances,
        block,
        chain,
        v2Atokens,
        v2ReserveTokens,
        (id) => id
      );
    }

    const erc20Map = {
      [ADDRESSES.csc.WCET]:
        "0x081f67afa0ccf8c7b17540767bbe95df2ba8d97f", // CET
      "0x1D7C98750A47762FA8B45c6E3744aC6704F44698":
        "0x2731d151CBDf84A8A4C6d9D0BaE74012Db51E428", // IFT
      [ADDRESSES.csc.USDT]:
        ADDRESSES.ethereum.USDT, // USDT
      "0xF335B2440e62A953a42865aDf7bD73F4C6671A7b":
        ADDRESSES.ethereum.USDC, // USDC
      "0x9F4165009e93b7f5BA61A477ad08Cd3D1aD8aa36":
        "0x0b342c51d1592c41068d5d4b4da4a68c0a04d5a4", // ONES

      [FLEXUSD]: "flex-usd",
      [EBEN]: "green-ben",
      [WBCH]: "bitcoin-cash",
      [MIST]: "mistswap"
    };

    var ret = {};
    for (var addr in balances) {
      if (addr in erc20Map) {
        if (addr == USDT || addr == USDC) {
          ret[erc20Map[addr]] = balances[addr] / 1e12;
        } else {
          ret[erc20Map[addr]] = balances[addr] / (chain === "smartbch" ? 1e18 : 1);
        }
      } else {
        ret[addr] = balances[addr] / (chain === "smartbch" ? 1e18 : 1);
      }
    }

    return ret;
  };
}

module.exports = {
    methodology: `Counts all tokens locked in the contracts to be used as collateral in lending pool. Borrowed coins are not counted towards the TVL, only the coins actually locked in the contracts are counted.`,
  csc: {
    tvl: waterloan("csc", false),
    borrowed: waterloan("csc", true),
  },
  smartbch: {
    tvl: waterloan("smartbch", false),
    borrowed: waterloan("smartbch", true),
  },
};
