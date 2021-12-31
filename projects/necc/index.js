const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { toBn } = require("evm-bn");
const { ethers } = require('ethers')

const { getContract, NATIVE_TOKEN_AURORA } = require('./helpers/addresses')
const { getTokenBySymbol, TOKEN_SYMBOLS } = require('./helpers/tokens')
const { expandDecimals, getInfoTokens, bigNumberify } = require('./helpers/infoTokens')

const readerABI = require("./abis/abi.json");

const GET_COLLATERALS = gql`
  query getCollaterals {
    collaterals {
      id
      feeReserves
      guaranteedUsd
      ndolAmounts
      reservedAmounts
      poolAmounts
      cumulativeFundingRate
      lastFundingTime
      utilisationRate
      longLiquidations
      shortLiquidations
      longs
      shorts
      longOpenInterest
      shortOpenInterest
    }
  }
`;

const MAINNET = 1313161554;
const CHAIN_ID = MAINNET
const USD_DECIMALS = 30;
const NECC_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/rej156/necc-aurora";

async function tvl(timestamp, block) {
  console.log("Timestamp", timestamp)
  console.log("Block", block)

  const balances = {}
  const { collaterals } = await request(NECC_SUBGRAPH_URL, GET_COLLATERALS, {
    block,
  });
  console.log("Collaterals", collaterals)
  const readerAddress = getContract(CHAIN_ID, "Reader");
  const vaultAddress = getContract(CHAIN_ID, "Vault");
  const NATIVE_TOKEN_ADDRESS = getContract(CHAIN_ID, "NATIVE_TOKEN");

  console.log("readerAddress", readerAddress)

  const whitelistedTokenAddresses = TOKEN_SYMBOLS.map((symbol) => {
    return getTokenBySymbol(CHAIN_ID, symbol).address;
  });
  console.log("whitelistedTokenAddresses", whitelistedTokenAddresses)

  // const lockedNEAR = (await sdk.api.abi.call({
  //   target: "0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d", // NEAR
  //   params: vaultAddress,
  //   abi: 'erc20:balanceOf',
  //   block,
  //   chain: 'aurora'
  // })).output

  // console.log("lockedNEAR", lockedNEAR)

  // const nativeTokenBalance = (await sdk.api.abi.call({
  //   target: NATIVE_TOKEN_AURORA, // NATIVE_TOKEN_AURORA
  //   params: vaultAddress,
  //   abi: 'erc20:balanceOf',
  //   block,
  //   chain: 'aurora'
  // })).output

  // console.log("NATIVE_TOKEN_AURORA", nativeTokenBalance)

  // const BTC_AURORA = (await sdk.api.abi.call({
  //   target: "0xF4eB217Ba2454613b15dBdea6e5f22276410e89e", // BTC_AURORA
  //   params: vaultAddress,
  //   abi: 'erc20:balanceOf',
  //   block,
  //   chain: 'aurora'
  // })).output

  // console.log("BTC_AURORA", BTC_AURORA)

  const vaultInfo = (await sdk.api.abi.call({
    target: readerAddress,
    params: [
      vaultAddress,
      NATIVE_TOKEN_ADDRESS,
      expandDecimals(1, 18),
      whitelistedTokenAddresses
    ],
    abi: readerABI['getVaultTokenInfo'],
    block,
    chain: 'aurora'
  })).output

  console.log("VaultInfo", vaultInfo)

  const infoTokensData = getInfoTokens(CHAIN_ID, collaterals, vaultInfo);

  console.log("infoTokensData", infoTokensData)

  let aum = bigNumberify(0);

  for (let i = 0; i < infoTokensData.infoTokens.length; i++) {
    const token = infoTokensData.infoTokens[i];
    aum = aum.add(token.managedUsd);
  }


  let amountStr = ethers.utils.formatUnits(aum, USD_DECIMALS);

  console.log("Stats AUM", amountStr)

  return balances
}



module.exports = {
  aurora: {
    tvl,
  }
}