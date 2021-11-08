const sdk = require("@defillama/sdk");
const {masterChefExports} = require("../helper/masterchef");

const token = "0x1fd6cF265fd3428F655378a803658942095b4C4e"
const masterchef = "0x1B8deA992Ebb340a151383E18F63c1e89cE180a4";

module.exports = {
    polygon: {
        ...masterChefExports(masterchef, "polygon", token)
    },
    ...masterChefExports(masterchef, "polygon", token)
    
}