const sdk = require('@defillama/sdk');
const abi = require('./abi.json')
const {staking} = require('../helper/staking')

const oldRegistry = "0x3228f22d98d81A859aCC9890c3874FfF864a8Bd4";
const newRegistry = "0x18bf8A3eE39Be5730189A0C88D90f744e3c55B20";
const vault_role = "0x0e2208c692f4f271957e6c9d7c9785b7c2c3a7e329d54eecdfaa3c5f48b0cd51";
const lixirToken = "0xd0345D30FD918D7682398ACbCdf139C808998709";

// node test.js projects/lixir/index.js
async function ethTvl(timestamp, block) {
    let balances = await vaultTvl(oldRegistry, block, {});
    await vaultTvl(newRegistry, block, balances)
    return balances//await newVaultTvl(block, newVaults, balances);
};
async function vaultTvl(registry, block, balances, pool2 = false) {
    const count = Number((await sdk.api.abi.call({
        target: registry,
        block, 
        params: [vault_role],
        abi: abi.getRoleMemberCount
    })).output)

    const vaults = await sdk.api.abi.multiCall({
        block,
        abi: abi.getRoleMember,
        calls: [...Array(count)].map((_, i) => ({
            target: registry,
            params: [vault_role, i],
        }))
    })

    const calls = vaults.output.map(v=>({
        target: v.output
    }))

    const [totals, token0, token1] = await Promise.all([
        abi.calculateTotals, 
        abi.token0, 
        abi.token1
    ].map(abi=>sdk.api.abi.multiCall({
        block,
        abi,
        calls
    })))

    for(let i =0; i<count; i++){
        // if pool2, only sum pool2's, else leave out pool2's
        /*
        if ((!pool2 && (token0.output[i].output.toLowerCase() != lixirToken.toLowerCase() || 
                token1.output[i].output.toLowerCase() != lixirToken.toLowerCase()))
            || (pool2 && (token0.output[i].output.toLowerCase() == lixirToken.toLowerCase() || 
                token1.output[i].output.toLowerCase() == lixirToken.toLowerCase()))) {
        */
            sdk.util.sumSingleBalance(
                balances, 
                token0.output[i].output, 
                totals.output[i].output[0])
            sdk.util.sumSingleBalance(
                balances, 
                token1.output[i].output, 
                totals.output[i].output[1])
        //}
    }

    return balances;
};

module.exports={
    ethereum:{
        tvl: ethTvl,
        staking: staking("0x29adccf67821e9236b401df02080bac67f84192d", lixirToken)
    }
}