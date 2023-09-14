const ethers = require('ethers');

const { default: axios } = require('axios');

const INSURANCE_FUND = '0xD1758fbABAE91c805BE76D56548A584EF68B81f0';

const BALANCER_POOL_ABI = require('./abi/BalancerPool.json');
const CAVIAR_CHEF_ABI = require('./abi/CaviarChef.json');
const MULTICALL_ABI = require('./abi/Multicall3.json');
const PAIR_FACTORY_ABI = require('./abi/PairFactory.json');
const VAULT_ABI = require('./abi/Vault.json');
const VE_PEARL_ABI = require('./abi/vePEARL.json');
const VE_TETU_ABI = require('./abi/veTETU.json');
const VOTER_ABI = require('./abi/Voter.json');

const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
const multicall = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', MULTICALL_ABI, provider);

const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)'
];

const PAIR_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function getReserves() view returns (uint256, uint256, uint256)',
    'function tokens() view returns (address, address)',
    'function totalSupply() view returns (uint256)',
];

const erc20 = new ethers.utils.Interface(ERC20_ABI);

const insuranceTokens = {
    CAVIAR: '0x6AE96Cc93331c19148541D4D2f31363684917092',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    PEARL: '0x7238390d5f6F64e67c3211C343A410E2A3DEc142',
    STAR: '0xC19669A405067927865B40Ea045a2baabbbe57f5',
    STMATIC: '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4',
    TETU: '0x255707B70BF90aa112006E1b07B9AeA6De021424',
    TNGBL: '0x49e6A20f1BBdfEeC2a8222E052000BbB14EE6007',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDR: '0x40379a439D4F6795B6fc9aa5687dB461677A2dBa',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    WUSDR: '0x00e8c0E92eB3Ad88189E7125Ec8825eDc03Ab265',
}

const UTILITY_TOKENS = {
    TETU_BPT: '0xE2f706EF1f7240b803AAe877C9C762644bb808d8',
    VE_PEARL: '0x017A26B18E4DA4FE1182723a39311e67463CF633',
    VE_TETU: '0x6FB29DD17fa6E27BD112Bc3A2D0b8dae597AeDA4',
}

const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const CAVIAR_STAKING_CHEF = '0x83C5022745B2511Bd199687a42D27BEFd025A9A9';
const CAVIAR_REBASE_CHEF = '0xf5374d452697d9A5fa2D97Ffd05155C853F6c1c6';
const PEARL_PAIR_FACTORY = '0xEaF188cdd22fEEBCb345DCb529Aa18CA9FcB4FBd';
const PEARL_VOTER = '0xa26C2A6BfeC5512c13Ae9EacF41Cb4319d30cCF0';

