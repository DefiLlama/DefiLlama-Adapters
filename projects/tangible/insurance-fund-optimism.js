const VE_VELO_ABI = require('./abi/VeVeloNFT.json');
const { createIncrementArray } = require('../helper/utils');

const insuranceTokensOp = {
  VELO: '0x9560e827af36c94d2ac33a39bce1fe78631088db',
}

const VE_VELO_NFT = "0xFAf8FD17D9840595845582fCB047DF13f006787d";

async function getInsuranceFundValueOp(api, INSURANCE_FUND) {
  const count = await api.call({ abi: 'erc20:balanceOf', target: VE_VELO_NFT, params: INSURANCE_FUND })
  const tokenIds = await api.multiCall({ abi: VE_VELO_ABI.ownerToNFTokenIdList, calls: createIncrementArray(count).map(i => ({ params: [INSURANCE_FUND, i]})), target: VE_VELO_NFT })
  const bals = await api.multiCall({ abi: VE_VELO_ABI.locked, calls: tokenIds, target: VE_VELO_NFT })
  bals.forEach(i => api.add(insuranceTokensOp.VELO, i.amount))
}

module.exports = {
  getInsuranceFundValueOp,
}
