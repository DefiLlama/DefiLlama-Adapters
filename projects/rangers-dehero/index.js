const { sumTokens2 } = require('../helper/unwrapLPs');
const { default: axios } = require("axios")

const url = 'https://scan.rangersprotocol.com/api'

const tokens = {
  //'COIN': '0x3978e3cab1c503efad75cb929c7076b7f4f3b6f2', //1000
  //'C-COIN': '0x190e1151c722f1d629500b6efe055d1649eea201', //1000
  'AMG': '0xdaa6a6919c9543d8787490f5e9ad532c4d7ce9e8', //62
  'MIX': '0x36426b7bf5709e5c2160411c6e8b1832e3404fe1' //112
}

const paramsArray = () => {
  const p = {
    method: "Rangers_getERC20TokenHolders",
    jsonrpc: "2.0",
    id: 1
  }
  return Object.values(tokens).map(addr => {
    const params = [addr]
    return {...p,params}
  })
}

async function getOwners() {
  let owners = []
  const plist = paramsArray();
  
  for (let value of plist) {
    try {
      const holders = (await axios.post(url,value)).data.result.data;
      for (const item of holders) {
        owners.push(item.Owner)
      }
    } catch (error) {
      console.log(error)
    }
  }
  return owners
}

async function tvl(_, _b, _cb, { api, }) { 
  const owners = await getOwners();
  return sumTokens2({ api, owners, tokens: Object.values(tokens) })
}
module.exports = {
  misrepresentedTokens: true,
  methodology: "Count the total amount of AMG and MIX held by holders on the rangers blockchain.",
  rpg: {
    tvl
  }
}