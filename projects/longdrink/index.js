const { pool2 } = require('../helper/pool2')

const bev = "0xc7dac962c166a26038ec4bc5d0e2a3fe0ff3ce58"
const l1q = "0xf8d5c25a47d28866b4c1ce285f42997c690f941c"

async function tvl(api) {
  const tokens = [bev, l1q]
  const bals = await api.multiCall({  abi:'erc20:totalSupply' , calls:tokens })
  api.add(tokens, bals)
}

const LPstaking = "0x986581a915f8abf4C8E21781a2c45FD4Eb21699D"
const lp = "0x5ab4dc6ec350e546103f6891299b467293c36c3e"

module.exports = {
  bsc: {
    tvl,
    pool2: pool2(LPstaking, lp),
  },
};