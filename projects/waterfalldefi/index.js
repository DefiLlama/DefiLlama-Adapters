const abi = require("./abi.json");
const url = "https://raw.githubusercontent.com/WaterfallDefi/product-addresses/master/main.json";
let _response
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');


async function getAddresses(url) {
  if (!_response) _response = getConfig('waterfalldefi', url)
  let res = await _response;
  return res;
}

async function staking(api) {
  let data = await getAddresses(url);
  let wtf = data[api.chain].wtf;
  const owner = data[api.chain]["staking"].address
  return sumTokens2({ api, tokens: [wtf], owner })
}

async function tvl(api) {
  let data = await getAddresses(url);
  const products = data[api.chain].tranches
  const isActive = await api.multiCall({ abi: abi.cycleActive, calls: products.map(p => p.address) })
  const ownerTokens = []
  const tranchesAutoCalls = []
  const tranchesNonAutoCalls = []
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (isActive[i]) {
      let calls = product.auto ? tranchesAutoCalls : tranchesNonAutoCalls;
      let tranche_n = product.tranche_n;

      for (let i = 0; i < tranche_n; i++)
        calls.push({ target: product.address, params: i, address: product.currency[i], ratio: product.currencyRatios[i] })
    } else {
      ownerTokens.push([product.currency, product.address]);
    }
  }
  const autoRes = await api.multiCall({  abi: abi.tranchesAuto, calls: tranchesAutoCalls})
  const nonAutoRes = await api.multiCall({ abi: abi.tranchesNonAuto, calls: tranchesNonAutoCalls})
  autoRes.forEach((res, i) => api.add(tranchesAutoCalls[i].address, res.autoPrincipal * tranchesAutoCalls[i].ratio / 100))
  nonAutoRes.forEach((res, i) => api.add(tranchesNonAutoCalls[i].address, res.principal * tranchesNonAutoCalls[i].ratio / 100))

  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology: 'Counts Waterfall DeFi tranche products TVL and staking TVL',
  bsc: { tvl, staking },
  avax: { tvl, staking },
};

