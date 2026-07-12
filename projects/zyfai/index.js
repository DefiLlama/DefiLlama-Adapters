const { allPoolTokens: baseTokens } = require('./base');
const { getConfig } = require('../helper/cache');
const { allPoolTokens: ethereumPoolTokens } = require('./ethereum');

// --- inlined from ./helpers ---
const SILO_POOL_ADDRESSES = {
    'S-USDC-20': '0x322e1d5384aa4ED66AeCa770B95686271de61dc3',
    'S-USDC-8': '0x4E216C15697C1392fE59e1014B009505E05810Df',
    'wstkscUSD-USDC-23': '0x5954ce6671d97D24B782920ddCdBB4b1E63aB2De',
    'Anon-USDC-27': '0x7e88AE5E50474A48deA4c42a634aA7485e7CaA62',
    'x33-USDC-49': '0xa18a8f100f2c976044f2f84fae1eE9f807Ae7893',
    'PT-wstkscUSD (29 May)-USDC-34': '0x6030aD53d90ec2fB67F3805794dBB3Fa5FD6Eb64',
    'wstkscUSD-USDC-55': '0x4935FaDB17df859667Cc4F7bfE6a8cB24f86F8d0',
    'Re7 scUSD': '0x592D1e187729C76EfacC6dfFB9355bd7BF47B2a7',
    // 'Apostro - USDC': '0xcca902f2d3d265151f123d8ce8FdAc38ba9745ed', // distressed
    // 'Varlamore USDC Growth': '0xF6F87073cF8929C206A77b0694619DC776F89885', // distressed
    // 'Greenhouse USDC': '0xf6bC16B79c469b94Cdd25F3e2334DD4FEE47A581' // distressed
};
const AAVE_TOKEN_ADDRESS = '0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6';
const EULER_POOL_ADDRESSES = {
    'MEV Capital Sonic Cluster USDC.e': '0x196F3C7443E940911EE2Bb88e019Fd71400349D9',
    'Re7 Labs Cluster USDC.e': '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc',
};
const PENDLE_MARKET_ADDRESSES = {
    aUSDC: {
        lp: '0x3f5ea53d1160177445b1898afbb16da111182418',
        pt: '0x930441aa7ab17654df5663781ca0c02cc17e6643',
        yt: '0x18d2d54f42ba720851bae861b98a0f4b079e6027',
        sy: '0xc4a9d8b486f388cc0e4168d2904277e8c8372fa3',
    },
    scUSD: {
        lp: '0x84ecc6be573f15991736131f924f7bf571ed3b60',
        pt: '0x9731842ed581816913933c01de142c7ee412a8c8',
        yt: '0x3ab07241db5e87e45edca012ddf4bde84c078920',
        sy: '0x068def65b9dbaff02b4ee54572a9fa7dfb188ea3',
    },
    'Lp - wstkscUSD': {
        lp: '0x004f76045b42ef3e89814b12b37e69da19c8a212',
        pt: '0x0fb682c9692addcc1769f4d4d938c54420d54fa3',
        yt: '0x2405243576fdff777d54963bca4782180287b6a1',
        sy: '0x896f4d49916ac5cfc36d7a260a7039ba4ea317b6',
    },
};
const BEETS_POOL = {
    deposit: '0x54Ca9aad90324C022bBeD0A94b7380c03aA5884A',
    stake: '0x724a6716bf9CA384584bEb51a2eA07564c7fdD69',
};
const PENPIE_MARKET_ADDRESS = '0x3f5ea53d1160177445b1898afbb16da111182418';
const PENPIE_CONTRACT = '0x7A89614B596720D4D0f51A69D6C1d55dB97E9aAB';
const YIELDFI_POOL = {
    'yUSD': "0x4772D2e014F9fC3a820C444e3313968e9a5C8121"
}

