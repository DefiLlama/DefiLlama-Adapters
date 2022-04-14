const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const contracts = {
    cvxCRVHolder: "0x83507cc8c8b67ed48badd1f59f684d5d02884c81",
    cvxCRV: "0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7",
    cvxFXSHolder: "0xf964b0e3ffdea659c44a5a52bc0b82a24b89ce0e",
    cvxFXS: "0xFEEf77d3f69374f66429C91d732A244f074bdf74",
    cvxFXSOracle: "0xd658A338613198204DCa1143Ac3F01A722b5d94A",
    FXS: "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0"
};

async function tvl(time, block){
    const balances = {};

    balances[contracts.cvxCRV] = (await sdk.api.abi.call({
        target: contracts.cvxCRVHolder,
        abi: abi.totalUnderlying,
        block
    })).output;

    const cvxFXS = (await sdk.api.abi.call({
        target: contracts.cvxFXSHolder,
        abi: abi.totalUnderlying,
        block
    })).output;

    const ratio = (await sdk.api.abi.call({
        target: contracts.cvxFXSOracle,
        abi: abi.priceOracle,
        block
    })).output;

    balances[contracts.FXS] = cvxFXS * ratio * 10**-18;

    return balances;
};

module.exports={
    ethereum:{
        tvl
    }
};