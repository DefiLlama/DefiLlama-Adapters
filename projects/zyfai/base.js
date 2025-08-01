const AAVE_TOKEN_ADDRESS = '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB';
const FLUID_POOL_ADDRESSES = {
    'USDC': '0xf42f5795D9ac7e9D757dB633D693cD548Cfd9169'
};
const MORPHO_POOL_ADDRESSES = {
    'Universal - USDC': '0xB7890CEE6CF4792cdCC13489D36D9d42726ab863',
    'Moonwell Flagship USDC': '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca',
    'Seamless USDC Vault': '0x616a4E1db48e22028f6bbf20444Cd3b8e3273738',
    'HighYield Clearstar USDC': '0xE74c499fA461AF1844fCa84204490877787cED56',
    'Clearstar Reactor OpenEden Boosted USDC': '0x1D3b1Cd0a0f242d598834b3F2d126dC6bd774657'
};
const SPARK_POOL_ADDRESSES = {
    'USDC': '0x3128a0F7f0ea68E7B7c9B00AFa7E41045828e858'
};
const COMPOUND_TOKEN_ADDRESS = '0xb125E6687d4313864e53df431d5425969c15Eb2F';

const MOONWELL_POOL_ADDRESSES = {
    'Moonwell Flagship USDC': '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca',
    'USDC': '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22'
};

const HARVEST_POOLS = { 
    'USDC': '0x90613e167D42CA420942082157B42AF6fc6a8087', 
    'USDC - Autopilot': '0x0d877Dc7C8Fa3aD980DfDb18B48eC9F8768359C4'
};
const WASABI_POOLS = { 'USDC': '0x1C4a802FD6B591BB71dAA01D8335e43719048B24' };
const AURA_POOLS = { 'USDC - GHO': "0x28a002a98F4DA7A7B541b5e4d7a42E0F64E4aeF1"};
const YIELDFI_BASE_POOLS = {
    'yUSD': '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    'vyUSD': '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
};

async function harvestTvl(api, owners) {
    const harvestPools = Object.values(HARVEST_POOLS);
    const balanceCalls = harvestPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    balances.forEach((balance, i) => {
        api.add(balanceCalls[i].target, balance);
    }); 
}

async function wasabiTvl(api, owners) {
    const wasabiPools = Object.values(WASABI_POOLS);
    const balanceCalls = wasabiPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    balances.forEach((balance, i) => {
        api.add(balanceCalls[i].target, balance);
    });
}

async function auraTvl(api, owners) {
    const auraPools = Object.values(AURA_POOLS);
    const balanceCalls = auraPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    balances.forEach((balance, i) => {
        api.add(balanceCalls[i].target, balance);
    });
}

async function yieldfiTvl(api, owners) {
    const yieldfiPools = Object.values(YIELDFI_BASE_POOLS);
    const balanceCalls = yieldfiPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    balances.forEach((balance, i) => {
        api.add(balanceCalls[i].target, balance);
    });
}

async function compoundTvl(api, owners) {
    const balanceCalls = owners.map(owner => ({ target: COMPOUND_TOKEN_ADDRESS, params: [owner] }));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    const total = balances.reduce((sum, bal) => sum + Number(bal) / 1e6, 0);
    api.add(COMPOUND_TOKEN_ADDRESS, total);
}

async function moonwellTvl(api, owners) {
    const moonwellPools = Object.values(MOONWELL_POOL_ADDRESSES);
    const balanceCalls = moonwellPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    balances.forEach((balance, i) => {
        api.add(balanceCalls[i].target, balance);
    });
}

async function aaveTvl(api, owners) {
    const balanceCalls = owners.map(owner => ({ target: AAVE_TOKEN_ADDRESS, params: [owner] }));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    const total = balances.reduce((sum, bal) => sum + Number(bal) / 1e6, 0);
    api.add(AAVE_TOKEN_ADDRESS, total);
}

async function fluidTvl(api, owners) {
    const fluidPools = Object.values(FLUID_POOL_ADDRESSES);
    const balanceCalls = fluidPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    balances.forEach((balance, i) => {
        api.add(balanceCalls[i].target, balance);
    });
}

async function morphoTvl(api, owners) {
    const morphoPools = Object.values(MORPHO_POOL_ADDRESSES);
    const balanceCalls = morphoPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    balances.forEach((balance, i) => {
        api.add(balanceCalls[i].target, balance);
    });
}

async function sparkTvl(api, owners) {
    const sparkPools = Object.values(SPARK_POOL_ADDRESSES);
    const balanceCalls = sparkPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    balances.forEach((balance, i) => {
        api.add(balanceCalls[i].target, balance);
    });
}

module.exports = {
    aaveTvl,
    fluidTvl,
    morphoTvl,
    sparkTvl,
    compoundTvl,
    moonwellTvl,
    harvestTvl,
    wasabiTvl,
    auraTvl,
    yieldfiTvl
};