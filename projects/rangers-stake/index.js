const { default: axios } = require("axios")

const url = 'https://minerconsole.rangersprotocol.com/api/getminer'
const deUrl = "https://coins.llama.fi/prices/current/"

async function getMiner(){
    const miners = (await axios.post(url)).data;
    let stake = 0;
    for (const item of miners) {
        stake += item.stake
    }
    return stake
}

async function getRPGPrice() {
    const contract = "rpg:0x71d9cfd1b7adb1e8eb4c193ce6ffbe19b4aee0db"
    const token = (await axios.get(deUrl + contract)).data;
    const price = token.coins[contract].price;
    return price;
}

getRPGPrice()
async function tvl(){
    const tvl = (await getMiner()) * (await getRPGPrice());
    return {
        tether: tvl
    }
}

module.exports = {
    methodology: "The total amount of money miners have staked in order to mine on the rangers blockchain.",
    rpg: {
        tvl
    }
}