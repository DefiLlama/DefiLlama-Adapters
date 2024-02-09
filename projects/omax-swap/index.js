const { getUniTVL } = require('../helper/unknownTokens')
const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const WOMAX = ADDRESSES.omax.WOMAX;
const stakingContractAddress = '0x3A2DcDc705031eDBD94254ef7CEFB93D8066cC8D'

async function staking(time, _ethBlock, chainBlocks) {
  const { output } = await sdk.api.eth.getBalance({
    target: stakingContractAddress,
    chain: "omax",
  });
  const balances = {}
  sdk.util.sumSingleBalance(balances, WOMAX, output, 'omax')
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  omax: {
    tvl: getUniTVL({ factory: '0x441b9333D1D1ccAd27f2755e69d24E60c9d8F9CF', useDefaultCoreAssets: true, chain: 'omax' }),
    staking,
  }
}