async function beetsTvl(api, owners) {
    const calls = owners.flatMap(owner => [
        { target: BEETS_POOL.deposit, params: [owner] },
        { target: BEETS_POOL.stake, params: [owner] },
    ]);
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls });

    // Process balances in pairs (deposit + stake) for each owner
    for (let i = 0; i < balances.length; i += 2) {
        const depositBalance = Number(balances[i]);
        const stakeBalance = Number(balances[i + 1]);
        const totalBalance = depositBalance + stakeBalance;

        // Add the combined balance for both deposit and stake tokens
        api.add(calls[i].target, totalBalance);
        api.add(calls[i + 1].target, totalBalance);
    }
}

async function penpieTvl(api, owners) {
    const balanceCalls = owners.map(owner => ({
        target: PENPIE_CONTRACT,
        params: [PENPIE_MARKET_ADDRESS, owner]
    }));
    const balances = await api.multiCall({
        abi: 'function balance(address,address) view returns (uint256)',
        calls: balanceCalls,
    });

    balances.forEach(balance => {
        api.add(PENPIE_MARKET_ADDRESS, balance);
    });
}

const sonicTokens = [
    YIELDFI_POOL.yUSD,
    ...Object.values(PENDLE_MARKET_ADDRESSES).flatMap(market =>
        Object.values(market)),
    ...Object.values(EULER_POOL_ADDRESSES),
    AAVE_TOKEN_ADDRESS,
    ...Object.values(SILO_POOL_ADDRESSES),

]

// --- inlined from ./arbitrum ---
const COMPOUND_POOLS = {
    USDC: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
    WETH: '0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486',
    USDT: '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07',
};
// Aave V3 aToken addresses (Arbitrum)
const ARBITRUM_AAVE_POOLS = {
    USDC: '0x724dc807b04555b71ed48a6896b6F41593b8C637',
    WETH: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
    wstETH: '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf',
    WBTC: '0x078f358208685046a11C85e8ad32895DED33A249',
    USDT: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
};
const ARBITRUM_MORPHO_POOLS = {
    'Gauntlet USDC Prime': '0x7c574174DA4b2be3f705c6244B4BfA0815a8B3Ed',
    'Gauntlet USDC Core': '0x7e97fa6893871A2751B5fE961978DCCb2c201E65',
    'Steakhouse Prime USDC': '0x250CF7c82bAc7cB6cf899b6052979d4B5BA1f9ca',
    'MEV Capital USDC': '0xa60643c90A542A95026C0F1dbdB0615fF42019Cf',
    'Hyperithm USDC': '0x4B6F1C9E5d470b97181786b26da0d0945A7cf027',
    'Steakhouse High Yield USDC': '0x5c0C306Aaa9F877de636f4d5822cA9F2E81563BA',
    'Yearn Degen': '0x36b69949d60d06ECcC14DE0Ae63f4E00cc2cd8B9',
    'Steakhouse High Yield USDT': '0xbeeff77CE5C059445714E6A3490E273fE7F2492F',
};
const ARBITRUM_SPARK_POOLS = {
    USDC: '0x940098b108fB7D0a7E374f6eDED7760787464609',
};
const ARBITRUM_FLUID_POOLS = {
    'USDC Vault': '0x1A996cb54bb95462040408C06122D45D6Cdb6096',
    'WETH Vault': '0x45Df0656F8aDf017590009d2f1898eeca4F0a205',
    'wstETH Vault': '0x66C25Cd75EBdAA7E04816F643d8E46cecd3183c9',
    'USDT Vault': '0x4A03F37e7d3fC243e3f99341d36f4b829BEe5E03',
};
const ARBITRUM_SILO_POOLS = {
    // 'USDC - Varlamore USDC Growth': '0x2BA39e5388aC6C702Cb29AEA78d52aa66832f1ee', // distressed
    'Silo Optima Vault': '0x2514A2Ce842705EAD703d02fABFd8250BfCfb8bd',
    'ETH - Ethereal': '0xd8c989aB5f5b2ABDc76a8D3Acec165300BF30ecD',
};
const ARBITRUM_EULER_POOLS = {
    'Euler Earn USDC': '0xe4783824593a50Bfe9dc873204CEc171ebC62dE0',
    'Euler Arbitrum Yield': '0x05d28A86E057364F6ad1a88944297E58Fc6160b3',
    'Euler Theo': '0x44C10DA836d2aBe881b77bbB0b3DCE5f85C0C1Cc',
    'K3 Capital USDai Cluster': '0x6aFB8d3F6D4A34e9cB2f217317f4dc8e05Aa673b',
    'Euler Arbitrum WBTC': '0x889E1c458B2469b70aCcdfb5B59726dC1668896C',
};
const ARBITRUM_HARVEST_POOLS = {
    'USDC - Autopilot': '0x407D3d942d0911a2fEA7E22417f81E27c02D6c6F',
};
const ARBITRUM_DOLOMITE_POOLS = {
    'USDC': '0x444868B6e8079ac2c55eea115250f92C2b2c4D14',
    'WETH': '0xf7b5127B510E568fdC39e6Bb54e2081BFaD489AF',
};
const arbitrumPoolTokens = [
    ...Object.values(COMPOUND_POOLS),
    ...Object.values(ARBITRUM_AAVE_POOLS),
    ...Object.values(ARBITRUM_MORPHO_POOLS),
    ...Object.values(ARBITRUM_SPARK_POOLS),
    ...Object.values(ARBITRUM_FLUID_POOLS),
    ...Object.values(ARBITRUM_SILO_POOLS),
    ...Object.values(ARBITRUM_EULER_POOLS),
    ...Object.values(ARBITRUM_HARVEST_POOLS),
    ...Object.values(ARBITRUM_DOLOMITE_POOLS),
]

