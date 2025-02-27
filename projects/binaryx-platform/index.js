const ADDRESSES = require("../helper/coreAssets.json");

const propertyFactoryAddress = '0x5d618C67674945081824e7473821A79E4ec0970F';
const priceOracleAddress = '0x551C261eFcf109378D101de9A2741FB8078Abf45';
const offPlanFactoryAddress = '0x5d618C67674945081824e7473821A79E4ec0970F'; // Replace with actual off-plan factory address
const offPlanServiceAddress = '0x551C261eFcf109378D101de9A2741FB8078Abf45'; // Replace with actual off-plan service address

// not relevant assets
const excludedTokens = ['0xC478d5C1E7F19D035Ad330bE09cb84eB9582D7F1', '0xd2198dBB407f5405284d0A00eA6624D087b7098b', '0x228ce2B019B5a54C545E61490E5ba66E40915868'].map(i => i.toLowerCase())


async function tvl(api) {
  // Regular (rental) properties TVL calculation
  const rentalAssets = (await api.call({ target: propertyFactoryAddress, abi: 'address[]:getAssets', })).filter(address => !excludedTokens.includes(address.toLowerCase()));
  const rentalSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: rentalAssets })
  const rentalPrices = await api.multiCall({ abi: 'function latestPrice(address asset) view returns (uint256)', calls: rentalAssets, target: priceOracleAddress, })

  rentalSupplies.forEach((v, i) => api.add(ADDRESSES.polygon.USDT, v * rentalPrices[i] / 1e18))

  // Off-plan properties TVL calculation using pagination
  const pageSize = 20;
  let page = 0;
  let hasMoreOffPlans = true;
  let allOffPlanAssets = [];

  // Fetch all off-plan assets using pagination
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
  
  const offPlanTotalSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: allOffPlanAssets });
  const offPlanContractBalances = await api.multiCall({ 
    abi: 'function balanceOf(address account) view returns (uint256)', 
    calls: allOffPlanAssets.map(asset => ({ target: asset, params: [asset] })) 
  });
  
  // Use OffPlanService.currentTokenPriceD18 method to get token prices for off-plans
  const offPlanPrices = await api.multiCall({ 
    abi: 'function currentTokenPriceD18(address offPlan) view returns (uint256)', 
    calls: allOffPlanAssets, 
    target: offPlanServiceAddress 
  });

  // For off-plan assets, we only count tokens that are not on the contract balance
  for (let i = 0; i < allOffPlanAssets.length; i++) {
    // Calculate tokens in circulation (total supply - contract's own balance)
    const tokensInCirculation = offPlanTotalSupplies[i] - offPlanContractBalances[i];
    api.add(ADDRESSES.polygon.USDT, tokensInCirculation * offPlanPrices[i] / 1e18);
  }
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl,
  },
  methodology: "TVL for the Binaryx Platform is calculated by summing the values of all assets, with each asset's value determined by multiplying its token supply by its token price, where the token price is obtained from the priceOracle. For off-plan properties, only tokens that are not on the contract's own balance are counted in the TVL calculation, and their prices are obtained from the OffPlanService's currentTokenPriceD18 method."
};
