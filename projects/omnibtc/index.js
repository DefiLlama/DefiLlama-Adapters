const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const RESERVE_DYNAMIC_TABLE =
  "0x6ce8b223c47b5037d6791819694b32619ab0edfa5da139d21e416781cae487aa";

const decimalShift = {
  [ADDRESSES.sui.USDC]: -2,
  [ADDRESSES.sui.SUI]: 1,
};

const SUI_TOKENS = [
  {
    symbol: "SUI",
    poolId: 3,
    address: ADDRESSES.sui.SUI,
  },
  {
    symbol: "USDC",
    poolId: 8,
    address: ADDRESSES.sui.USDC,
  },
];

// Helper function to retrieve data based on poolId
async function fetchDataBasedOnPoolId() {
  const getObject = ({ poolId }) => sui.getDynamicFieldObject(RESERVE_DYNAMIC_TABLE, poolId.toString(), { idType: 'u16' })
  return Promise.all(SUI_TOKENS.map(getObject))
}

// Calculate and add to API
function calculateAndAdd(objectsList, type, indexName, api) {
  objectsList.forEach((object, index) => {
    const { address } = SUI_TOKENS[index];

    const dataFields = object.fields.value.fields;

    const total_supply = dataFields.otoken_scaled?.fields?.total_supply || 0;
    const total_borrow = dataFields.dtoken_scaled?.fields?.total_supply || 0;
    const indexValue = dataFields[indexName] || 0;

    const shiftValue = 10 ** (decimalShift[address] ?? 0);
    const mainValue = type === "tvl" ? (total_supply - total_borrow) : total_borrow;

    const amount = (mainValue * shiftValue * indexValue) / Math.pow(10, 27);

    api.add(address, amount);
  });
}

async function tvl() {
  const { api } = arguments[3];
  const objectsList = await fetchDataBasedOnPoolId();
  calculateAndAdd(objectsList, "tvl", "current_liquidity_index", api);
}

async function borrow() {
  const { api } = arguments[3];
  const objectsList = await fetchDataBasedOnPoolId();
  calculateAndAdd(objectsList, "borrow", "current_borrow_index", api);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
    borrowed: borrow,
  },
};
