const sdk = require("@defillama/sdk");

let cache = {};
function setCallCache(_cache) {
  cache = _cache;
}

async function cachedCalls({ items, multiCall, key }) {
  if (!cache[key]) cache[key] = {};
  const res = [];
  const missingIds = [];
  const missingIndices = [];
  items.forEach((id, i) => {
    if (cache[key][id]) res[i] = cache[key][id];
    else {
      missingIds.push(id);
      missingIndices.push(i);
    }
  });

  if (missingIds.length) {
    sdk.log("Missing ids", missingIds.length, "key", key);
    const tempRes = await multiCall(missingIds);
    missingIds.forEach((id, i) => {
      res[missingIndices[i]] = tempRes[i];
      cache[key][id] = tempRes[i];
    });
  }
  return res;
}

module.exports = {
  setCallCache,
  cachedCalls,
  cache,
};
