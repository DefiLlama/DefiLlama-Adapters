const {
  PublicKey,
} = require("@solana/web3.js");
const { getMultipleAccountInfo, getMultipleMintInfo, deserializeAccount } = require("./accounts");
const { TOKENSBASE } = require("./tokens");
const { Program } = require("@project-serum/anchor");
const PsyAmericanIdl = require("./idl.json");
const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");
const { getConnection, getProvider, } = require("../helper/solana");

const textEncoder = new TextEncoder();

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

function getAmountWithDecimal(amount, decimal) {
  while (decimal > 0) {
    amount /= 10;
    decimal--;
  }

  return amount;
}

async function getPriceWithTokenAddress(mintAddress) {
  const { data } = await axios.post("https://coins.llama.fi/prices", {
    coins: mintAddress.map((a) => `solana:${a}`),
  });
  return data.coins;
}

async function getAllOptionAccounts(program) {
  const accts = await program.account.optionMarket.all();
  return accts.map((acct) => ({
    ...acct.account,
    key: acct.publicKey,
  }));
}

async function getPsyAmericanTokenAccounts(anchorProvider) {
  const program = new Program(
    PsyAmericanIdl,
    new PublicKey("R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs"),
    anchorProvider
  );
  const optionMarkets = await getAllOptionAccounts(program);
  let mintTokenAccountsMap = {};
  const mintKeys = {};
  const tokenAccounts = [];
  optionMarkets.forEach((market) => {
    if (!mintTokenAccountsMap[market.underlyingAssetMint.toBase58()]) {
      mintTokenAccountsMap[market.underlyingAssetMint.toBase58()] = [];
    }
    if (!mintTokenAccountsMap[market.quoteAssetMint.toBase58()]) {
      mintTokenAccountsMap[market.quoteAssetMint.toBase58()] = [];
    }

    if (mintTokenAccountsMap[market.underlyingAssetMint.toBase58()]) {
      mintTokenAccountsMap[market.underlyingAssetMint.toBase58()].push(
        market.underlyingAssetPool
      );
      tokenAccounts.push(market.underlyingAssetPool);
    }

    if (mintTokenAccountsMap[market.quoteAssetMint.toBase58()]) {
      mintTokenAccountsMap[market.quoteAssetMint.toBase58()].push(
        market.quoteAssetPool
      );
      tokenAccounts.push(market.quoteAssetPool);
    }

    if (!mintKeys[market.underlyingAssetMint.toBase58()])
      mintKeys[market.underlyingAssetMint.toBase58()] = true;
    if (!mintKeys[market.quoteAssetMint.toBase58()])
      mintKeys[market.underlyingAssetMint.toBase58()] = true;
  });
  return { mintKeys, mintTokenAccountsMap, tokenAccounts };
}

async function getTokenizedEurosControlledAccounts(anchorProvider) {
  const programId = new PublicKey(
    "FASQhaZQT53W9eT9wWnPoBFw8xzZDey9TbMmJj6jCQTs"
  );
  const [poolAuthority] = await PublicKey.findProgramAddress(
    [textEncoder.encode("poolAuthority")],
    programId
  );
  const tokenProgramAccounts =
    await anchorProvider.connection.getTokenAccountsByOwner(poolAuthority, {
      programId: TOKEN_PROGRAM_ID,
    });
  let mintTokenAccountsMap = {};
  const mintKeys = {};
  const tokenAccounts = [];
  tokenProgramAccounts.value.forEach((tokenProgramAccount) => {
    // Add the token account pubkey to the token accounts list
    tokenAccounts.push(tokenProgramAccount.pubkey);
    // Decode the account data buffer
    const dataBuffer = tokenProgramAccount.account.data;
    const decoded = deserializeAccount(dataBuffer);
    const mintAddress = decoded.mint.toBase58();
    // Add the mint to the mint keys object
    mintKeys[mintAddress] = true;
    // Add the token account to the mintTokenAccountsMap
    if (Array.isArray(mintTokenAccountsMap[mintAddress])) {
      mintTokenAccountsMap[mintAddress].push(tokenProgramAccount.pubkey);
    } else {
      mintTokenAccountsMap[mintAddress] = [tokenProgramAccount.pubkey];
    }
  });

  return { mintKeys, mintTokenAccountsMap, tokenAccounts };
}

async function tvl() {
  const connection = getConnection();
  const anchorProvider = getProvider();

  // Maps mint addresses to an array of token accounts
  let mintTokenAccountsMap = {};
  let mintKeys = {};
  // Array of token account addresses (base58 strings)
  let tokenAccounts = [];

  const responses = await Promise.all([
    getPsyAmericanTokenAccounts(anchorProvider),
    getTokenizedEurosControlledAccounts(anchorProvider),
  ]);
  responses.forEach((res) => {
    const {
      mintKeys: protocolMints,
      mintTokenAccountsMap: protocolAccountMap,
      tokenAccounts: protocolTokenAccounts,
    } = res;
    // Add in the mint keys
    mintKeys = { ...mintKeys, ...protocolMints };
    // Add in the new token accounts
    tokenAccounts = [...tokenAccounts, ...protocolTokenAccounts];
    // Consolidate the mint to token accounts map
    Object.keys(protocolAccountMap).forEach((mintAddress) => {
      if (Array.isArray(mintTokenAccountsMap[mintAddress])) {
        // Concat the two arrays
        mintTokenAccountsMap[mintAddress] = [
          ...mintTokenAccountsMap[mintAddress],
          ...protocolAccountMap[mintAddress],
        ];
      } else {
        // Create a new array
        mintTokenAccountsMap[mintAddress] = protocolAccountMap[mintAddress];
      }
    });
  });

  // Transform the object of keys to an array
  const keys = Object.keys(mintKeys);

  const priceOfMint = await getPriceWithTokenAddress(keys);

  const mintList = await getMultipleMintInfo(
    connection,
    keys.map((key) => new PublicKey(key))
  );

  const accountList = await getMultipleAccountInfo(connection, tokenAccounts);

  const keys2 = Object.keys(mintTokenAccountsMap);
  const assetAmounts = {};

  for await (const key of keys2) {
    assetAmounts[key] = 0;
    accountList.forEach((accInfo) => {
      if (mintTokenAccountsMap[key].indexOf(accInfo.pubkey) >= 0) {
        const mint = mintList.find((mint) => mint && mint.key === key);
        const pMint = priceOfMint[`solana:${key}`];
        const price = pMint ? pMint.price : 0;
        if (mint) {
          let decimal = mint.data.decimals;
          let amount = +accInfo.info.amount.toString();
          assetAmounts[key] += getAmountWithDecimal(amount, decimal) * price;
        }
      }
    });
  }

  let dataPoints = [];

  let total = 0;
  keys2.forEach((key) => {
    const tokenKeys = Object.keys(TOKENSBASE);
    let symbol = "";
    tokenKeys.forEach((tkey) => {
      if (TOKENSBASE[tkey].mintAddress === key)
        symbol = TOKENSBASE[tkey].symbol;
    });

    dataPoints.push({ label: symbol, y: Math.round(assetAmounts[key]) });
    total += assetAmounts[key];
  });
  return toUSDTBalances(total);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
