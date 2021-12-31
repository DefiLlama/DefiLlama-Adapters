const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
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

  // const readerAddress = getContract(CHAIN_ID, "Reader");
  // const vaultAddress = getContract(CHAIN_ID, "Vault");
  // const NATIVE_TOKEN_ADDRESS = getContract(CHAIN_ID, "NATIVE_TOKEN");

  // const whitelistedTokenAddresses = TOKEN_SYMBOLS.map((symbol) => {
  //   return getTokenBySymbol(CHAIN_ID, symbol).address;
  // });

  // console.log("collaterals", collaterals)
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

  // const vaultInfo = (await sdk.api.abi.call({
  //   target: readerAddress,
  //   params: [
  //     vaultAddress,
  //     NATIVE_TOKEN_ADDRESS,
  //     expandDecimals(1, 18),
  //     whitelistedTokenAddresses
  //   ],
  //   abi: readerABI['getVaultTokenInfo'],
  //   block,
  //   chain: 'aurora'
  // })).output

  // console.log("Vault info", vaultInfo)
  const infoTokensData = getInfoTokens(CHAIN_ID, collaterals);

  for (let i = 0; i < infoTokensData.infoTokens.length; i++) {
    const token = infoTokensData.infoTokens[i];
    // console.log("Token", token)
    balances[token.symbol] = BigNumber(ethers.utils.formatUnits(token.poolAmounts, token.decimals))
  }

  return balances;
}

module.exports = {
  aurora: {
    tvl,
  }
}

  // NEAR
  // 1119087514861593406330006
  // 75377960358410650816976888595
  // 75318255215243069702856117590

  // '75377960358410650816976888595',
  // '75318255215243069702856117590',
  // '1119087514861593406330006',
  // '56516304145337955379391',
  // '15569500000000000000000000000000',
  // '15569500000000000000000000000000',
  // '983789766258243981030523866471011919',
  // '15569500000000000000000000000000',
  // '15569500000000000000000000000000',

  // WETH
  // '961873951001764084349',
  // '959527333731250000000',
  // '4793641487376087998406056',
  // '192187642450364',
  // '3795267999310000000000000000000000',
  // '3795267999310000000000000000000000',
  // '3487593360931783698303180845916629997',
  // '3795267999310000000000000000000000',
  // '3795267999310000000000000000000000',

  // BTC
  // '2978622',
  // '2883513',
  // '1240324860476340949520',
  // '2082',
  // '48013015000000000000000000000000000',
  // '48013015000000000000000000000000000',
  // '1213752275160370930422756000000000',
  // '48013015000000000000000000000000000',
  // '48013015000000000000000000000000000'