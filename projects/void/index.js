const { sumTokens2 } = require('../helper/unwrapLPs');

const tokenReflectionsAwardAddress = "0x78cCb45a43731cf989C740e9cb31f3d192Bd0f8b"
const fantomTreasuryAddress = "0xf0a793024Ac47e421EB8c4673212dfCcE42f4a97"
const spookySwapLPAddress = "0xfC66Ac63D414d3CF3dcdDa9e60742F6E789205e3"

async function fantomTvl(timestamp, block, chainBlocks) {
    const balances = {};
    await sumTokens2({
        balances,
        owners: [fantomTreasuryAddress, tokenReflectionsAwardAddress],
        tokens: ["0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", "0x0e249130b3545a2a287DE9f27d805CAB95f03DB9", "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", spookySwapLPAddress],
        chain: 'fantom',
        block: chainBlocks.fantom,
    })
    return balances;
}

module.exports = {
    methodology: "Counting the LP tokens locked in the Fantom Treasury & counting the tokens locked in the Token Reflections Award contract",
    fantom: {
        tvl: fantomTvl,
    }
}