const {masterChefExports} = require('../helper/masterchef')

const GENESIS = "0x2638bE7B0d033A59cbcA9139B470503F0a711379"
module.exports={
    misrepresentedTokens: true,
    methodology: "Tokens in masterchef",
    ...masterChefExports("0xbf0929439Ea073d55DE8bd0F6e0293Ec30e42Df8", "cronos", GENESIS)
}
