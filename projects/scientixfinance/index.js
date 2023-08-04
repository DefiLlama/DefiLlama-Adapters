const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
==================================================*/
const axios = require("axios");
const BigNumber = require('bignumber.js');
const sdk = require("@defillama/sdk")

/*==================================================
  Address
==================================================*/

const Scientist = '0xEbB15456C0833033f0310f61748CD597554460Da';
const Transmute = '0x2dfE725eca8FFe13fe4E4a8E015cF857b3b72bcF';
const TransmuteAdapter = '0xa96b313cB2E81505b306250946e3Be86b26706B1';
const Farm = '0x68145F3319F819b8E01Dfa3c094fa8205E9EfB9a';
const VotingEscrow = '0xF92aBA2A79dC133278DE2CDDB38Db775A4b5B024';

// Token
const BUSD = ADDRESSES.bsc.BUSD;
const ibALPACA = "0xf1be8ecc990cbcb90e166b71e368299f0116d421";
const scUSD = "0x0E5C2b15666EEE4b66788E45CF4Da0392C070fa7";
const SCIX = "0x2CFC48CdFea0678137854F010b5390c5144C0Aa5";
const ScixBusd = "0xe8Efb51E051B08614DF535EE192B0672627BDbF9";
const scUsdBusd = "0x53085B02955CFD2F884c58D19B8a35ef5095E8aE";

const ibALPACAPoolId = 3;
const ScixBusdPoolId = 5;
const scUsdBusdPoolId = 6;

/*==================================================
  TVL
==================================================*/

async function getTokenBalance(token, account) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        target: token,
        params: [account],
        abi: 'function balanceOf(address account) view returns (uint256)'
    })
    return output
}

async function getTokenTotalSupply(token) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        target: token,
        abi: "uint256:totalSupply"
    })
    return output
}

// vault
async function totalDepositBUSD(vault) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        target: vault,
        abi: "uint256:totalDeposited"
    })
    return output
}

// transmute
async function getTotalStakedScTokens(transmute) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        target: transmute,
        abi: "uint256:totalSupplyScTokens"
    })
    return output
}

async function getAdapterTotalValue(transmuteAdapter) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        target: transmuteAdapter,
        abi: "uint256:totalValue"
    })
    return output
}

// farm
async function getPoolTotalDeposited(contract, poolID) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        params: [poolID],
        target: contract,
        abi: 'function getPoolTotalDeposited(uint256 _poolId) view returns (uint256)'
    })
    return output
}

async function getBUSDLpPrice(lpTokenAddress, BUSDAddress, scUSDAddress) {
    try {
        let [BUSDBalance, scUSDBalance, totalSupply] = await Promise.all([
            getTokenBalance(BUSDAddress, lpTokenAddress),
            getTokenBalance(scUSDAddress, lpTokenAddress),
            getTokenTotalSupply(lpTokenAddress)
        ]
        );
        return new BigNumber(BUSDBalance).plus(new BigNumber(scUSDBalance))
            .div(new BigNumber(totalSupply));
    } catch (e) {
        sdk.log(e);
    }
    return 0;
}

async function getAalpacaTotal(vault) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        target: vault,
        abi: "uint256:totalToken"
    })
    return output
}

async function getAalpacaTotalSupply(vault) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        target: vault,
        abi: "uint256:totalSupply"
    })
    return output
}

async function getAlpacePrice() {
    const tokenId = 'alpaca-finance';
    // https://api.coingecko.com/api/v3/simple/price?ids=alpaca-finance&vs_currencies=usd
    let result;
    let price = 0;
    try {
        result =
            await axios({
                method: "GET",
                url: "https://api.coingecko.com/api/v3/simple/price",
                params: {
                    ids: tokenId,
                    vs_currencies: "usd",
                },
            });
    } catch (e) {
        return price;
    }
    const data = result.data;
    price = data[tokenId].usd;
    return price;
}

