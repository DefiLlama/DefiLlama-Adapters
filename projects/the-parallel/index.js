const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const { pool2s } = require("../helper/pool2")
const { transformBscAddress } = require("../helper/portedTokens")

// Token PRL
const PRL_TOKEN = '0xd07e82440A395f3F3551b42dA9210CD1Ef4f8B24'

// LPs
const PRL_WBNB_PANCAKE_LP = "0xd69ac770ec555c9cf4cbf2415e22e31fffbbd489"
const PRL_BUSD_PANCAKE_LP = "0xb5FEAE037c2330a8F298F39bcE96dd6E69f4Fa0E"
const PRL_BUSD_KYBER_LP = "0x3E95e07550E9798272130AB65b58f2f17b3f7c57"

// Contracts 
const PRL_LOCKED = '0x9A5AC21399A6Fd7D6232CA0B52A6b0658727A3d2'
const PRL_MINING = '0x21EFC3DDE8a69Fb8A5403406ebDd23e08C924785'

const coins = {
    //token addresses
    PRL: "0xd07e82440A395f3F3551b42dA9210CD1Ef4f8B24",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56"
}

const lpContracts = [
    PRL_TOKEN
];
const lpAddresses = [
    PRL_WBNB_PANCAKE_LP,
    PRL_BUSD_PANCAKE_LP,
]

/**
* TVLCALC
* = toUSD('WBNB', WBNB.balanceOf(PRL_WBNB_PANCAKE_LP)) 
* + toUSD('BUSD', BUSD.balanceOf(PRL_WBNB_PANCAKE_LP) + BUSD.balanceOf(PRL_BUSD_PANCAKE_LP) + BUSD.balanceOf(PRL_BUSD_KYBER_LP))
* + toUSD('PRL', BUSD.balanceOf(PRL_WBNB_PANCAKE_LP) + PRL.balanceOf(PRL_BUSD_PANCAKE_LP) + PRL.balanceOf(PRL_BUSD_KYBER_LP) + PRL.balanceOf(PRL_LOCKED) + PRL.balanceOf(PRL_MINING))
*/

async function tvl(timestamp, block) {
    const balances = {};
    const transform = await transformBscAddress();

    // for PRL_WBNB_PANCAKE_LP
    const PRL_WBNB_PANCAKE_LP_wbnb_bal = await sdk.api.erc20.balanceOf({ target: coins.WBNB, owner: PRL_WBNB_PANCAKE_LP, block, chain: 'bsc' })
    sdk.util.sumSingleBalance(balances, transform(coins.WBNB), PRL_WBNB_PANCAKE_LP_wbnb_bal.output);

    const PRL_WBNB_PANCAKE_LP_prl_bal = await sdk.api.erc20.balanceOf({ target: coins.PRL, owner: PRL_WBNB_PANCAKE_LP, block, chain: 'bsc' })
    sdk.util.sumSingleBalance(balances, transform(coins.PRL), PRL_WBNB_PANCAKE_LP_prl_bal.output);


    // for PRL_BUSD_PANCAKE_LP

    const PRL_BUSD_PANCAKE_LP_prl_bal = await sdk.api.erc20.balanceOf({ target: coins.PRL, owner: PRL_BUSD_PANCAKE_LP, block, chain: 'bsc' })
    sdk.util.sumSingleBalance(balances, transform(coins.PRL), PRL_BUSD_PANCAKE_LP_prl_bal.output);

    const PRL_BUSD_PANCAKE_LP_busd_bal = await sdk.api.erc20.balanceOf({ target: coins.BUSD, owner: PRL_BUSD_PANCAKE_LP, block, chain: 'bsc' })
    sdk.util.sumSingleBalance(balances, transform(coins.BUSD), PRL_BUSD_PANCAKE_LP_busd_bal.output);

    // for PRL_BUSD_KYBER_LP

    const PRL_BUSD_KYBER_LP_prl_bal = await sdk.api.erc20.balanceOf({ target: coins.PRL, owner: PRL_BUSD_KYBER_LP, block, chain: 'bsc' })
    sdk.util.sumSingleBalance(balances, transform(coins.PRL), PRL_BUSD_KYBER_LP_prl_bal.output);

    const PRL_BUSD_KYBER_LP_busd_bal = await sdk.api.erc20.balanceOf({ target: coins.BUSD, owner: PRL_BUSD_KYBER_LP, block, chain: 'bsc' })
    sdk.util.sumSingleBalance(balances, transform(coins.BUSD), PRL_BUSD_KYBER_LP_busd_bal.output);

    return balances;
}

async function staking(timestamp, ethBlock, chainBlocks) {

    // for PRL_LOCKED

    const PRL_LOCKED_prl_bal = await sdk.api.erc20.balanceOf({ target: coins.PRL, owner: PRL_LOCKED, ethBlock, chain: 'bsc' })

    // for PRL_MINING
    const PRL_MINING_prl_bal = await sdk.api.erc20.balanceOf({ target: coins.PRL, owner: PRL_MINING, ethBlock, chain: 'bsc' })


    return { 'bsc:0xd07e82440A395f3F3551b42dA9210CD1Ef4f8B24': new BigNumber(PRL_LOCKED_prl_bal.output).plus(new BigNumber(PRL_MINING_prl_bal.output)).toString(10) }
}


module.exports = {
    bsc: {
        staking: staking,
        tvl: tvl,
    }
}