const ERC20 = require('./abi/ERC20.json');
const Storage = require('./abi/Storage.json');
const Vbep = require('./abi/Vbep.json');
const Venus = require('./abi/Venus.json');
const VenusOracle = require('./abi/VenusOracle.json');

const utils = require('../helper/utils')
const web3 = require('../config/web3.js');

const LOGIC_CONTRACT_ADDRESS = '0x009551A836590FdD291D59d03a07e7D25c7b5b29';
const STORAGE_CONTRACT_ADDRESS = '0xf1f25A26499B023200B3f9A30a8eCEE87b031Ee1';
const STAKING_AND_FARMING_CONTRACT_ADDRESS = '0x3782C47E62b13d579fe748946AEf7142B45B2cf7';
const BLID_TOKEN_ADDRESS = '0x766afcf83fd5eaf884b3d529b432ca27a6d84617';
const BLID_USDT_TOKEN_ADDRESS = '0x12c35ed2405bc70721584594723351bf5db6235c';

const UNISWAP_POOL_USDT_BLID_POOL_ADDRESS = '0xaf58b12857196b9db7997539dc9694f8313c31c2';
const UNISWAP_POOLS_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

async function getTotalTVL() {
    const blidPriceUsd = await getBlidPriceUsd();

    const farmingTvl = await getTVLFromFarming(blidPriceUsd);
    const stakingTvl = await getTVLFromStaking(blidPriceUsd);
    const lrsTvl = await getTVLFromLowRiskStrategy();
    const total = farmingTvl + stakingTvl + lrsTvl;

    return total;
}

async function getTVLFromLowRiskStrategy() {
    try {
        const contract = new web3.eth.Contract(
            Storage.abi,
            STORAGE_CONTRACT_ADDRESS,
        );
        const currentLockedUSD = await contract.methods.getTotalDeposit().call();

        let totalAmountOfTokens = 0;
        const bolideUserDeposited = numWei(currentLockedUSD);
        const getTokenBalance = async (tokenAddress) => {
            const tokenContract = new web3.eth.Contract(Vbep.abi, tokenAddress);
            const snapshot = await tokenContract.methods
                .getAccountSnapshot(LOGIC_CONTRACT_ADDRESS)
                .call();

            return snapshot && snapshot['2'] ? snapshot['2'] : '';
        };

        const venusContract = new web3.eth.Contract(
            Venus.abi,
            '0xfD36E2c2a6789Db23113685031d7F16329158384',
        );
        const listOfTokens = await venusContract.methods
            .getAssetsIn(LOGIC_CONTRACT_ADDRESS)
            .call();

        if (listOfTokens && listOfTokens.length) {
            for (const token of listOfTokens) {
                const borrowed = await getTokenBalance(token);
                const venusOracleContract = new web3.eth.Contract(
                    VenusOracle.abi,
                    '0xd8B6dA2bfEC71D684D3E2a2FC9492dDad5C3787F',
                );
                const underlyingPrice = await venusOracleContract.methods
                    .getUnderlyingPrice(token)
                    .call();

                if (borrowed && underlyingPrice) {
                    totalAmountOfTokens += numWei(borrowed) * numWei(underlyingPrice);
                }
            }
        }

        return String(totalAmountOfTokens + bolideUserDeposited);
    } catch (e) {
        return '0';
    }
}

async function getTVLFromStaking(blidPriceUsd){
    try {
        const contract = new web3.eth.Contract(ERC20.abi, BLID_TOKEN_ADDRESS);
        const balanceOfMaster = await contract.methods
            .balanceOf(STAKING_AND_FARMING_CONTRACT_ADDRESS)
            .call();

        const currentLockedUSD = numWei(balanceOfMaster) * blidPriceUsd;

        return currentLockedUSD.toString();
    } catch (e) {
        return '0';
    }
}

async function getTVLFromFarming(blidPriceUsd) {
    try {
        const { contract, reserve0, reserve1, totalSupply, token0, token1 } = await getLpContract();
        const blidTokenAddress = BLID_TOKEN_ADDRESS.toLowerCase();
        const lpBalanceOfMaster = await contract.methods
            .balanceOf(STAKING_AND_FARMING_CONTRACT_ADDRESS)
            .call();

        let currentLockedUSD = 0;

        if (token0 === blidTokenAddress) {
            currentLockedUSD =
                (numWei(lpBalanceOfMaster) / totalSupply) * reserve0 * blidPriceUsd * 2;
        }
        if (token1 === blidTokenAddress) {
            currentLockedUSD =
                (numWei(lpBalanceOfMaster) / totalSupply) * reserve1 * blidPriceUsd * 2;
        }

        return currentLockedUSD.toString();
    } catch (e) {
        return '0';
    }
}

async function getBlidPriceUsd() {
    const options = {
        operationName: 'pools',
        variables: {},
        query: `query pools {
          pools(
            where: {
              id_in: ["${UNISWAP_POOL_USDT_BLID_POOL_ADDRESS}"]
            }
            orderBy: totalValueLockedUSD
            orderDirection: desc
            subgraphError: allow
          )
          {
            id
            token0Price
            token1Price
          }
        }`,
    };

    try {
        const response = await retry(async bail => await axios.post(UNISWAP_POOLS_URL, options));

        if (
            response.data &&
            response.data.data &&
            response.data.data.pools &&
            response.data.data.pools[0]
        ) {
            return response.data.data.pools[0].token1Price;
        }
    } catch (e) {
        throw new Error("BLID price fetch failed");
    }
}

async function getLpContract() {
    const contract = new web3.eth.Contract(LPToken, BLID_USDT_TOKEN_ADDRESS);
    const reserves = await contract.methods.getReserves().call();
    const totalSupply = await contract.methods.totalSupply().call();

    const token0 = await contract.methods.token0().call();
    const token1 = await contract.methods.token1().call();

    return {
        contract,
        reserve0: numWei(reserves._reserve0, web3),
        reserve1: numWei(reserves._reserve1, web3),
        totalSupply: numWei(totalSupply, web3),
        token0: token0.toLowerCase(),
        token1: token1.toLowerCase(),
    };
}


function numWei(val) {
    return Number(web3.utils.fromWei(val));
}


module.exports = {
    timetravel: true,
    methodology: 'Total value locked is a sum of all deposits people do',
    tvl: getTotalTVL,
};
