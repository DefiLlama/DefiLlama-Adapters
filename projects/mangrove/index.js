const abi = require("./abi.json");
const { BigNumber } = require("bignumber.js");

const mgvReader = "0x26fD9643Baf1f8A44b752B28f0D90AEBd04AB3F8";

const getOffers = async (api, { tkn0, tkn1, tickSpacing }) => {
  let total = BigNumber(0);
  let currentId = 0;
  do {
    const [newCurrId, _, offers] = await api.call({
      target: mgvReader,
      abi: abi.offerList,
      params: [[tkn0, tkn1, tickSpacing], currentId, 100],
    });

    for (let i = 0; i < offers.length; i++) {
      const [_1, _2, _3, gives] = offers[i];

      total = total.plus(BigNumber(gives));
    }

    currentId = Number(newCurrId);
  } while (currentId !== 0);

  return total;
};

async function getMangroveTVL(api) {
  const markets = await api.call({
    target: mgvReader,
    abi: abi.openMarkets,
  });

  for (const market of markets) {
    const [tkn0, tkn1, tickSpacing] = market;
    const tkn0TPV = await getOffers(api, { tkn0, tkn1, tickSpacing });
    const tkn1TPV = await getOffers(api, { tkn0: tkn1, tkn1: tkn0, tickSpacing });

    api.addTokens([tkn0, tkn1], [tkn0TPV, tkn1TPV]);
  }
}

module.exports = {
  blast: {
    tvl: getMangroveTVL,
  },
  misrepresentedTokens: false,
  methodology: "TVL is calculated by getting the total promised liquidity on the orderbook on a specific block.",
  start: 1708992000,
};
