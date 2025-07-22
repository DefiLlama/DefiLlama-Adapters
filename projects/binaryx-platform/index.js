const ADDRESSES = require("../helper/coreAssets.json");

const propertyFactoryAddress = '0x5d618C67674945081824e7473821A79E4ec0970F';
const priceOracleAddress = '0x551C261eFcf109378D101de9A2741FB8078Abf45';
const offPlanFactoryAddress = '0x2718fe8eEB091301d1f3D367231aFfE95C2f68Fe';
const offPlanServiceAddress = '0xe442Aa8dC9D8526d7ccDDF4f3f8369294EAfA9dC';

async function tvl(api) {
  await calculateRentalPropertiesTVL(api);
  await calculateOffPlanPropertiesTVL(api);
}

async function calculateRentalPropertiesTVL(api) {
  const rentalAssets = (await api.call({ target: propertyFactoryAddress, abi: 'address[]:getAssets' }))
  const rentalSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: rentalAssets });
  const rentalPrices = await api.multiCall({ abi: 'function latestPrice(address asset) view returns (uint256)', calls: rentalAssets, target: priceOracleAddress });
  rentalSupplies.forEach((supply, i) => {
    const valueInUSDT = (supply / 1e18) * (rentalPrices[i] / 1e6);
    api.add(ADDRESSES.polygon.USDT, valueInUSDT * 1e6);
  });
}

async function calculateOffPlanPropertiesTVL(api) {
  const allOffPlanAssets = await fetchAllOffPlanAssets(api);
  const offPlanSellProgress = await api.multiCall({ 
    abi: 'function getSellProgress(address offPlan) view returns (tuple(uint256 tokensSoldD18, uint256 amountInUsdCollectedD18, uint256 amountInUsdLeftToCollectD18, uint256 tokensLeftD18))', 
    calls: allOffPlanAssets, 
    target: offPlanServiceAddress 
  });
  
  for (let i = 0; i < allOffPlanAssets.length; i++) {
    const valueInUSDT = offPlanSellProgress[i].amountInUsdCollectedD18 / 1e18;
    api.add(ADDRESSES.polygon.USDT, valueInUSDT * 1e6);
  }
}

async function fetchAllOffPlanAssets(api) {
  const pageSize = 20;
  let page = 0;
  let hasMoreOffPlans = true;
  let allOffPlanAssets = [];

  while (hasMoreOffPlans) {
    const { pointers, totalCount } = await api.call({
      target: offPlanFactoryAddress,
      abi: 'function getPointersPaginated(uint256 page, uint256 perPage) view returns (address[] pointers, uint256 totalCount)',
      params: [page, pageSize]
    });

    if (pointers.length > 0) {
      allOffPlanAssets = [...allOffPlanAssets, ...pointers];
    }

    if (allOffPlanAssets.length >= totalCount || pointers.length === 0) {
      hasMoreOffPlans = false;
    } else {
      page++;
    }
  }
  
  return allOffPlanAssets;
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl,
  },
  methodology: "TVL for the Binaryx Platform is calculated by summing the values of all assets. For regular (rental) properties, each asset's value is determined by multiplying its token supply by its token price, where the token price is obtained from the priceOracle. For off-plan properties, the TVL is calculated directly from the amountInUsdCollectedD18 value returned by the getSellProgress method, representing the actual USD amount collected for each off-plan property."
};
