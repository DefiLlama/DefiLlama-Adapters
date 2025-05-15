const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  return sumTokens2({
    api,
    owners: ['0x51C84b14F63999604246Ec7De0e777500D0631D0'],
    tokens: ['0x4200000000000000000000000000000000000006']
  });
}

async function staking(api) {
  return sumTokens2({
    api,
    owners: ['0x51C84b14F63999604246Ec7De0e777500D0631D0'],
    tokens: ['0x15De59489de5e7F240D72F787dC4a292b8199339']
  })
}

module.exports = {
  start:1688923873, 
  methodology: 'TVL includes tokens staked in our contracts',
  base: { tvl, staking },
};
