const abi = require('./abi.json');

async function tvl(api) {
  const reserve = await api.call({  abi: abi.Djed.reserve, target:'0x67A30B399F5Ed499C1a6Bc0358FA6e42Ea4BCe76', params: 0 })
  api.add('0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9', reserve); // Using WADA address instead of mADA
}

module.exports = {
  methodology: 'The TVL of each Djed deployment on Milkomeda C1.',
  milkomeda: {
    start: 10440400,
    tvl,
  },
};
