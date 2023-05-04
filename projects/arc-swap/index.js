const { masterChefExports } = require('../helper/masterchef')

const token = "0xC82E3dB60A52CF7529253b4eC688f631aad9e7c2";
const masterchef = "0x1575F4b5364dDBd6c9C77D1fE603E2d76432aA6a";

module.exports = {
    ...masterChefExports(masterchef, "ethereum", token)
}