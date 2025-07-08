const { computeValuation } = require("./math");

async function valuateBatches(batches, categories, batchesSupply) {
  const batchValuationDetails = batches.flatMap((batch) => {
    const category = categories[batch.categoryId];
    const supply = batchesSupply[batch.id.toString()];
    return [
      {
        creditsAmount: batch.collateralizedCredits.toString(),
        timeAppreciation: batch.batchTA.toString(),
        certificationDate: batch.certificationDate.toString() + "000",
        crispToken: category.token
      },
      {
        creditsAmount: supply.minus(batch.collateralizedCredits.toString()).toString(),
        timeAppreciation: category.averageTA.toString(),
        certificationDate: batch.certificationDate.toString() + "000",
        crispToken: category.token
      }
    ];
  });

  return batchValuationDetails.map(({ crispToken, ...details }) => ({
    crispToken,
    amount: computeValuation(details)
  }));
}

module.exports = {
  valuateBatches
};
