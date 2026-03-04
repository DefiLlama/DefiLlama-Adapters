const { sumTokens2 } = require("../helper/chain/cardano");

const DEX_POOL_ADDR = "addr1z8ke0c9p89rjfwmuh98jpt8ky74uy5mffjft3zlcld9h7ml3lmln3mwk0y3zsh3gs3dzqlwa9rjzrxawkwm4udw9axhs6fuu6e";
const DEX_ORDERBOOK_ADDR = "addr1z8d9k3aw6w24eyfjacy809h68dv2rwnpw0arrfau98jk6nhv88awp8sgxk65d6kry0mar3rd0dlkfljz7dv64eu39vfs38yd9p";
const STAKING_ADDR = 'addr1zydjdnzpmnv9xzjt4xh9sjfzkk2hcdj4sw39ak58wpvh56cgjrxwszhuqj73gufx56c8qwnuhvf2nw5dzdr5f50rqr5q2m7uqv';

const CONTRACT_ADDRESSES = [ DEX_POOL_ADDR, DEX_ORDERBOOK_ADDR ];
const CSWAP_ASSET_ID = 'c863ceaa796d5429b526c336ab45016abd636859f331758e67204e5c4353574150';

// new TVL using the DEX
async function tvl() {
  const assetsLocked = await sumTokens2({
    owners: CONTRACT_ADDRESSES}
  )

  return assetsLocked
}

async function staking() {
  const assetsStaked = await sumTokens2({
    owner: STAKING_ADDR,
    tokens: [ CSWAP_ASSET_ID ]
  });
  return assetsStaked
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
    staking
  },
}
