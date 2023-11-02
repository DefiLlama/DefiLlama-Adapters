const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract_ethereum = "0xf76550821b62702e95e181aeb77284ce70d4fe90"
const contract_base = "0xf76550821b62702e95e181aeb77284ce70d4fe90"
const contract_arbitrum = "0xf76550821b62702e95e181aeb77284ce70d4fe90"
const contract_era = "0x4Abb1bFcFb2af3d897B891DA265d94fb6C02B005"

async function tvl_ethereum(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract_ethereum, api })
}

async function tvl_base(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract_base, api })
}

async function tvl_arbitrum(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract_arbitrum, api })
}

async function tvl_era(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract_era, api })
}

module.exports = {
    methodology: `We count the ETH on ${contract_ethereum} , ${contract_base} , ${contract_arbitrum} and ${contract_era}`,
    ethereum: {
        tvl_ethereum
    },
    base: {
        tvl_base
    },
    arbitrum: {
        tvl_arbitrum
    },
    era: {
        tvl_era
    }

}
