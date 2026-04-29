const sdk = require('@defillama/sdk');

// Dirección del Token y de la Crowdsale en Optimism
const CLASSIS_TOKEN = '0x671eCEc6345ac6b50Dd1Ed839D0ffe2e56842b11';
const CROWDSALE_CONTRACT = '0xf4096004baaa0C79685145b76109f2c220a01C4E';

async function tvl(timestamp, block, chainBlocks, { api }) {
  // La función api.call es la forma moderna de interactuar con contratos
  // No necesitas especificar la red aquí si la defines correctamente en el export
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: CLASSIS_TOKEN,
    params: [CROWDSALE_CONTRACT],
  });

  // Retornamos el balance con el prefijo de la red para el motor de precios
  return {
    [`optimism:${CLASSIS_TOKEN}`]: balance
  };
}

module.exports = {
  timetravel: true, // Permite calcular TVL histórico
  misrepresentedTokens: false,
  methodology: 'El TVL consiste en el balance de tokens CLASSIS depositados en el contrato de la Crowdsale en la red Optimism.',
  optimism: {
    tvl
  }
};

/*const sdk = require('@defillama/sdk');

async function tvl() {
  const balances = {};
  const tokenL2 = '0x671eCEc6345ac6b50Dd1Ed839D0ffe2e56842b11';
  const crowdsale = '0xf4096004baaa0C79685145b76109f2c220a01C4E';

  const { output: balance } = await sdk.api.erc20.balanceOf({
    target: tokenL2,
    owner: crowdsale,
    chain: 'optimism', 
  });

  sdk.util.sumSingleBalance(balances, `optimism:${tokenL2}`, balance);

  return balances;
}

module.exports = {
  methodology: 'TVL en Classis Token calculado como el balance del token en el contrato Crowdsale en Optimism. ',
  ethereum: {
    tvl
  }
};
*/