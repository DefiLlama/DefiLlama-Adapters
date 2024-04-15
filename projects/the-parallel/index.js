
const {  stakings } = require('../helper/staking')
// Token PRL
const PRL_TOKEN = '0xd07e82440A395f3F3551b42dA9210CD1Ef4f8B24'

// LPs
 // I see that these LPs are locked in https://www.bscscan.com/address/0xe837b727752afc637c29bc9d8d7c3296b0a31067 but the owner is EOA, so it should not be counted towards tvl
const PRL_WBNB_PANCAKE_LP = "0xd69ac770ec555c9cf4cbf2415e22e31fffbbd489"
const PRL_BUSD_PANCAKE_LP = "0xb5FEAE037c2330a8F298F39bcE96dd6E69f4Fa0E"
const PRL_BUSD_KYBER_LP = "0x3E95e07550E9798272130AB65b58f2f17b3f7c57"

// Contracts 
const PRL_LOCKED = '0x9A5AC21399A6Fd7D6232CA0B52A6b0658727A3d2'
const PRL_MINING = '0x21EFC3DDE8a69Fb8A5403406ebDd23e08C924785'

module.exports = {
    bsc: {
        staking: stakings([ PRL_MINING, PRL_LOCKED, ], PRL_TOKEN),
        tvl: () => ({}),
    }
}