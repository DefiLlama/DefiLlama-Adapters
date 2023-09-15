const VE_CHR_ABI = require('./abi/VeChrNFT.json');

const insuranceTokensArb = {
  CHR: '0x15b2fb8f08e4ac1ce019eadae02ee92aedf06851',
}

const VE_CHR_NFT = "0x9A01857f33aa382b1d5bb96C3180347862432B0d";

async function getInsuranceFundValueArb(api, INSURANCE_FUND) {
  const tokenIds = await api.call({ abi: VE_CHR_ABI.tokensOfOwner, target: VE_CHR_NFT, params: INSURANCE_FUND })
  const bals = await api.multiCall({ abi: VE_CHR_ABI.locked, calls: tokenIds, target: VE_CHR_NFT, })
  bals.forEach(i => api.add(insuranceTokensArb.CHR, i.amount))
}

module.exports = {
  getInsuranceFundValueArb,
}
