const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

const REGISTRY = '0xBbBe37FE58e9859b6943AC53bDf4d0827f7F0034';

const tokenAddresses = [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5', // bIB01
]

const Chain = {
    ethereum: "ethereum",
};

const latestRoundDataABI = {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  };

async function getIB01USD(chain) {
    const oracleAddresses = {
        [Chain.ethereum]: "0x32d1463eb53b73c095625719afa544d5426354cb",
    };

    const iB01USDRoundData = await sdk.api.abi.call({
        chain: chain,
        target: oracleAddresses[chain],
        params: [],
        abi: latestRoundDataABI,
    });

    return iB01USDRoundData.output.answer / 1e8;
}

async function tvl(timestamp, block, chainBlocks, {api}) {
    const activePools = await api.call({ target: REGISTRY, abi: abi['getActivePools'] });
    const inactivePools = await api.call({ target: REGISTRY, abi: abi['getInactivePools'] });
    const allPools = [...activePools, ...inactivePools];
    const ib01usd = await getIB01USD(Chain.ethereum);
    
    const balances = {};

    const bIB01Balances = await api.multiCall({
        abi: abi['balanceOf'],
        calls: allPools.map(pool => ({ target: '0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5', params: [pool] })) 
    });

    bIB01Balances.forEach((balance, i) => {
        if (balance.success) {
            const usdValue = balance.output * ib01usd;  // Convert the balance of bIB01 to its USD value
            sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.USDT, usdValue);
        }
    });


    const tokenBalances = await api.multiCall({ abi: abi.totalSupply, calls: allPools.map(pool => ({target: pool})) });

    tokenBalances.forEach((token, i) => {
        if (token.success) {
            const poolAddress = allPools[i];
            sdk.util.sumSingleBalance(balances, poolAddress, token.output);
        }
    });

    return balances;
}


module.exports = {
    misrepresentedTokens: true,
    methodology: 'Gets the active pools from the registry and adds the total supply of each pool',
    ethereum: {
        tvl,
    },
};
