const utils = require("../helper/utils");

const chains = {
  fantom: "fantom",
  ethereum: "ethereum",
  bsc: "bsc",
  heco: "heco",
  matic: "polygon",
  harmony: "harmony",
};

const url = "https://adminv1.knit.finance/api/tvl";

function fetchChain(chain) {
  return async () => {
    const { data } = await utils.fetchURL(url);
    console.log(data.data.data.info);
    let list = data.data.data.info;

    const protocolsInChain =
      chain === null
        ? list
        : list.filter((p) => p.chain.toString() === chain.toString());

    const coingeckoMcaps = {};
    const counted = {};
    let total = 0;
    protocolsInChain.forEach((item) => {
      const tvl = Number(item.tvl || 0);

      total += tvl;
    });
    return total;
  };
}

const chainTvls = {};
Object.keys(chains).forEach((chain) => {
  const chainName = chains[chain];
  chainTvls[chainName === "matic" ? "polygon" : chainName] = {
    fetch: fetchChain(chain),
  };
});

module.exports = {
  fetch: fetchChain(null),
};
