const iota = require('../helper/chain/iota');

// Object IDs synced with virtue-sdk mainnet CONFIG (src/constants/object.ts)
const VAULT_MAP = {
  IOTA: {
    vault: { objectId: "0xaf306be8419cf059642acdba3b4e79a5ae893101ae62c8331cefede779ef48d5" },
  },
  stIOTA: {
    vault: { objectId: "0xc9cb494657425f350af0948b8509efdd621626922e9337fd65eb161ec33de259" },
  },
  iBTC: {
    vault: { objectId: "0xcc094d9e3b491b0c943bb18daf07a49bd951f34688f9610d90982de06fc0c5c9" },
  },
  vIOTA: {
    vault: { objectId: "0x53b6405d2672be1e73f8ddea1766dbda57f1fed677be58fbfedc9fdddaafdd26" },
  },
};

function getObjectFields(resp) {
  if (!resp) return undefined;
  if (resp.fields) return resp.fields;
  const obj = resp.data ?? resp;
  if (obj?.content?.dataType === 'moveObject') return obj.content.fields;
  return undefined;
}

async function getAllVaults() {
  const entries = Object.entries(VAULT_MAP);
  const vaultObjectIds = entries.map(([, v]) => v.vault.objectId);

  const vaultResults = await iota.getObjects(vaultObjectIds);

  const vaults = {};
  vaultResults.forEach((res, i) => {
    const token = entries[i][0]; // helper getObjects preserves input order
    const fields = getObjectFields(res);
    // Throw rather than skip: a temporarily unreadable vault would silently
    // undercount TVL, which is harder to detect than a failed run (the latter
    // preserves the last known-good value).
    if (!fields) throw new Error(`getAllVaults: could not read vault object for ${token} (${vaultObjectIds[i]})`);
    vaults[token] = {
      token,
      collateralBalance: fields.balance,
      collateralDecimal: Number(fields.decimal),
    };
  });

  return vaults;
}

module.exports = {
  VAULT_MAP,
  getObjectFields,
  getAllVaults,
};
