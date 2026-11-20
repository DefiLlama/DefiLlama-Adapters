const { allPoolTokens: baseTokens, unpricedVaults: baseUnpricedVaults, makinaPairs, morphoBlueMarkets: baseBlueMarkets } = require('./base');
const { getConfig } = require('../helper/cache');
const { getLowValueCache } = require('../helper/cache/lowValue');
const { sliceIntoChunks } = require('../helper/utils');
const { toAssetsDown } = require('../helper/morpoho');
const morphoAbi = require('../helper/abis/morpho.json').morphoBlueFunctions;
const { allPoolTokens: ethereumPoolTokens, unpricedVaults: ethereumUnpricedVaults, morphoBlueMarkets: ethereumBlueMarkets } = require('./ethereum');

const MORPHO = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb';

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

// Every reader below takes `wallets`: { owners, add(owner, token, amount), fail(owner) }. Balances are collected per
// wallet instead of straight into the api, so that low-value wallets can be stored (see tvl). A failed read marks its
// wallet with fail(): the rest of that wallet is still counted, it is just not stored.
async function beetsTvl(api, wallets) {
    const { owners } = wallets;
    const calls = owners.flatMap(owner => [
        { target: BEETS_POOL.deposit, params: [owner] },
        { target: BEETS_POOL.stake, params: [owner] },
    ]);
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls, permitFailure: true });

    owners.forEach((owner, i) => {
        const depositBalance = balances[2 * i];
        const stakeBalance = balances[2 * i + 1];
        if (depositBalance == null || stakeBalance == null) return wallets.fail(owner);
        const totalBalance = BigInt(depositBalance) + BigInt(stakeBalance);

        // Add the combined balance for both deposit and stake tokens
        wallets.add(owner, BEETS_POOL.deposit, totalBalance);
        wallets.add(owner, BEETS_POOL.stake, totalBalance);
    });
}

async function penpieTvl(api, wallets) {
    const { owners } = wallets;
    const balances = await api.multiCall({
        abi: 'function balance(address,address) view returns (uint256)',
        calls: owners.map(owner => ({ target: PENPIE_CONTRACT, params: [PENPIE_MARKET_ADDRESS, owner] })),
        permitFailure: true,
    });

    owners.forEach((owner, i) => {
        if (balances[i] == null) return wallets.fail(owner);
        wallets.add(owner, PENPIE_MARKET_ADDRESS, balances[i]);
    });
}

