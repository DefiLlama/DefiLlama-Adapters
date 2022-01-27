const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { getCompoundV2Tvl, compoundExports } = require("../helper/compound");
const { transformFantomAddress } = require('../helper/portedTokens')
const { GraphQLClient, gql } = require('graphql-request')

const abiCerc20 = require("./cerc20.json");
const wETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const replacements = {
  "0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7": wETH, // yWETH -> WETH
  //'0x27b7b1ad7288079A66d12350c828D3C00A6F07d7': '0x6b175474e89094c44da98b954eedeac495271d0f', // yearn: yCRV-IB -> DAI
  "0x986b4AFF588a109c09B50A03f42E4110E29D353F": wETH, // yearn: yCRV/sETH
  "0xdCD90C7f6324cfa40d7169ef80b12031770B4325": wETH, // yearn: yCRV/stETH
  "0x9cA85572E6A3EbF24dEDd195623F188735A5179f":
    "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490", // yearn: y3Crv -> 3Crv
};

const fantomToken = "0x4e15361fd6b4bb609fa63c81a2be19d873717870";
const fantomTvl = async (timestamp, ethBlock, chainBlocks) => {
  const block = chainBlocks["fantom"]; // req for the block type
  let balances = {};

  let tokens_fantom = (
    await utils.fetchURL(
      "https://api.cream.finance/api/v1/crtoken?comptroller=fantom"
    )
  ).data;

  let cashValues = (
    await sdk.api.abi.multiCall({
      block,
      calls: tokens_fantom.map((token) => ({ target: token.token_address })),
      abi: abiCerc20["getCash"],
      chain: "fantom",
    })
  ).output;

  let underlyings = (
    await sdk.api.abi.multiCall({
      block,
      calls: tokens_fantom.map((token) => ({ target: token.token_address })),
      abi: abiCerc20["underlying"],
      chain: "fantom",
    })
  ).output;

  const fantomAddr = await transformFantomAddress()
  cashValues.map((cashVal, idx) => {
    const tokenAddr = underlyings[idx].output === "0x924828a9Fb17d47D0eb64b57271D10706699Ff11" ? "0xb753428af26e81097e7fd17f40c88aaa3e04902c" : fantomAddr(underlyings[idx].output); //SFI
    sdk.util.sumSingleBalance(balances, tokenAddr, cashVal.output);
  });

  /*

  const stakerCreamAddressInFantom =
    "0x0abad588c5490eee5850693e16bb6de9d60bdb6c";
  const fantom_staking_service_endpoint = "https://xapi3.fantom.network/api";
  const graphQLClient = new GraphQLClient(fantom_staking_service_endpoint);

  const query = gql`
    query StakerByAddress($address: Address!) {
      staker(address: $address) {
        id
        stakerAddress
        totalStake
        stake
        delegatedMe
        createdEpoch
        createdTime
        downtime
        lockedUntil
        isActive
        isOffline
        stakerInfo {
          name
          website
          contact
          logoUrl
          __typename
        }
        __typename
      }
    }
  `;

  const fantomStakingData = await graphQLClient.request(query, {
    address: stakerCreamAddressInFantom,
  });
  sdk.util.sumSingleBalance(balances, fantomToken, fantomStakingData.staker.totalStake)
  */
 
  return balances;
};

module.exports = {
  timetravel: false, // fantom api's for staked coins can't be queried at historical points
  start: 1599552000, // 09/08/2020 @ 8:00am (UTC)
  ethereum: compoundExports("0xAB1c342C7bf5Ec5F02ADEA1c2270670bCa144CbB", "ethereum"),
  fantom: {
    tvl: fantomTvl,
    borrowed: getCompoundV2Tvl("0x4250a6d3bd57455d7c6821eecb6206f507576cd2", "fantom", addr=>`fantom:${addr}`, undefined, undefined, true)
  },
  avalanche:compoundExports("0x2eE80614Ccbc5e28654324a66A396458Fa5cD7Cc", "avax"),
};
