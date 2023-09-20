const { config } = require("./config");
const abi = require("./abi.json");

async function fetchCategoriesAndBatches(api, batchIds) {
  const allCategoryIds = new Set();
  const allBatches = [];

  for (let i = 0; i < batchIds.length; i += 10) {
    const ids = batchIds.slice(i, i + 10);
    const [categoryIds, batches] = await fetchCategoryIdsAndBatches(api, ids);
    categoryIds.forEach(id => allCategoryIds.add(id.toString()));
    allBatches.push(...batches);
  }

  const categories = await fetchCategories(api, Array.from(allCategoryIds));

  return [categories, allBatches];
}

async function fetchCategoryIdsAndBatches(api, forwardContractBatchIds) {
  const [categoryIds, batches] = await Promise.all([
    api.multiCall({
      calls: forwardContractBatchIds.map(id => ({
        target: config[api.chain].SolidWorldManager,
        params: [id]
      })),
      abi: abi.getBatchCategory
    }),
    api.multiCall({
      calls: forwardContractBatchIds.map(id => ({
        target: config[api.chain].SolidWorldManager,
        params: [id]
      })),
      abi: abi.getBatch
    })
  ]);

  batches.forEach((batch, i) => {
    batch.categoryId = categoryIds[i].toString();
  });

  return [categoryIds, batches];
}

async function fetchCategories(api, categoryIds) {
  const [categories, categoryTokens] = await Promise.all([
      api.multiCall({
        calls: categoryIds.map(id => ({
          target: config[api.chain].SolidWorldManager,
          params: [id]
        })),
        abi: abi.getCategory
      }),
      api.multiCall({
        calls: categoryIds.map(id => ({
          target: config[api.chain].SolidWorldManager,
          params: [id]
        })),
        abi: abi.getCategoryToken
      })
    ]
  );

  const result = {};
  categoryIds.forEach((id, i) => {
    const category = categories[i];
    category.token = categoryTokens[i];
    result[id] = category;
  });

  return result;
}

module.exports = {
  fetchCategoriesAndBatches
};
