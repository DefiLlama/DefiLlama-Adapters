const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json');

const blacklistedTokens = 
    ['0x1A846c0FcE81C1Fa6d86f5b864Ae0B2bc6059273',
      '0xe81A9A5A369C340B879f72cD6775Bc2376C90DF8',
      '0xc5A431B35eF7f485328cd19250e6956d8cEf5683',
      '0x9e992B7eE1B5B074EB2642BEC42dFbF64f3A8a9e', 
      '0x4e63AFb0A6A35e8E7549F4d2281E8deC22d26fAC', 
      '0x71E1f20fB83e787D05eBB0aAB9674ecF0f28B407', 
      '0x8ac1cD74A2d9b3Db244b162a1F30fBC7E08ed7Bf', 
      '0xa99D995BB131da21D10d757Fe015bBc6E851E0Bb', 
      '0x1849426872eD67E7e5056B157899e9aE5a86C251', 
      '0x381f7fA5d842731F8416F956c3fb8FF3D6b197dA', 
      '0x3083b20FF79aA760777Ff6883438B0Dc5e0dAB60']

const abis = {
    factory: {
        "getAllTokens": "function getAllTokens() public view returns (address[] memory)",
        "allTokensLength": "function allTokensLength() public view returns (uint256)",
    },
    erc314: 
    {
        "getReserves": "function getReserves() public view returns (uint256 amountNative, uint256 amountToken)",
        "getAmountsForLP": "function getAmountsForLP(uint256 amount) external view returns (uint256 nativeAmount, uint256 tokenAmount)",
    },
    stakingContract: 
    {
        "poolInfo": "function getPoolInfo(uint256 _poolId) public view returns (address _staketoken, uint256 _allocationPoints, uint256 _lastRewardTimestamp, uint256 _rewardTokenPerShare, uint256 _totalStaked, uint256 _bonusMultiplier, address _rewarder)",
        "poolLength": "function poolLength() external view returns (uint256 length)",
    },
};

const contracts = {
    avax: {
        factory: "0x3D193de151F8e4e3cE1C4CB2977F806663106A87",
        apex: "0x98B172A09102869adD73116FC92A0A60BFF4778F",
        stakingContract: "0x5995876c9C6e2C23C1C5fc902661127fF9ed38D3",
        locker: "0xdfB8803797B11C64Cd8520b611816924CE845802",
    },
    base: {
        factory: "0x4ccf7aa5736c5e8b6da5234d1014b5019f50cb56",
        locker: "0x77Ea6d14F619F3d9133D0D221B2a73653f11306e",
    },
    ethereum: {
        factory: "0x820c889D5749847217599B43ab86FcC91781019f",
        locker: "0xAeB261DB831fd11A3f700014F3aCE6073DA06E22",
    },
};

async function tvl(api) {
    const balances = {};
    const factoryAddress = contracts[api.chain].factory;
    const nativeAddress = api.chain === 'avax' ? ADDRESSES.avax.WAVAX : api.chain === 'ethereum' ? ADDRESSES.ethereum.WETH : ADDRESSES.base.WETH;


    const allTokens = await api.call({ target: factoryAddress, abi: abis.factory.getAllTokens });

    const filteredTokens = allTokens.filter(token => !blacklistedTokens.includes(token));
    const reserves = await api.multiCall({ calls: filteredTokens, abi: abis.erc314.getReserves });    

    reserves.forEach((reserve, index) => {
        const nativeBalance = BigInt(reserve.amountNative) * BigInt(2);
        const tokenBalance = BigInt(reserve.amountToken);
        const tokenAddress = filteredTokens[index];

        // Sum native
        sdk.util.sumSingleBalance(balances, nativeAddress, nativeBalance, api.chain);
        // Sum token balance
        //  sdk.util.sumSingleBalance(balances, tokenAddress, tokenBalance, api.chain);
    });
    
    return balances;
}

async function staking(api) {
    const balances = {};
    const poolLength = await api.call({ target: contracts.avax.stakingContract, abi: abis.stakingContract.poolLength });

    const poolCalls = [];
    for (let i = 0; i < poolLength[0]; i++) {
        poolCalls.push(i);
    }

    const poolInfo = await api.call({ target: contracts.avax.stakingContract, abi: abis.stakingContract.poolInfo, params: [0] });
    const stakedToken = poolInfo._staketoken;
    const totalStaked = poolInfo._totalStaked;

    const reserves = await api.call({ target: stakedToken, abi: abis.erc314.getReserves});
    const nativeBalance = BigInt(reserves.amountNative);
    const tokenBalance = BigInt(reserves.amountToken);
    const scalingFactor = 10n ** 18n;
    const avaxPricePerToken = (nativeBalance * scalingFactor) / tokenBalance;
    const totalStakedInNative = BigInt(totalStaked) * avaxPricePerToken / scalingFactor;
    sdk.util.sumSingleBalance(balances, ADDRESSES.avax.WAVAX, totalStakedInNative, api.chain);

    return balances;
}

const methodology = "The Apex DeFi factory contract address is used to obtain the balances held in each token contract as liquidity and the staking contract is used to get the staked APEX balance.";

module.exports = {
    methodology: methodology,
    avax: {
        tvl: tvl,
        staking: staking,
    },
    base: {
        tvl: tvl,
    },
    ethereum: {
        tvl: tvl,
    },
};