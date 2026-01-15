const {sumTokens2 } = require("../helper/unwrapLPs.js")
const {
    config,
  } = require("./config.js");

module.exports = {
    methodology: `TVL is retrieved on-chain by getting the total assets managed by the Parallelizer contracts`,
};

async function tvl(api) {
    const chainConfig = config[api.chain]
    const {address: parallelizerAddress, fromBlock} = chainConfig
    const collaterals = await api.call({  abi: 'address[]:getCollateralList', target: parallelizerAddress, block: fromBlock})
    return sumTokens2({ api, owner: parallelizerAddress, tokens: collaterals })
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = { tvl }
});
