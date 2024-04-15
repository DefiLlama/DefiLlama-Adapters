const { sumTokensExport } = require("../helper/sumTokens");
const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const RESERVE_DYNAMIC_TABLE =
  "0x6ce8b223c47b5037d6791819694b32619ab0edfa5da139d21e416781cae487aa";

const POOLS = {
  arbitrum: "0x53eCC006a0073b3351E9e38d94f052E3864C7935",
  base: "0x68953027738216A63B39D55B18C02FeD5c329Dfa",
  optimism: "0x233DDEce6a96c49ecE6Ad9ae820690fE62a28975",
  polygon: "0xC3Eb696184b8927D677D8AB390A26563De4798c3",
  ethereum: "0xAA8b23B45cb51ce8f49D7757fF27BA397D05B6fC",
  avax: "0xc44C290e66e79aE208D998635F6Fc24837F3C554",
  bsc: "0x0519147E1A604F764C0Dca833671F5283C618f23",
};
const DEFAULT_TOKEN = ADDRESSES.null;

const DECIMAL_SHIFTS = {
  [ADDRESSES.sui.USDC]: -2,
  [ADDRESSES.sui.SUI]: 1,
};

const SUI_TOKENS = [
  { symbol: "SUI", poolId: 3, address: ADDRESSES.sui.SUI },
  { symbol: "USDC", poolId: 8, address: ADDRESSES.sui.USDC },
];

async function fetchDataBasedOnPoolId() {
  return Promise.all(
    SUI_TOKENS.map(({ poolId }) =>
      sui.getDynamicFieldObject(RESERVE_DYNAMIC_TABLE, poolId.toString(), {
        idType: "u16",
      })
    )
  );
}

// Calculate and add to API
function calculateAndAdd(objectsList, type, indexName, api) {
  objectsList.forEach((object, index) => {
    const { address } = SUI_TOKENS[index];

    const dataFields = object.fields.value.fields;

    const total_supply = dataFields.otoken_scaled?.fields?.total_supply || 0;
    const total_borrow = dataFields.dtoken_scaled?.fields?.total_supply || 0;
    const indexValue = dataFields[indexName] || 0;

    const shiftValue = 10 ** (DECIMAL_SHIFTS[address] ?? 0);
    const mainValue =
      type === "tvl" ? total_supply - total_borrow : total_borrow;

    const amount = (mainValue * shiftValue * indexValue) / Math.pow(10, 27);

    api.add(address, amount);
  });
}

async function suiTvl(api) {
  const objectsList = await fetchDataBasedOnPoolId();
  calculateAndAdd(objectsList, "tvl", "current_liquidity_index", api);
}

async function suiBorrow(api) {
  const objectsList = await fetchDataBasedOnPoolId();
  calculateAndAdd(objectsList, "borrow", "current_borrow_index", api);
}

module.exports = {
  timetravel: false,
  arbitrum: {
    tvl: sumTokensExport({
      owner: POOLS.arbitrum,
      tokens: [
        DEFAULT_TOKEN,
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.USDC, //Bridge USDC
      ],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owner: POOLS.base,
      tokens: [DEFAULT_TOKEN, ADDRESSES.base.USDbC],
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owner: POOLS.optimism,
      tokens: [
        DEFAULT_TOKEN,
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.USDT,
        ADDRESSES.optimism.USDC, // Bridge USDC
        ADDRESSES.optimism.WBTC, // WBTC
      ],
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      owner: POOLS.polygon,
      tokens: [
        DEFAULT_TOKEN,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.WBTC,
      ],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owner: POOLS.bsc,
      tokens: [DEFAULT_TOKEN],
    }),
  },
  avax: {
    tvl: sumTokensExport({
      owner: POOLS.avax,
      tokens: [DEFAULT_TOKEN, ADDRESSES.avax.USDC],
    }),
  },
  ethereum: {
    tvl: sumTokensExport({
      owner: POOLS.ethereum,
      tokens: [
        DEFAULT_TOKEN,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WBTC,
      ],
    }),
  },
  sui: {
    tvl: suiTvl,
    borrowed: suiBorrow,
  },
};
