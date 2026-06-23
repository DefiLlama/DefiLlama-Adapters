const {sumTokens2 } = require("../helper/unwrapLPs.js")
const config = {
    sei: {
        address: "0x7b90821232074285a9ee9bee868bcc36231f8e32",
        fromBlock: 175855916,
    },
};

module.exports = {
    methodology: `TVL is retrieved on-chain by getting the total assets managed by the Rocketizer contracts`,
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
