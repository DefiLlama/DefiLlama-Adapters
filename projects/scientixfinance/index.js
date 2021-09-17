/*==================================================
  Modules
==================================================*/
const Web3 = require('web3')
const axios = require("axios");
const BigNumber = require('bignumber.js');
const web3 = new Web3(new Web3.providers.HttpProvider(`https://bsc-dataseed.binance.org/`));

const scientistAbi = require('./abi/Scientist.json');
const transmuteAbi = require('./abi/Transmuter.json');
const transmuteAdapterAbi = require('./abi/YearnVaultAdapterWithIndirection.json');
const stakingPoolsAbi = require('./abi/StakingPools.json');
const scTokenAbi = require('./abi/ScToken.json');
const votingEscrowAbi = require('./abi/VotingEscrow.json');
const alpacaVaultAbi = require('./abi/AlpacaVault.json');


/*==================================================
  Address
==================================================*/

const Scientist = '0xEbB15456C0833033f0310f61748CD597554460Da';
const Transmute = '0x2dfE725eca8FFe13fe4E4a8E015cF857b3b72bcF';
const TransmuteAdapter = '0xa96b313cB2E81505b306250946e3Be86b26706B1';
const Farm = '0x68145F3319F819b8E01Dfa3c094fa8205E9EfB9a';
const VotingEscrow = '0xF92aBA2A79dC133278DE2CDDB38Db775A4b5B024';

// Token
const BUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
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
    const tokenContract = new web3.eth.Contract(scTokenAbi, token);
    return tokenContract.methods.balanceOf(account)
        .call();
}

async function getTokenTotalSupply(token) {
    const tokenContract = new web3.eth.Contract(scTokenAbi, token);
    return tokenContract.methods.totalSupply()
        .call();
}

// vault
async function totalDepositBUSD(vault) {
    const vaultContract = new web3.eth.Contract(scientistAbi, vault);
    return vaultContract.methods.totalDeposited()
        .call();
}

// transmute
async function getTotalStakedScTokens(transmute) {
    const transmuteContract = new web3.eth.Contract(transmuteAbi, transmute);
    return transmuteContract.methods.totalSupplyScTokens()
        .call();
}

async function getAdapterTotalValue(transmuteAdapter) {
    const transmuteContract = new web3.eth.Contract(transmuteAdapterAbi, transmuteAdapter);
    return transmuteContract.methods.totalValue()
        .call();
}

// farm
async function getPoolTotalDeposited(contract, poolID) {
    const poolContract = new web3.eth.Contract(stakingPoolsAbi, contract);
    return poolContract.methods.getPoolTotalDeposited(poolID)
        .call();
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
        console.log(e);
    }
    return 0;
}

async function getAalpacaTotal(vault) {
    const alpacaContract = new web3.eth.Contract(alpacaVaultAbi, vault);
    return alpacaContract.methods.totalToken()
        .call();
}

async function getAalpacaTotalSupply(vault) {
    const alpacaContract = new web3.eth.Contract(alpacaVaultAbi, vault);
    return alpacaContract.methods.totalSupply()
        .call();
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
    const contract = new web3.eth.Contract(votingEscrowAbi, ve);
    return await contract.methods._totalLockedSCIX().call();
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
async function tvl() {
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
    return parseFloat(tvl);
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    name: 'scientix.finance',
    token: 'SCIX',
    start: 10880500,    // 09/16/2020 @ 12:00am (UTC+8)
    tvl,
};
