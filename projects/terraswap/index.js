const { getFactoryTvl } = require('./factoryTvl')

const factory = {
    classic: "terra1ulgw0td86nvs4wtpsc80thv6xelk76ut7a7apj",
    terra2: "terra1466nf3zuxpya8q9emxukd7vftaf6h4psr0a07srl5zw74zh84yjqxl5qul",
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    terra: { tvl: getFactoryTvl(factory.classic) },
    terra2: { tvl: getFactoryTvl(factory.terra2) },
    hallmarks:[
    ['2022-05-07', "UST depeg"],
  ]
}
