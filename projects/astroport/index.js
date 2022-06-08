const {getFactoryTvl} = require('../terraswap/factoryTvl')

const oldFactory = "terra1fnywlw4edny3vw44x04xd67uzkdqluymgreu7g"
const factory = "terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r"
module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    terra: {
        tvl: getFactoryTvl(oldFactory)
    },
    terra2: {
        tvl: getFactoryTvl(factory)
    }
}