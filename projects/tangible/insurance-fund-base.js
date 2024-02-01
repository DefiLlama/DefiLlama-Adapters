const VE_VELO_ABI = require('./abi/VeVeloNFT.json');
const { createIncrementArray } = require('../helper/utils');

const insuranceTokensBase = {
  AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
}

const VE_AERO_NFT = "0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4";

async function getInsuranceFundValueBase(api, INSURANCE_FUND) {
  const count = await api.call({ abi: 'erc20:balanceOf', target: VE_AERO_NFT, params: INSURANCE_FUND })
  const tokenIds = await api.multiCall({ abi: VE_VELO_ABI.ownerToNFTokenIdList, calls: createIncrementArray(count).map(i => ({ params: [INSURANCE_FUND, i] })), target: VE_AERO_NFT })
  const bals = await api.multiCall({ abi: VE_VELO_ABI.locked, calls: tokenIds, target: VE_AERO_NFT })
  bals.forEach(i => api.add(insuranceTokensBase.AERO, i.amount))
}

module.exports = {
  getInsuranceFundValueBase,
}