async function getInsuranceFundValue(api) {
    const tokenAddresses = [...Object.values(insuranceTokens), ...Object.values(UTILITY_TOKENS)];
    const tokenBalances = tokenAddresses.map(() => ethers.constants.Zero);

    let calls = [];

    for (let i = 0; i < tokenAddresses.length; i++) {
        calls.push({
            target: tokenAddresses[i],
            callData: erc20.encodeFunctionData('balanceOf', [INSURANCE_FUND])
        })
    }

    const { returnData: balanceData } = await multicall.callStatic.aggregate(calls);

    for (let i = 0; i < balanceData.length; i++) {
        const [tokenBalance] = erc20.decodeFunctionResult('balanceOf', balanceData[i]);
        tokenBalances[i] = tokenBalances[i].add(tokenBalance);
    }

    const vePEARL = new ethers.utils.Interface(VE_PEARL_ABI);
    const vePEARLBalance = tokenBalances[tokenAddresses.indexOf(UTILITY_TOKENS.VE_PEARL)].toNumber();

    calls = [];

    for (let i = 0; i < vePEARLBalance; i++) {
        calls.push({
            target: UTILITY_TOKENS.VE_PEARL,
            callData: vePEARL.encodeFunctionData('tokenOfOwnerByIndex', [INSURANCE_FUND, i])
        })
    }

    const { returnData: pearlTokenIdData } = await multicall.callStatic.aggregate(calls);

    calls = [];

    for (let i = 0; i < pearlTokenIdData.length; i++) {
        const [tokenId] = vePEARL.decodeFunctionResult('tokenOfOwnerByIndex', pearlTokenIdData[i]);
        calls.push({
            target: UTILITY_TOKENS.VE_PEARL,
            callData: vePEARL.encodeFunctionData('locked', [tokenId])
        })
    }

    const { returnData: lockedPearlData } = await multicall.callStatic.aggregate(calls);

    const pearlBalance = lockedPearlData
        .map((data) => vePEARL.decodeFunctionResult('locked', data))
        .flat()
        .map((t) => t.amount)
        .reduce((a, b) => a.add(b), ethers.constants.Zero);
    
    const pearlTokenIndex = tokenAddresses.indexOf(insuranceTokens.PEARL);
    tokenBalances[pearlTokenIndex] = tokenBalances[pearlTokenIndex].add(pearlBalance);

    const veTETU = new ethers.utils.Interface(VE_TETU_ABI);
    const veTETUBalance = tokenBalances[tokenAddresses.indexOf(UTILITY_TOKENS.VE_TETU)].toNumber();

    calls = [];

    for (let i = 0; i < veTETUBalance; i++) {
        calls.push({
            target: UTILITY_TOKENS.VE_TETU,
            callData: veTETU.encodeFunctionData('tokenOfOwnerByIndex', [INSURANCE_FUND, i])
        })
    }

    const { returnData: tetuTokenIdData } = await multicall.callStatic.aggregate(calls);

    calls = [];

    for (let i = 0; i < tetuTokenIdData.length; i++) {
        const [tokenId] = veTETU.decodeFunctionResult('tokenOfOwnerByIndex', tetuTokenIdData[i]);
        calls.push({
            target: UTILITY_TOKENS.VE_TETU,
            callData: veTETU.encodeFunctionData('lockedAmounts', [tokenId, UTILITY_TOKENS.TETU_BPT])
        })
    }

    const { returnData: lockedBptData } = await multicall.callStatic.aggregate(calls);

    const pool = new ethers.Contract(UTILITY_TOKENS.TETU_BPT, BALANCER_POOL_ABI, provider);
    const bptBalance = lockedBptData
        .map((data) => veTETU.decodeFunctionResult('lockedAmounts', data))
        .flat()
        .reduce((a, b) => a.add(b), await pool.balanceOf(INSURANCE_FUND));

    const bptSupply = await pool.totalSupply();

    const vault = new ethers.Contract(BALANCER_VAULT, VAULT_ABI, provider);
    const poolId = await pool.getPoolId();

    const {tokens, balances} = await vault.getPoolTokens(poolId);

    for (let i = 0; i < tokens.length; i++) {
        const tokenIndex = tokenAddresses.indexOf(tokens[i]);
        const balance = balances[i].mul(bptBalance).div(bptSupply);
        tokenBalances[tokenIndex] = tokenBalances[tokenIndex].add(balance);
    }

    const caviarChef = new ethers.utils.Interface(CAVIAR_CHEF_ABI);

    calls = [
        {
            target: CAVIAR_STAKING_CHEF,
            callData: caviarChef.encodeFunctionData('userInfo', [INSURANCE_FUND])
        },
        {
            target: CAVIAR_STAKING_CHEF,
            callData: caviarChef.encodeFunctionData('pendingReward', [INSURANCE_FUND])
        },
        {
            target: CAVIAR_STAKING_CHEF,
            callData: caviarChef.encodeFunctionData('rewardToken')
        },
        {
            target: CAVIAR_REBASE_CHEF,
            callData: caviarChef.encodeFunctionData('pendingReward', [INSURANCE_FUND])
        },
        {
            target: CAVIAR_REBASE_CHEF,
            callData: caviarChef.encodeFunctionData('rewardToken')
        },
    ];

    const { returnData: caviarData } = await multicall.callStatic.aggregate(calls);

    const [stakingAmount] = caviarChef.decodeFunctionResult('userInfo', caviarData[0]);
    const [pendingStakingReward] = caviarChef.decodeFunctionResult('pendingReward', caviarData[1]);
    const [stakingRewardToken] = caviarChef.decodeFunctionResult('rewardToken', caviarData[2]);
    const [pendingRebaseReward] = caviarChef.decodeFunctionResult('pendingReward', caviarData[3]);
    const [rebaseRewardToken] = caviarChef.decodeFunctionResult('rewardToken', caviarData[4]);

    const caviarTokenIndex = tokenAddresses.indexOf(insuranceTokens.CAVIAR);
    const stakingRewardTokenIndex = tokenAddresses.indexOf(stakingRewardToken);
    const rebaseRewardTokenIndex = tokenAddresses.indexOf(rebaseRewardToken);

    tokenBalances[caviarTokenIndex] = tokenBalances[caviarTokenIndex].add(stakingAmount);
    tokenBalances[stakingRewardTokenIndex] = tokenBalances[stakingRewardTokenIndex].add(pendingStakingReward);
    tokenBalances[rebaseRewardTokenIndex] = tokenBalances[rebaseRewardTokenIndex].add(pendingRebaseReward);

    const coins = tokenAddresses.slice(0, Object.keys(insuranceTokens).length).map((a) => `polygon:${a}`);
    const prices = await axios.get(`https://coins.llama.fi/prices/current/${coins.join(',')}`).then((res) => res.data.coins);

    const pearlPairFactory = new ethers.Contract(PEARL_PAIR_FACTORY, PAIR_FACTORY_ABI, provider);
    const numPairs = await pearlPairFactory.allPairsLength().then((n) => n.toNumber());

    calls = [...Array(numPairs).keys()].map((i) => {
        return {
            target: PEARL_PAIR_FACTORY,
            callData: pearlPairFactory.interface.encodeFunctionData('allPairs', [i])
        }
    });

    const { returnData: pairData } = await multicall.callStatic.aggregate(calls);

    const voter = new ethers.utils.Interface(VOTER_ABI);

    calls = pairData.map((data) => {
        const [pair] = pearlPairFactory.interface.decodeFunctionResult('allPairs', data);
        return {
            target: PEARL_VOTER,
            callData: voter.encodeFunctionData('gauges', [pair])
        };
    });

    const { returnData: gaugeData } = await multicall.callStatic.aggregate(calls);

    calls = gaugeData.map((data) => {
        const [gauge] = voter.decodeFunctionResult('gauges', data);
        return {
            target: gauge,
            callData: erc20.encodeFunctionData('balanceOf', [INSURANCE_FUND])
        };
    });

    const { returnData: gaugeBalanceData } = await multicall.callStatic.aggregate(calls);

    const pair = await new ethers.utils.Interface(PAIR_ABI);

    for (let i = 0; i < numPairs; i++) {
        const [gaugeBalance] = erc20.decodeFunctionResult('balanceOf', gaugeBalanceData[i]);
        if (gaugeBalance.gt(ethers.constants.Zero)) {
            const [pairAddress] = pearlPairFactory.interface.decodeFunctionResult('allPairs', pairData[i]);
            calls = [
                {
                    target: pairAddress,
                    callData: pair.encodeFunctionData('tokens')
                },
                {
                    target: pairAddress,
                    callData: pair.encodeFunctionData('totalSupply')
                },
                {
                    target: pairAddress,
                    callData: pair.encodeFunctionData('getReserves')
                },
            ];

            const { returnData: pairMetaData } = await multicall.callStatic.aggregate(calls);

            const [token0, token1] = pair.decodeFunctionResult('tokens', pairMetaData[0]);
            const [totalSupply] = pair.decodeFunctionResult('totalSupply', pairMetaData[1]);
            const [reserve0, reserve1] = pair.decodeFunctionResult('getReserves', pairMetaData[2]);

            const token0Balance = reserve0.mul(gaugeBalance).div(totalSupply);
            const token1Balance = reserve1.mul(gaugeBalance).div(totalSupply);
            const token0Index = tokenAddresses.indexOf(token0);
            const token1Index = tokenAddresses.indexOf(token1);

            tokenBalances[token0Index] = tokenBalances[token0Index].add(token0Balance);
            tokenBalances[token1Index] = tokenBalances[token1Index].add(token1Balance);
        }
    }

    if (prices[`polygon:${insuranceTokens.CAVIAR}`] === undefined) {
        prices[`polygon:${insuranceTokens.CAVIAR}`] = prices[`polygon:${insuranceTokens.PEARL}`];
    }

    const insuranceFundValue = tokenBalances.map((balance, i) => {
        if (i >= Object.keys(insuranceTokens).length) return 0;
        const priceIndex = `polygon:${tokenAddresses[i]}`;
        const formattedBalance = ethers.utils.formatUnits(balance, prices[priceIndex].decimals);
        const price = prices[priceIndex].price;
        console.log(`${Object.keys(insuranceTokens)[i]}: ${+formattedBalance * price}`);
        return +formattedBalance * price;
    }).reduce((a, b) => a + b, 0);

    console.log(insuranceFundValue);

    api.add(insuranceTokens.DAI,insuranceFundValue);
}

module.exports = {
    getInsuranceFundValue,
    insuranceTokens
}
