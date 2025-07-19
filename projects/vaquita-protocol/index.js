const { sumTokens2 } = require('../helper/unwrapLPs');

const VAQUITA_CONTRACT = '0xfA95214EA8195e9D256Bb18adF0F56b3dEc66FaE';
const A_TOKEN_ADDRESS = '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB';

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [VAQUITA_CONTRACT],
    tokens: [A_TOKEN_ADDRESS],
  });
}

module.exports = {
  base: { tvl }, 
  methodology: 'TVL is calculated by checking the aBasUSDC balance (Aave USDC on Base) held by VaquitaPool contract',
};
