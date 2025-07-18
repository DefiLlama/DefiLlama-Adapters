const iota = require('../helper/chain/iota');

const VAULT_MAP = {
  IOTA: {
    priceAggregater: {
      objectId: "0x052c40b4e8f16df5238457f3a7b3b0eeaa49c6bc8acc22f6a7790ab32495b2c6",
      mutable: false,
      initialSharedVersion: 22329880,
    },
    vault: {
      objectId: "0xaf306be8419cf059642acdba3b4e79a5ae893101ae62c8331cefede779ef48d5",
      mutable: true,
      initialSharedVersion: 22329895,
    },
    pythPriceId: "0xc7b72e5d860034288c9335d4d325da4272fe50c92ab72249d58f6cbba30e4c44",
  },
  stIOTA: {
    priceAggregater: {
      objectId: "0x8c730f64aa369eed69ddf7eea39c78bf0afd3f9fbb4ee0dfe457f6dea5a0f4ed",
      mutable: false,
      initialSharedVersion: 22329881,
    },
    vault: {
      objectId: "0xc9cb494657425f350af0948b8509efdd621626922e9337fd65eb161ec33de259",
      mutable: true,
      initialSharedVersion: 22329896,
    },
  },
};

const formatUnits = (value, decimals) => {
  let display = value.toString();
  const negative = display.startsWith("-");
  if (negative) display = display.slice(1);
  display = display.padStart(decimals, "0");
  const integer = display.slice(0, display.length - decimals);
  let fraction = display.slice(display.length - decimals);
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
};

const formatBigInt = (value, decimals = 9) => {
  const formatted = formatUnits(BigInt(value), decimals);
  return Number(formatted);
};

function getIotaObjectData(resp) {
  return resp.data;
}

function isIotaObjectDataWithContent(
  data,
) {
  return data.content !== undefined;
}

function getMoveObject(data) {
  const obj = "data" in data ? getIotaObjectData(data) : data;
  if (!obj || !isIotaObjectDataWithContent(obj) || obj.content.dataType !== "moveObject") {
    return undefined;
  }
  return obj.content;
}

function getObjectFields(resp) {
  if ("fields" in resp) {
    return resp.fields;
  }
  return getMoveObject(resp)?.fields;
}

const parseVaultObject = (coinSymbol, fields) => {
  return {
    token: coinSymbol,
    positionTableSize: fields.position_table.fields.size,
    collateralDecimal: Number(fields.decimal),
    collateralBalance: fields.balance,
    supply: fields.limited_supply.fields.supply,
    maxSupply: fields.limited_supply.fields.limit,
    interestRate: formatBigInt(fields.interest_rate.fields.value, 18),
    minCollateralRatio: formatBigInt(fields.min_collateral_ratio.fields.value),
  };
};

async function getAllVaults() {
  const vaultObjectIds = Object.values(VAULT_MAP).map((v) => v.vault.objectId);

  const vaultResults = await iota.getObjects(vaultObjectIds);
  const vaults = vaultResults.reduce((acc, res) => {
    const fields = getObjectFields(res);
    const token = Object.keys(VAULT_MAP).find(
      (key) => VAULT_MAP[key].vault.objectId === res?.fields.id.id,
    );
    if (!token) return acc;
    const vault = parseVaultObject(token, fields);
    acc[vault.token] = vault;
    return acc;
  }, {});

  return vaults;
}

module.exports = {
  VAULT_MAP,
  formatUnits,
  formatBigInt,
  getIotaObjectData,
  getMoveObject,
  getObjectFields,
  parseVaultObject,
  getAllVaults,
};