async function getIbAlpacaPrice(vault) {
    try {
        let [price, totalToken, totalSupply] = await Promise.all([
            getAlpacePrice(),
            getAalpacaTotal(vault),
            getAalpacaTotalSupply(vault)
        ]
        );
        return new BigNumber(price).times(new BigNumber(totalToken))
            .div(new BigNumber(totalSupply));
    } catch (e) {
        return new BigNumber(await getAlpacePrice());
    }
}

async function getSCIXTotalLocked(ve) {
    const { output } = await sdk.api.abi.call({
        chain: 'bsc',
        target: ve,
        abi: "uint256:_totalLockedSCIX"
    })
    return output
}

async function getFarmBalance() {
    let [
        ScixPoolBalance, scUSDPoolBalance, ibALPACAPoolBalance,
        BUSDBalance, SCIXBalance, BusdScixLpSupply,
        scUSDLPPrice, ibAlpacaPrice,
        veScixBalance
    ] = await Promise.all([
        // farm
        getPoolTotalDeposited(Farm, ScixBusdPoolId),
        getPoolTotalDeposited(Farm, scUsdBusdPoolId),
        getPoolTotalDeposited(Farm, ibALPACAPoolId),
        // farm price
        getTokenBalance(BUSD, ScixBusd),
        getTokenBalance(SCIX, ScixBusd),
        getTokenTotalSupply(ScixBusd),
        // farm price 2
        getBUSDLpPrice(scUsdBusd, BUSD, scUSD),
        getIbAlpacaPrice(ibALPACA),
        // veScix
        getSCIXTotalLocked(VotingEscrow),
    ]
    );
    // price
    const BusdScixLPPrice = new BigNumber(BUSDBalance).times(2).div(new BigNumber(BusdScixLpSupply));
    const scixPrice = new BigNumber(BUSDBalance).dividedBy(new BigNumber(SCIXBalance));

    let balance = new BigNumber(0);
    // farm BUSD/SICX
    const BusdScix = new BigNumber(ScixPoolBalance).times(BusdScixLPPrice);
    if (!BusdScix.isNaN()) {
        balance = balance.plus(BusdScix);
    }
    // farm BUSD/scUSD
    const BusdScUsd = new BigNumber(scUSDPoolBalance).times(scUSDLPPrice);
    if (!BusdScUsd.isNaN()) {
        balance = balance.plus(BusdScUsd);
    }
    // farm ibALPACA
    const ibAlpacaValue = new BigNumber(ibALPACAPoolBalance).times(ibAlpacaPrice);
    if (!ibAlpacaValue.isNaN()) {
        balance = balance.plus(ibAlpacaValue);
    }
    // veScix
    const veScixValue = new BigNumber(veScixBalance).times(scixPrice);
    if (!veScixValue.isNaN()) {
        balance = balance.plus(veScixValue);
    }

    return balance;
}

function getGWeiFromWei(wei, decimals = 18) {
    return BigNumber(wei)
        .dividedBy(BigNumber(10).pow(decimals))
        .toFixed(2);
}

// total tvl
async function fetch() {
    let balance = {}
    let [
        vaultDepositBUSD,
        stakedScUsd, transmuteBUSD, transmuteAdapterBUSD,
        farmBalance
    ] = await Promise.all([
        // vault
        totalDepositBUSD(Scientist),
        // transmute
        getTotalStakedScTokens(Transmute),
        getTokenBalance(BUSD, Transmute),
        getAdapterTotalValue(TransmuteAdapter),
        // farm
        getFarmBalance()
    ]
    );

    let tvl = new BigNumber(0);
    // vault
    tvl = tvl.plus(new BigNumber(vaultDepositBUSD));
    // transmute
    tvl = tvl.plus(new BigNumber(stakedScUsd)).plus(new BigNumber(transmuteBUSD)).plus(new BigNumber(transmuteAdapterBUSD));
    // farm
    tvl = tvl.plus(farmBalance);

    tvl = getGWeiFromWei(tvl);
    return balance = parseFloat(tvl);
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    start: 10880500,    // 09/16/2020 @ 12:00am (UTC+8)
    fetch,
};
