const { getLogs } = require('../helper/cache/getLogs')
const { getTokenPrices } = require("../helper/unknownTokens")
const ADDRESSES = require('../helper/coreAssets.json')

const STAKING_CONTRACT = '0x5ff7f9724fd477d9a07dcdb894d0ca7f8fae1501'
const KAYEN_ROUTER = '0xE2918AA38088878546c1A18F2F9b1BC83297fdD3'
const KAYER_WRAPPER_FACTORY = '0xAEdcF2bf41891777c5F638A098bbdE1eDBa7B264'
const GET_TOTAL_STAKE_ABI = {
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
const PAIR_CREATED_EVENT = 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)'
const WRAPPED_TOKEN_CREATED_EVENT = 'event WrappedTokenCreated(address indexed underlyingToken, address indexed wrappedToken)'

async function tvl(api) {
    const [stakingLogs, kayenPairCreatedLogs, kayenWrapLogs] = await Promise.all([
        getLogs({
            api,
            target: STAKING_CONTRACT,
            eventAbi: STAKE_EVENT,
            onlyArgs: true,
            fromBlock: 20248272,
        }),
        getLogs({
            api,
            target: KAYEN_ROUTER,
            eventAbi: PAIR_CREATED_EVENT,
            onlyArgs: true,
            fromBlock: 12098248,
        }),
        getLogs({
            api,
            target: KAYER_WRAPPER_FACTORY,
            eventAbi: WRAPPED_TOKEN_CREATED_EVENT,
            onlyArgs: true,
            fromBlock: 12039720,
        })
    ])

    const lowerCasedWrappedChz = [ADDRESSES.chz.WCHZ.toLowerCase(), ADDRESSES.chz.WCHZ_1.toLowerCase()]

    // Filtering out only the logs that contain wrapped chz as part of the pair
    const filteredKayenLogs = kayenPairCreatedLogs.filter(([token0, token1]) => lowerCasedWrappedChz.includes(token0.toLowerCase()) || lowerCasedWrappedChz.includes(token1.toLowerCase()))

    // Map underlying tokens to wrapped ones
    // {underlying: wwapped}
    const tokenToWrapped = kayenWrapLogs.reduce((acc, [underlyingToken, wrappedToken]) => {
      acc[underlyingToken.toLowerCase()] = wrappedToken.toLowerCase();
      return acc;
    }, {})

    // Getting all the distinct tokens that are staked
    const distinctTokens = [...new Set(stakingLogs.map(([_staker, token]) => token.toLowerCase()))]

    // Mapping the distinct tokens to their respective lp
    // {underlyingToken: lp}
    const lpMap = filteredKayenLogs.reduce((acc, [token0, token1, lpAddress]) => {
        let match = distinctTokens.find(x => x === token0.toLowerCase() || x === token1.toLowerCase())

        if(!match) {
          match = distinctTokens.find(x => tokenToWrapped[x] === token0.toLowerCase() || tokenToWrapped[x] === token1.toLowerCase())
        }

        if (match){
          acc[match] = lpAddress
        }

        return acc;
    }, {})

    // Getting the tvl for each token
    const tokensTvl = await Promise.all(distinctTokens.map(async token => {
        const lp = lpMap[token]
        if (!lp) {
          return 0
        }
        const [stakedTvl, tokenPrice] = await Promise.all([
            api.call({
                abi: GET_TOTAL_STAKE_ABI,
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
        ])

        // Note: wrapped fan tokens have 0 decimals
        const p = tokenPrice.prices[token] ? tokenPrice.prices[token][1] : tokenPrice.prices[tokenToWrapped[token]][1] * 1e18
        return p * stakedTvl
    }));

    api.add(ADDRESSES.null, tokensTvl.reduce((acc, tvl) => acc + tvl, 0) )
}

module.exports = {
  methodology: 'Accounts for all ERC20 tokens staked on the Fan Token staking contract.',
  chz: {
    tvl
  }
};
