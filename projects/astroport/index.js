const {getFactoryTvl} = require('../terraswap/factoryTvl')

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    terra: {
        tvl: getFactoryTvl(
            "terra1fnywlw4edny3vw44x04xd67uzkdqluymgreu7g"
        )
    },
    terra2: {
        tvl: getFactoryTvl(
            "terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r", 
            true
        )
    }
} // node test.js projects/astroport/index.js