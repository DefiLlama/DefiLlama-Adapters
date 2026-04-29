const CLASSIS_TOKEN = '0x671eCEc6345ac6b50Dd1Ed839D0ffe2e56842b11';
const CROWDSALE_CONTRACT = '0xf4096004baaa0C79685145b76109f2c220a01C4E';

async function tvl(timestamp, block, chainBlocks, { api }) {
  // api.call detecta automáticamente la cadena 'optimism' del bloque export
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: CLASSIS_TOKEN,
    params: [CROWDSALE_CONTRACT],
  });

  // Usamos el helper api.add para manejar los balances de forma más limpia
  api.add(CLASSIS_TOKEN, balance)
  return api.getBalances();
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'El TVL consiste en el balance de tokens CLASSIS depositados en el contrato de la Crowdsale en la red Optimism.',
  optimism: {
    tvl
  }
};
