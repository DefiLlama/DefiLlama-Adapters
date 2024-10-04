const ADDRESSES = require('../helper/coreAssets.json')
const {compoundExports} = require('../helper/compound')

const { stakingUnknownPricedLP } = require("../helper/staking");
const token = "0x10C9284E6094b71D3CE4E38B8bFfc668199da677";
const stakingContract = "0x268E2E1e5a465034Ee5742DA578feb41B228ad7B";

const wCRO = ADDRESSES.cronos.WCRO_1;
const mmCRO = "0xff024211741059a2540b01f5Be2e75fC0c1b3d82";

module.exports = {
    cronos: {
        ...compoundExports(
            "0xdD8c94211dD19155EFFbd57EAb6D4e0DE31A3b9E",
            mmCRO,
            wCRO,
        ),
        staking: stakingUnknownPricedLP(stakingContract, token, "cronos", "0xf56FDfeeF0Ba3de23DaB13a85602bd7BF135E80f", addr=>`cronos:${addr}`)
    }
}
