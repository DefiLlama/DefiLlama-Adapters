const utils = require('../helper/utils');
const { toUSDT } = require('../helper/balances');
let _response

const getMultiplier = (decimals) => (decimals === 18 ? 1e18 : 1e6);

const ZtakeV1Address = "0x9248F1Ee8cBD029F3D22A92EB270333a39846fB2"


async function tvl(api) {
  if (!_response) _response = utils.fetchURL('https://api.getclave.io/api/v1/invest/tvl')
  const response = await _response;
  const tvlData= response.data

  // Clave aggregator tvl
  const claveAggregatorTVL = tvlData.reduce((accumulator, pool) => {
    const key = `era:${pool.token}`;
    const amount = toUSDT(pool.amount, getMultiplier(pool.decimals));

    accumulator[key] = amount;
    return accumulator;
  }, {});

  // Clave ztake tvl
  const ZK = await api.call({  abi: 'address:ZK', target: ZtakeV1Address})
  const claveZtakeTVL =  await api.sumTokens({ owner: ZtakeV1Address, tokens: [ZK] })


return {...claveZtakeTVL, ...claveAggregatorTVL}
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  era: {
    tvl,
  }
}
