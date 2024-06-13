const { onChainTvl } = require('../helper/balancer')

const config = {
    vault: "0xFB43069f6d0473B85686a85F4Ce4Fc1FD8F00875",
    startingBlock: 81_247_457,
};

module.exports = {
    sei: {
        tvl: onChainTvl(config.vault, config.startingBlock),
    }
}
