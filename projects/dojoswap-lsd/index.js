const BigNumber = require("bignumber.js");
// const { getFactoryTvl } = require("../terraswap/factoryTvl");

const toQueryMsg = (msg) => {
  try {
    return JSON.stringify(JSON.parse(msg))
  } catch (error) {
    return ""
  }
}

const getUrl = (contract, msg) => {
  const query_msg =
    typeof msg === "string" ? toQueryMsg(msg) : JSON.stringify(msg)
  return `${`https://sentry.lcd.injective.network:443`}/cosmwasm/wasm/v1/contract/${contract}/smart/${btoa(query_msg)}`
}

const ADDRESSES = {
  LSD_CONTRACT: 'inj17glv5mk2pvhpwkdjljacmr2fx9pfc3djepy6xh',
  STAKED_INJ_TOKEN_CONTRACT: 'inj134wfjutywny9qnyux2xgdmm0hfj7mwpl39r3r9',
  MULTICAL_CONTRACT: 'inj1578zx2zmp46l554zlw5jqq3nslth6ss04dv0ee'
}

async function stateLSD() {
  const query = {
    address: ADDRESSES.LSD_CONTRACT,
    data: btoa(JSON.stringify({ state: {} }))
  };

  const url = getUrl(ADDRESSES.MULTICAL_CONTRACT, { aggregate: { queries: [query] } });
  const reponse = await fetch(url);
  const data = await reponse.json();
  const data2 = data.data.return_data?.map((e) => {
    return e.length == 0
      ? null
      : JSON.parse(Buffer.from(e.data, 'base64').toString())
  });
  return data2
}

async function getLDP() {
  const [state] = await Promise.all([
    stateLSD()
  ]);
  return state[0].tvl_utoken
}

async function staking() {
  /// LSD
  const data2 = await getLDP();
  const state = (new BigNumber(data2)).div(new BigNumber(10 ** 18)) || new BigNumber(0);

  /// INJ price
  const response3 = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=injective-protocol&vs_currencies=usd');
  const data3 = await response3.json();
  const injPrice = data3['injective-protocol'].usd;

  const lsdTvl = state.multipliedBy(injPrice).toNumber();

  return {
    tether: lsdTvl,
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  injective: { tvl: staking },
};