// --- inlined from ./plasma ---
// Aave V3 aToken addresses (Plasma)
const PLASMA_AAVE_POOLS = {
    USDT0: '0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948',
    WETH: '0xf1aB7f60128924d69f6d7dE25A20eF70bBd43d07',
};

const PLASMA_FLUID_POOLS = {
    'USDT0': '0x1DD4b13fcAE900C60a350589BE8052959D2Ed27B',
    'WETH Vault': '0x5E494e8912319cefb1d4Fa516807bB65A8CB9E40',
};
const PLASMA_EULER_POOLS = {
    'K3 Capital USDT0 Vault': '0xe818ad0D20D504C55601b9d5e0E137314414dec4',
    'Re7 USDT0 Core': '0xa5EeD1615cd883dD6883ca3a385F525e3bEB4E79',
    'Hyperithm Euler USDT': '0x66bE42a0BdA425A8C3b3c2cF4F4Cb9EDfcAEd21d',
};

const plasmaPoolTokens = [
    ...Object.values(PLASMA_AAVE_POOLS),
    ...Object.values(PLASMA_FLUID_POOLS),
    ...Object.values(PLASMA_EULER_POOLS),
]

const TOKENS = {
  base: baseTokens,
  arbitrum: arbitrumPoolTokens,
  plasma: plasmaPoolTokens,
  ethereum: ethereumPoolTokens,
  sonic: sonicTokens,
};

async function tvl(api) {
    const owners = await getConfig('zyfai/'+api.chain, `https://api.zyf.ai/api/v1/data/active-wallets?chainId=${api.chainId}`);
    const cleanOwners = owners.filter(o => o !== '');

    if(api.chain == 'sonic') {
        await Promise.all([
            beetsTvl(api, cleanOwners),
            penpieTvl(api, cleanOwners),
        ]);
    }

    return api.sumTokens({ownerTokens: cleanOwners.map(o => [TOKENS[api.chain], o])});
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: { tvl },
    base: { tvl },
    arbitrum: { tvl },
    plasma: { tvl },
    ethereum: { tvl },
}