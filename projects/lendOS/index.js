const { aaveChainTvl } = require('../helper/aave');
const methodologies = require('../helper/methodologies');

const v3params = ["0x550F9Cc46566560D8d608815Aac34305cADaF569", undefined, ["0x3A1ca459F21D8FAcF9A30bC4773f5dBf07C1191d"]]

function v3(chain) {
  let params = v3params
  if (chain === 'neon_evm')
    params = ['0x550F9Cc46566560D8d608815Aac34305cADaF569', undefined, ['0x3A1ca459F21D8FAcF9A30bC4773f5dBf07C1191d']]
  const section = borrowed => aaveChainTvl(chain, ...params, borrowed, true);
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = {
  methodology: methodologies.lendingMarket,
  neon_evm: v3("neon_evm"),
};