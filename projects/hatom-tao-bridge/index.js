const { getTokenData } = require('../helper/chain/elrond');

const HWTAO = 'HWTAO-2e9136';

const tvl = async (api) => {
  const { supply } = await getTokenData(HWTAO);
  api.addCGToken('bittensor', Number(supply));
}

module.exports = {
  timetravel: false,
  methodology: 'Value of TAO locked in the bridge, measured by HWTAO supply on MultiversX (1 HWTAO = 1 locked TAO).',
  bittensor: { tvl },
}
