const {JsonRpcProvider, Contract, formatEther} = require("ethers");
const {get, all} = require("axios");
const vaultUrl = "https://mainnet.ocean.jellyfishsdk.com/v0/mainnet/address/df1q7zkdpw6hd5wzcxudx28k72vjvpefa4pyqls2grnahhyw4u8kf0zqu2cnz6/vaults";
const prices = "https://aws-api.javlis.com/api/javsphere/prices";
const LOCKING_CONTRACT_ABI = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'lockupTime',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'totalCap',
                type: 'uint256',
            },
            {
                internalType: 'contract IERC20',
                name: 'lockedCoin',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'target',
                type: 'address',
            },
        ],
        name: 'AddressEmptyCode',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'AddressInsufficientBalance',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'rewardAmount',
                type: 'uint256',
            },
        ],
        name: 'addRewards',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
        ],
        name: 'BondsAlreadyWithdrawn',
        type: 'error',
    },
    {
        inputs: [],
        name: 'BondsEmptyTVL',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
        ],
        name: 'BondsInvalidBond',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'BondsNoBondsInAddress',
        type: 'error',
    },
    {
        inputs: [],
        name: 'BondsNoFunds',
        type: 'error',
    },
    {
        inputs: [],
        name: 'BondsNoRewards',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
        ],
        name: 'BondsNotOwner',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
        ],
        name: 'BondsNotWithdrawable',
        type: 'error',
    },
    {
        inputs: [],
        name: 'BondsNothingWithdrawable',
        type: 'error',
    },
    {
        inputs: [],
        name: 'BondsTotalCapReached',
        type: 'error',
    },
    {
        inputs: [],
        name: 'claimAllRewards',
        outputs: [
            {
                internalType: 'uint256',
                name: 'total',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
        ],
        name: 'claimRewards',
        outputs: [
            {
                internalType: 'uint256',
                name: 'claimed',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'FailedInnerCall',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'funds',
                type: 'uint256',
            },
        ],
        name: 'lockup',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'OwnableInvalidOwner',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'OwnableUnauthorizedAccount',
        type: 'error',
    },
    {
        inputs: [],
        name: 'ReentrancyGuardReentrantCall',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address',
            },
        ],
        name: 'SafeERC20FailedOperation',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'depositer',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newTVL',
                type: 'uint256',
            },
        ],
        name: 'DepositAdded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'addedRewards',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'blocksSinceLastRewards',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newRewardsClaimable',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'currentTvl',
                type: 'uint256',
            },
        ],
        name: 'RewardsAdded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'claimedRewards',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newRewardsClaimable',
                type: 'uint256',
            },
        ],
        name: 'RewardsClaimed',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'triggerExitCriteria',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
        ],
        name: 'withdraw',
        outputs: [
            {
                internalType: 'uint256',
                name: 'withdrawAmount',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'withdrawnFunds',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newTVL',
                type: 'uint256',
            },
        ],
        name: 'Withdrawal',
        type: 'event',
    },
    {
        inputs: [],
        name: 'withdrawAllMyAvailableBatches',
        outputs: [
            {
                internalType: 'uint256',
                name: 'total',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'addr',
                type: 'address',
            },
        ],
        name: 'allAvailableRewards',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'addr',
                type: 'address',
            },
        ],
        name: 'allWithdrawableFunds',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
        ],
        name: 'availableRewards',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'bondToken',
        outputs: [
            {
                internalType: 'contract Bond',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'coin',
        outputs: [
            {
                internalType: 'contract IERC20',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'currentRewardsClaimable',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'currentTvl',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'addr',
                type: 'address',
            },
        ],
        name: 'currentTVLOfAddress',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'exitCriteriaTriggered',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'batchId',
                type: 'uint256',
            },
        ],
        name: 'getBatchData',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lockedUntil',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'initialRewardsPerDeposit',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'claimedRewards',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct BondEntry',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'investments',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'lockedUntil',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'initialRewardsPerDeposit',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'claimedRewards',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'lastRewardsBlock',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'lockupPeriod',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'rewardsPerDeposit',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalClaimed',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalInvest',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalInvestCap',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalRewards',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalWithdrawn',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];
const ONE_YEAR_LOCKING_MAINNET = {
    address: '0xD88Bb8359D694c974C9726b6201479a123212333',
    abi: LOCKING_CONTRACT_ABI,
};
const TWO_YEARS_LOCKING_MAINNET = {
    address: '0xc5B7aAc761aa3C3f34A3cEB1333f6431d811d638',
    abi: LOCKING_CONTRACT_ABI,
};
const rpc = "https://eth.mainnet.ocean.jellyfishsdk.com/";
const provider = new JsonRpcProvider(rpc);
const contract1Year = new Contract(ONE_YEAR_LOCKING_MAINNET.address, ONE_YEAR_LOCKING_MAINNET.abi, provider);
const contract2Year = new Contract(TWO_YEARS_LOCKING_MAINNET.address, TWO_YEARS_LOCKING_MAINNET.abi, provider);

async function tvl() {

    const allResponses = await all([
        contract1Year.currentTvl(),
        contract2Year.currentTvl(),
        get(vaultUrl),
        get(prices)
    ]);

    const tvl1Year = allResponses[0];
    const tvl2Year = allResponses[1];
    const vault = allResponses[2].data;
    const pricesResponse = allResponses[3].data;

    const tvl1YearInEth = +formatEther(tvl1Year);
    const tvl2YearInEth = +formatEther(tvl2Year);
    const vaultTvl = +vault.data[0].collateralValue - +vault.data[0].loanValue
    const tvl = (tvl1YearInEth + tvl2YearInEth + vaultTvl) * pricesResponse.data.dusd;

    return tvl.toFixed(2);
}

module.exports = {
    methodology: `We count the total value locked in all our products und multiply of the current price of the dusd. `,
    defimetachain: {
        tvl
    }
}
