const { uniTvlExport } = require('../helper/unknownTokens')
const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const WOMAX = ADDRESSES.omax.WOMAX;
const stakingContractAddress = 0x3A2DcDc705031eDBD94254ef7CEFB93D8066cC8D

async function staking(time, _ethBlock, {omax: block}) {
  const resp = await sdk.api.eth.getBalance({
    target: stakingContractAddress,
    block,
    chain: "omax",
  });
  return {
    [WOMAX]: resp.output,
  };
}

module.exports = {
  polygon: {
    tvl: uniTvlExport('omax', '0x441b9333D1D1ccAd27f2755e69d24E60c9d8F9CF'),
    staking
  }
}
