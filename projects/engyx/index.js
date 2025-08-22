const sdk = require('@defillama/sdk');

const ENGYX_TOKEN_CONTRACT = '0xe1ec410835e5dFA47A6893448Cbc0AC216dBE642';

const ENGYX_WALLETS = [
  '0x058BAA4a1466Ac45D383c1813089f95e11658fD4',
  '0x792871536771e9DD3e9141158B0D86b8F56E1F89',
  '0x849f6EfB27726DFdbAC21B29754a9c98e25B4d4E',
  '0x3149245225Ef28297834c5BeC6776f42c56cCe36',
  '0xb7DE9BDD8Ad938F986F57f2b5d740C973e54ABF2',
  '0xBE2d1D4330d7C589AB0D5F34b2Aef7D8570b7937',
  '0xD20fF9eBa96CfB12E95804544870B141184deC80',
];

async function tvl(api) {
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: ENGYX_WALLETS.map(wallet => ({ target: ENGYX_TOKEN_CONTRACT, params: [wallet] })),
  });

  await api.addTokens(
    ENGYX_WALLETS.map(() => ENGYX_TOKEN_CONTRACT),
    balances
  );

  return api.getBalances();
}

module.exports = {
  methodology: 'Cuenta los tokens Engyx bloqueados en todas las wallets del protocolo.',
  start: 0,
  timetravel: false,
  misrepresentedTokens: true,
  bsc: { tvl },
};
