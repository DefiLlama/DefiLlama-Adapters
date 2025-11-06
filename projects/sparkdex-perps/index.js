const FlareSFLR="0x12e605bc104e93B45e1aD99F9e555f659051c2BB";
const FlareUSDT0="0xe7cd86e13AC4309349F30B3435a9d337750fC82D"
const FlareWFLR='0x1d80c49bbbcd1c0911346656b529df9e5c2f783d';
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
