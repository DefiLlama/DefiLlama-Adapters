const {sumTokens2 } = require("../helper/unwrapLPs.js")
const {
    config,
  } = require("./config.js");

module.exports = {
    methodology: `TVL is retrieved on-chain by getting the total assets managed by the Monetizer contracts`,
};

async function tvl(api) {
    const chainConfig = config[api.chain]
    const {address: monetizer, fromBlock} = chainConfig
    const collaterals = await api.call({  abi: 'address[]:getCollateralList', target: monetizer, block: fromBlock})
    return sumTokens2({ api, owner: monetizer, tokens: collaterals })
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = { tvl }
});
