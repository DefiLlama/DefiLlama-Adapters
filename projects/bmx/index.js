const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");
const sdk = require('@defillama/sdk')

const vaultAddress = "0xec8d8D4b215727f3476FF0ab41c406FA99b4272C";

module.exports = {
    methodology: "BMX liquidity is calculated by the value of tokens in the BLT pool.",
    base: {
        tvl: gmxExports({ vault: vaultAddress })
    },
};
