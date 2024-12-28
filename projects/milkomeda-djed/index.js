const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json');

async function tvl(api) {
  const reserve = await api.call({  abi: abi.Djed.reserve, target:'0x67A30B399F5Ed499C1a6Bc0358FA6e42Ea4BCe76', params: 0 })
  api.add(ADDRESSES.milkomeda.WADA, reserve); // Using WADA address instead of mADA
}

module.exports = {
  methodology: 'The TVL of each Djed deployment on Milkomeda C1.',
  milkomeda: {
    tvl,
  },
};
