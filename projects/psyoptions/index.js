

const { clusterApiUrl, Connection, PublicKey, Keypair } = require("@solana/web3.js");
const { getMultipleAccountInfo, getMultipleMintInfo } = require("./accounts");
const { TOKENSBASE } = require("./tokens");
const { Provider, Program } = require("@project-serum/anchor");
const { NodeWallet } = require("@project-serum/anchor/dist/cjs/provider");
const PsyAmericanIdl = require('./idl.json')
const Axios = require('axios');
const { toUSDTBalances } = require("../helper/balances");

function getAmountWithDecimal(amount, decimal) {
    while (decimal > 0) {
        amount /= 10;
        decimal--;
    }

    return amount;
}

async function getPriceWithTokenAddress(
    mintAddress
) {
    const response = await Axios("https://price-api.sonar.watch/prices")
    const token = response.data.filter((value) => mintAddress.indexOf(value.mint) >= 0);
    return token;
}

async function getAllOptionAccounts(program) {
    const accts = (await program.account.optionMarket.all())
    return accts.map(acct => ({
        ...acct.account,
        key: acct.publicKey
    }))
}

async function tvl() {
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const anchorProvider = new Provider(connection, new NodeWallet(new Keypair()), {});
    const program = new Program(PsyAmericanIdl, new PublicKey("R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs"), anchorProvider);
    const optionMarkets = await getAllOptionAccounts(program)

    let assetPoolList = {};

    const keys = [];
    const poolList = [];

    optionMarkets.forEach(market => {
        if (!assetPoolList[market.underlyingAssetMint.toBase58()]) {
            assetPoolList[market.underlyingAssetMint.toBase58()] = [];
        }
        if (!assetPoolList[market.quoteAssetMint.toBase58()]) {
            assetPoolList[market.quoteAssetMint.toBase58()] = [];
        }

        if (assetPoolList[market.underlyingAssetMint.toBase58()]) {
            assetPoolList[market.underlyingAssetMint.toBase58()].push(market.underlyingAssetPool);
            poolList.push(market.underlyingAssetPool);
        }

        if (assetPoolList[market.quoteAssetMint.toBase58()]) {
            assetPoolList[market.quoteAssetMint.toBase58()].push(market.quoteAssetPool);
            poolList.push(market.quoteAssetPool);
        }

        if (keys.indexOf(market.underlyingAssetMint.toBase58()) < 0)
            keys.push(market.underlyingAssetMint.toBase58());
        if (keys.indexOf(market.quoteAssetMint.toBase58()) < 0)
            keys.push(market.underlyingAssetMint.toBase58());
    });

    const priceOfMint = await getPriceWithTokenAddress(keys);

    const mintList = await getMultipleMintInfo(connection, keys.map(key => new PublicKey(key)));

    const accountList = await getMultipleAccountInfo(connection, poolList);

    const keys2 = Object.keys(assetPoolList);
    const assetAmounts = {};

    for await (const key of keys2) {
        assetAmounts[key] = 0;
        accountList.forEach(accInfo => {
            if (assetPoolList[key].indexOf(accInfo.pubkey) >= 0) {
                const mint = mintList.find((mint) => mint && mint.key === key);
                const pMint = priceOfMint.find((mint) => mint.mint === key);
                const price = pMint ? pMint.price : 0;
                if (mint) {
                    let decimal = mint.data.decimals;
                    let amount = accInfo.info.amount.toNumber();
                    assetAmounts[key] += getAmountWithDecimal(amount, decimal) * price;
                }
            }
        });
    };

    let dataPoints = [];

    let total = 0;
    keys2.forEach(key => {
        const tokenKeys = Object.keys(TOKENSBASE);
        let symbol = '';
        tokenKeys.forEach(tkey => {
            if (TOKENSBASE[tkey].mintAddress === key)
                symbol = TOKENSBASE[tkey].symbol;
        });

        dataPoints.push({ label: symbol, y: Math.round(assetAmounts[key]) });
        total += assetAmounts[key];
    })
    return toUSDTBalances(total)
}

module.exports={
    misrepresentedTokens: true,
    solana:{
        tvl
    }
}

