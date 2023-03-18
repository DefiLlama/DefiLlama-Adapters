const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs');

const FCTR = "0x6dD963C510c2D2f09d5eDdB48Ede45FeD063Eb36"
const veFCTR = "0xA032082B08B2EF5A6C3Ea80DaEac58300F68FB73"
const FCTR_RNDTX = "0x95C34a4efFc5eEF480c65E2865C63EE28F2f9C7e" // Factor Roundtable Index

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    await sumTokens2({
        balances,
        owners: [FCTR_RNDTX],
        tokens: ["0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8", "0x10393c20975cF177a3513071bC110f7962CD67da", "0x088cd8f5eF3652623c22D48b1605DCfE860Cd704", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"],
        chain: 'arbitrum',
        block: chainBlocks.polygon
      })
    return balances;
}

module.exports = {
    arbitrum: {
        tvl: tvl,
        staking: staking(veFCTR, FCTR, "arbitrum")
    }
}
