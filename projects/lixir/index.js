const sdk = require('@defillama/sdk');
const abi = require('./abi.json')

const registry = "0x3228f22d98d81A859aCC9890c3874FfF864a8Bd4";
const vault_role = "0x0e2208c692f4f271957e6c9d7c9785b7c2c3a7e329d54eecdfaa3c5f48b0cd51";
const lixirToken = "0xd0345D30FD918D7682398ACbCdf139C808998709";

const newVaults = [
    {
        // wbtcVault
        'contract': '0x9E815d1c9a4BE458e7F9A0aDD703e7545EDa7C28',
        'tokenLocked': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
    },{
        // wbtcGauge
        'contract': '0x94555c8BE71545aDFF49CA1bB95f4dEBaf720F15',
        'tokenLocked': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
    },{
        // usdcVault
        'contract': '0x453A9f40a24DbE3CdB4edC988aF9bfE0F5602b15',
        'tokenLocked': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    },{
        // usdcGauge
        'contract': '0x4Cad76Bb7d7ee4CA1b360A5aC974195A373932CF',
        'tokenLocked': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    }
];
const stakingVaults = [
    {
        // lixVault
        'contract': '0xda559e686B7BB1eaeC95B3548555866e4174A3ac',
        'tokenLocked': '0xd0345d30fd918d7682398acbcdf139c808998709'
    },{
        // lixGauge
        'contract': '0xDa42DEC00F7A11a325daf53a144c041Afb5AD448',
        'tokenLocked': '0xd0345d30fd918d7682398acbcdf139c808998709'
    },{
        // stakingContract
        'contract': '0x29adccf67821e9236b401df02080bac67f84192d',
        'tokenLocked': '0xd0345d30fd918d7682398acbcdf139c808998709'
    }
];
// node test.js projects/lixir/index.js
async function ethTvl(timestamp, block) {
    let balances = await oldVaultTvl(block, {});
    return await newVaultTvl(block, newVaults, balances);
};
async function oldVaultTvl(block, balances, pool2 = false) {
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
        if ((!pool2 && (token0.output[i].output.toLowerCase() != lixirToken.toLowerCase() || 
                token1.output[i].output.toLowerCase() != lixirToken.toLowerCase()))
            || (pool2 && (token0.output[i].output.toLowerCase() == lixirToken.toLowerCase() || 
                token1.output[i].output.toLowerCase() == lixirToken.toLowerCase()))) {
            sdk.util.sumSingleBalance(
                balances, 
                token0.output[i].output, 
                totals.output[i].output[0])
            sdk.util.sumSingleBalance(
                balances, 
                token1.output[i].output, 
                totals.output[i].output[1])
        }
    }

    return balances;
};
async function staking(timestamp, block) {
    return await newVaultTvl(block, stakingVaults, {});
};

async function pool2(timestamp, block) {
    return await oldVaultTvl(block, {}, true);
};

async function newVaultTvl(block, vaults, balances) {
    const newValueBalances = (await sdk.api.abi.multiCall({
        block,
        abi: abi.balanceOf,
        calls: vaults.map((c) => ({
            target: c.tokenLocked,
            params: c.contract,
        }))
    })).output.map(b => b.output);

    for (let i = 0; i < vaults.length; i++) {
        balances[vaults[i].tokenLocked] = (balances[vaults[i].tokenLocked]) 
            ? Number(balances[vaults[i].tokenLocked]) + Number(newValueBalances[i])
            : newValueBalances[i];
    };

    return balances;
}


module.exports={
    ethereum:{
        tvl: ethTvl,
        staking,
        pool2
    }
}