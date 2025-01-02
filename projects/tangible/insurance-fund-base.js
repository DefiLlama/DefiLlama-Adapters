const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs');

const insuranceTokensBase = {
  AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
}

const VE_AERO_NFT = "0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4";

async function getInsuranceFundValueBase(api, INSURANCE_FUND) {
  await unwrapSolidlyVeNft({ api, baseToken: insuranceTokensBase.AERO, veNft: VE_AERO_NFT, owner: INSURANCE_FUND })
}

module.exports = {
  getInsuranceFundValueBase,
}
