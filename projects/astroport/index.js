const { getFactoryTvl } = require('../terraswap/factoryTvl')

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    injective: {
        tvl: getFactoryTvl("inj19aenkaj6qhymmt746av8ck4r8euthq3zmxr2r6",)
    },
    terra2: {
        tvl: getFactoryTvl("terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r")
    },
    neutron: {
        tvl: getFactoryTvl("neutron1hptk0k5kng7hjy35vmh009qd5m6l33609nypgf2yc6nqnewduqasxplt4e")
    },
} // node test.js projects/astroport/index.js