async function poolTokensTvl(api, wallets, tokens) {
    const { owners } = wallets;
    tokens = [...new Set(tokens.map(token => token.toLowerCase()))]; // the lists overlap; a token is counted once per wallet
    const calls = owners.flatMap(owner => tokens.map(token => ({ target: token, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls, permitFailure: true });
    balances.forEach((balance, i) => {
        const owner = owners[Math.floor(i / tokens.length)];
        if (balance == null) return wallets.fail(owner);
        wallets.add(owner, tokens[i % tokens.length], balance);
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
    'KPK USDC Yield' : '0x5837e4189819637853a357aF36650902347F5e73',
    'Steakhouse USDG Pro': '0xbeeFf72B77e7584a450E887125F25E8D8819016a',
    'Gauntlet USDG Premium': '0x390c1bb01F3F627144a40617e287d4cE3D5aBCfa',
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
const ARBITRUM_AUTOFINANCE_POOLS = {
    USDC: '0xf63b7F49B4f5Dc5D0e7e583Cfd79DC64E646320c', // arbUSD
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
    ...Object.values(ARBITRUM_AUTOFINANCE_POOLS),
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

// Llama drops these share tokens (no coins.llama.fi price). convertToAssets into the underlying, which is priced.
async function unpricedVaultsTvl(api, wallets, vaults) {
    const { owners } = wallets;
    const assets = await api.multiCall({ abi: 'address:asset', calls: vaults, permitFailure: true });
    const vaultAsset = {};
    vaults.forEach((vault, i) => { if (assets[i]) vaultAsset[vault.toLowerCase()] = assets[i]; });
    const okVaults = Object.keys(vaultAsset);
    if (!okVaults.length) return;

    const calls = owners.flatMap(owner => okVaults.map(vault => ({ target: vault, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls, permitFailure: true });

    const convertCalls = [];
    const converted = [];
    balances.forEach((balance, i) => {
        const owner = owners[Math.floor(i / okVaults.length)];
        if (balance == null) return wallets.fail(owner);
        if (balance === '0') return;
        convertCalls.push({ target: calls[i].target, params: [balance] });
        converted.push({ owner, asset: vaultAsset[calls[i].target.toLowerCase()] });
    });
    if (!convertCalls.length) return;

    const amounts = await api.multiCall({
        abi: 'function convertToAssets(uint256) view returns (uint256)',
        calls: convertCalls,
        permitFailure: true,
    });
    amounts.forEach((amount, i) => {
        if (amount == null) return wallets.fail(converted[i].owner);
        wallets.add(converted[i].owner, converted[i].asset, amount);
    });
}

// projects/makina-finance values a share balance with these two calls. lastTotalAum() is the whole
// machine, so it is not used here: Zyfai only holds the share token. Llama prices the accounting token.
const makinaAbi = {
    accountingToken: 'address:accountingToken',
    convertToAssets: 'function convertToAssets(uint256 shares) view returns (uint256)',
};

async function makinaSharesTvl(api, wallets, pairs) {
    const { owners } = wallets;
    if (!owners.length || !pairs.length) return;
    const accountings = await api.multiCall({
        abi: makinaAbi.accountingToken,
        calls: pairs.map((pair) => pair.machine),
        permitFailure: true,
    });
    const calls = owners.flatMap((owner) => pairs.map((pair) => ({ target: pair.share, params: [owner] })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls, permitFailure: true });
    const held = [];
    balances.forEach((shares, i) => {
        const owner = owners[Math.floor(i / pairs.length)];
        const pairIndex = i % pairs.length;
        // a machine whose accounting token could not be read cannot be valued: its holders are read again next run
        if (shares == null || (!accountings[pairIndex] && BigInt(shares) !== 0n)) return wallets.fail(owner);
        if (BigInt(shares) === 0n) return;
        held.push({ owner, machine: pairs[pairIndex].machine, accountingToken: accountings[pairIndex], shares });
    });
    if (!held.length) return;
    const amounts = await api.multiCall({
        abi: makinaAbi.convertToAssets,
        calls: held.map(({ machine, shares }) => ({ target: machine, params: [shares] })),
        permitFailure: true,
    });
    held.forEach(({ owner, accountingToken }, i) => {
        if (amounts[i] == null) return wallets.fail(owner);
        wallets.add(owner, accountingToken, amounts[i]);
    });
}

// Morpho Blue supply is not an ERC-20: convert supply shares with the market totals and add the
// loan token. Market ids stay out of allPoolTokens.
async function morphoBlueSupplyTvl(api, wallets, marketIds) {
    const { owners } = wallets;
    if (!owners.length || !marketIds.length) return;
    const params = await api.multiCall({ target: MORPHO, abi: morphoAbi.idToMarketParams, calls: marketIds, permitFailure: true });
    const markets = await api.multiCall({ target: MORPHO, abi: morphoAbi.market, calls: marketIds, permitFailure: true });
    const positions = await api.multiCall({
        target: MORPHO,
        abi: morphoAbi.position,
        calls: owners.flatMap((owner) => marketIds.map((id) => ({ params: [id, owner] }))),
        permitFailure: true,
    });
    positions.forEach((position, i) => {
        const owner = owners[Math.floor(i / marketIds.length)];
        const m = i % marketIds.length;
        if (!position || !params[m] || !markets[m]) return wallets.fail(owner);
        const assets = toAssetsDown(position.supplyShares, markets[m].totalSupplyAssets, markets[m].totalSupplyShares);
        wallets.add(owner, params[m].loanToken, assets.toString());
    });
}

const WALLETS_PER_GROUP = 500

// Every wallet is checked against every pool token (about 95 reads per wallet on Base) while most wallets hold next to
// nothing. A wallet worth under $100 is stored with its balances, counted from the store, and read again once a week.
// Wallets go through in groups and the store is saved after each one, so a run that is cut short keeps what it read.
async function tvl(api) {
    const owners = await getConfig('zyfai/'+api.chain, `https://api.zyf.ai/api/v1/data/active-wallets?chainId=${api.chainId}`);
    const cleanOwners = [...new Set(owners.filter(o => o !== '').map(o => o.toLowerCase()))];

    const lowValue = await getLowValueCache({ api, project: 'zyfai', checkpointEvery: 1 });
    for (const group of sliceIntoChunks(lowValue.filter(cleanOwners), WALLETS_PER_GROUP)) {
        const held = {};
        group.forEach(owner => held[owner] = {});
        const failed = new Set();
        const wallets = {
            owners: group,
            fail: owner => failed.add(owner),
            add: (owner, token, amount) => {
                if (BigInt(amount) === 0n) return;
                held[owner][token] = (BigInt(held[owner][token] ?? 0) + BigInt(amount)).toString();
            },
        };

        if (api.chain == 'sonic') {
            await beetsTvl(api, wallets);
            await penpieTvl(api, wallets);
        }

        if (api.chain === 'base') {
            await unpricedVaultsTvl(api, wallets, baseUnpricedVaults);
            await makinaSharesTvl(api, wallets, makinaPairs);
            await morphoBlueSupplyTvl(api, wallets, baseBlueMarkets);
        }

        if (api.chain === 'ethereum') {
            await unpricedVaultsTvl(api, wallets, ethereumUnpricedVaults);
            await morphoBlueSupplyTvl(api, wallets, ethereumBlueMarkets);
        }

        await poolTokensTvl(api, wallets, TOKENS[api.chain]);

        // a wallet with a failed read is counted with what was read, and read in full again next run
        group.filter(owner => failed.has(owner)).forEach(owner => Object.entries(held[owner]).forEach(([token, amount]) => api.add(token, amount)));
        await lowValue.record(group.filter(owner => !failed.has(owner)).map(owner => [owner, held[owner]]));
    }
    await lowValue.save();
}

module.exports = {
    doublecounted: true,
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols. Receipt tokens that Llama prices are summed directly, including priced Aave V4 spokes. Shares Llama does not price use the existing convertToAssets path. Makina share balances use the makina-finance valuation: convertToAssets on the Machine into the accounting token. Morpho Blue supply shares are converted with the market totals and added as the loan token.',
    sonic: { tvl },
    base: { tvl },
    arbitrum: { tvl },
    plasma: { tvl },
    ethereum: { tvl },
}