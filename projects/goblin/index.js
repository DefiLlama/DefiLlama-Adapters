const {masterChefExports} = require('../helper/masterchef')

const GOBLIN = "0x81570aB82533cbd5DB529d29596180eF688c52ba"
module.exports={
    misrepresentedTokens: true,
    methodology: "Tokens in masterchef",
    ...masterChefExports("0x0a05f6022D6e051539b190Bff7E484068A7dd0a4", "fantom", GOBLIN)
}