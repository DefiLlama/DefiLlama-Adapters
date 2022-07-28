const { sumTokens2 } = require('../helper/unwrapLPs')

const multisig = '0x77314eAA8D99C2Ad55f3ca6dF4300CFC50BdBC7F';
const tokens = ['0x420000000000000000000000000000000000000A', '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21', '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC', '0x4651B38e7ec14BB3db731369BFE5B08F2466Bd0A', '0xEfFEC28996aAff6D55B6D108a46446d45C3a2E71', '0x5ab390084812E145b619ECAA8671d39174a1a6d1',];

async function tvl(timestamp, _, { metis: block }) {
  const chain = 'metis'
  return sumTokens2({ owner: multisig, tokens, chain, block, resolveLP: 'true', })
};

module.exports = {
  metis: {
    tvl,
  }
}
