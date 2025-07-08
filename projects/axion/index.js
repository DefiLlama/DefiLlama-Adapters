const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const { sumTokensExport } = require('../helper/unwrapLPs');

const AXION = "0x839F1a22A59eAAf26c85958712aB32F80FEA23d9";
const MANAGER = "0x5F95DB799CecD1E9d95f66bA36a88A9a571Db9cD";
async function staking(api) {
  const { totalStakedAmount} = await api.call({    target: MANAGER,    abi: abi.getStatFields,  });
  // Add 12 0's since total staked amount is 6 decimals, but token amount is 18 decimals
  api.add(AXION, totalStakedAmount * 1e12);
}

const VC = "0x660B71C03C15B24EFa800F2454540CD9011E40cB"

module.exports = {
  polygon: {
    staking,
    tvl: sumTokensExport({ owner: VC, tokens: [ADDRESSES.polygon.WBTC], })
  },
};
