const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs');

const insuranceTokensOp = {
  VELO: '0x9560e827af36c94d2ac33a39bce1fe78631088db',
}

const VE_VELO_NFT = "0xFAf8FD17D9840595845582fCB047DF13f006787d";

async function getInsuranceFundValueOp(api, INSURANCE_FUND) {
  await unwrapSolidlyVeNft({ api, baseToken: insuranceTokensOp.VELO, veNft: VE_VELO_NFT, owner: INSURANCE_FUND })
}

module.exports = {
  getInsuranceFundValueOp,
}
