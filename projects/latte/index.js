
const latteToken = "0x8D78C2ff1fB4FBA08c7691Dfeac7bB425a91c81A";
const lattev2Token = "0xa269A9942086f5F87930499dC8317ccC9dF2b6CB";
const masterchef = "0xbCeE0d15a4402C9Cc894D52cc5E9982F60C463d6";

const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'bsc': '0x4DcE5Bdb81B8D5EdB66cA1b8b2616A8E0Dd5f807'
}, { staking: { bsc: [masterchef, [latteToken, lattev2Token]] }, })