const { getUniTVL } = require('../helper/unknownTokens')
const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const stakingContractAddress = '0x3A2DcDc705031eDBD94254ef7CEFB93D8066cC8D'

async function staking(time, _ethBlock, chainBlocks) {
  const resp = await sdk.api.eth.getBalance({
    target: stakingContractAddress,
    block: chainBlocks.omax,
    chain: "omax",
  });
  return {
    [ADDRESSES.null]: resp.output,
  };
}

module.exports = {
  misrepresentedTokens: true,
  omax: {
    tvl: getUniTVL({ factory: '0x441b9333D1D1ccAd27f2755e69d24E60c9d8F9CF', useDefaultCoreAssets: true, chain: 'omax' }),
    staking
  }
}
