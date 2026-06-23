const ADDRESSES = require('../helper/coreAssets.json')
const FlareSFLR="0x12e605bc104e93B45e1aD99F9e555f659051c2BB";
const FlareUSDT0=ADDRESSES.monad.USDT
const FlareWFLR=ADDRESSES.flare.WFLR;
const FlareFXRP='0xad552a648c74d49e10027ab8a618a3ad4901c5be'

async function FlareTvl(api) {
  const tokens = [FlareWFLR, FlareSFLR, FlareUSDT0, FlareFXRP];
  const owners = ["0x74DA11B3Bb05277CF1cd3572a74d626949183e58"];
  return api.sumTokens({ owners, tokens });
}

module.exports = {
  flare: {
    tvl: FlareTvl,
  },
};
