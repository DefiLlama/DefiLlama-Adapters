const sdk = require("@defillama/sdk");
const {
    invokeViewFunction,
} = require("../helper/chain/supra");
const { transformBalances } = require("../helper/portedTokens");

const SUPRA_COIN_INFO_STRUCT_TYPE = "0x1::supra_coin::SupraCoin"
const GET_SLOT_DEPOSITS_FUNCTION_TYPE =
    "0xda20f7d0ec813c751926f06004a10bc6ee1eefc96798f6a1aa31447ee146f932::citadel_vault::slot_deposits";

const calculateCitadelVaultsTVL = async (api) => {
    let balances = {};
    let chain = api.chain;
    let data = await invokeViewFunction(
        GET_SLOT_DEPOSITS_FUNCTION_TYPE,
        [SUPRA_COIN_INFO_STRUCT_TYPE],
        [["0x89906c6955124df6cdb3472b5299724572143f721430e328357a9e5b08efd9b3","0x60d4f787c012f5a3dbcab1ab8a2f357ee55f91a78852da34d6d0aa6e6b4b6f20","0x57f62e074c2f4aa3759389ee572c6ccdd4e53ff8d23f8afe4735461761248da","0x933214c4e3c70dad1bfec1a0e8ce280d318c7ffb3b4c7579ef26d33569eb1857","0xc373f27aee4b8f05b8ed4072faa4b9ceb220159ca9b6ae2ab7d3f15d01f9936","0xc3e87cc982ecf8c2b4009c55ae95844357c4af757fcd56a7143ae842178183a8"]]
    );
    for (const item of data[0]) {
        sdk.util.sumSingleBalance(balances, SUPRA_COIN_INFO_STRUCT_TYPE, item);
    }
    return transformBalances(chain, balances);
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    supra: {
        tvl: calculateCitadelVaultsTVL,
    },
};