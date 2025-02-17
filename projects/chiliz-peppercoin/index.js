const { getTokenPrices } = require("../helper/unknownTokens");
const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json');

const STAKING_CONTRACT = '0x5cA4C88339D89B2547a001003Cca84F62F557A72';
const KAYEN_ROUTER = '0xE2918AA38088878546c1A18F2F9b1BC83297fdD3';

const ABI = {
    "inputs": [
        {
            "internalType": "address",
            "name": "token",
            "type": "address"
        }
    ],
    "name": "getTotalStake",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}

const STAKE_EVENT = 'event Stake(address indexed staker, address indexed token, uint256 amount)';
const PAIR_CREATED_EVENT = 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)';

async function tvl(api) {
    const [stakingLogs, kayenLogs] = await Promise.all([
        // Getting all of the stake events from the staking contract to extract the distinct tokens
        getLogs({
            api,
            target: STAKING_CONTRACT,
            eventAbi: STAKE_EVENT,
            onlyArgs: true,
            fromBlock: 20911530,
        }),
        // Getting all of the pair created events from the kayen router to extract the lp tokens
        getLogs({
            api,
            target: KAYEN_ROUTER,
            eventAbi: PAIR_CREATED_EVENT,
            onlyArgs: true,
            fromBlock: 12098248,
        })
    ]);

    const lowerCasedWrappedChz = [ADDRESSES.chz.WCHZ.toLowerCase(), ADDRESSES.chz.WCHZ_1.toLowerCase()];

    // Filtering out only the logs that contain wrapped chz as part of the pair
    const filteredKayenLogs = kayenLogs.filter(([token0, token1]) => lowerCasedWrappedChz.includes(token0.toLowerCase()) || lowerCasedWrappedChz.includes(token1.toLowerCase()));

    // Getting all the distinct tokens that are staked
    const distinctTokens = [...new Set(stakingLogs.map(([_staker, token]) => token.toLowerCase()))]

    // Mapping the distinct tokens to their respective lp
    const lpMap = filteredKayenLogs.reduce((acc, [token0, token1, lpAddress]) => {
        const match = distinctTokens.find(x => x === token0.toLowerCase() || x === token1.toLowerCase());

        if (match) {
            acc[match] = lpAddress;
        }

        return acc;
    }, {})

    // Getting the tvl for each token
    const tokensTvl = await Promise.all(distinctTokens.map(async token => {
        const lp = lpMap[token];

        const [stakedTvl, tokenPrice] = await Promise.all([
            api.call({
                abi: ABI,
                chain: "chz",
                target: STAKING_CONTRACT,
                params: [token]
            }),
            getTokenPrices({
                api,
                lps: [lp],
                chain: 'chz',
                useDefaultCoreAssets: true
            })
        ]);

        return tokenPrice.prices[token.toLowerCase()][1] * stakedTvl;
    }));

    api.add(ADDRESSES.null, tokensTvl.reduce((acc, tvl) => acc + tvl, 0));
}

module.exports = {
  methodology: 'Accounts for all ERC20 tokens staked on the PEPPER staking contract.',
  chz: {
    tvl
  }
};
