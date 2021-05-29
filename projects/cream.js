const utils = require("./helper/utils");
const { GraphQLClient, gql } = require("graphql-request");

require("dotenv").config();

const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.ETHEREUM_RPC)
);

const CRETHAbi = require("./CRETH2abi.json");

async function fetch() {
  let price_feed = await utils.getPricesfromString(
    "binancecoin,fantom,ethereum"
  );
  let tvl = 0;

  // --- Supplying data split in Iron Bank, ETH, BSC & Fantom ---
  let tokens_ethereum = await utils.fetchURL(
    "https://api.cream.finance/api/v1/crtoken?comptroller=eth"
  );
  let tokens_bsc = await utils.fetchURL(
    "https://api.cream.finance/api/v1/crtoken?comptroller=bsc"
  );
  let tokens_fantom = await utils.fetchURL(
    "https://api.cream.finance/api/v1/crtoken?comptroller=fantom"
  );
  let tokens_iron_bank = await utils.fetchURL(
    "https://api.cream.finance/api/v1/crtoken?comptroller=ironbank"
  );

  await Promise.all(
    tokens_ethereum.data.map(async (token) => {
      let balance =
        token.underlying_price.value *
        token.exchange_rate.value *
        token.total_supply.value *
        price_feed.data.ethereum.usd;

      tvl += balance;
    }),
    tokens_bsc.data.map(async (token) => {
      let balance =
        token.underlying_price.value *
        token.exchange_rate.value *
        token.total_supply.value *
        price_feed.data.binancecoin.usd;
      tvl += balance;
    }),
    tokens_fantom.data.map(async (token) => {
      let balance =
        token.total_supply.value *
        token.underlying_price.value *
        token.exchange_rate.value;
      tvl += balance;
    }),
    tokens_iron_bank.data.map(async (token) => {
      let balance =
        token.underlying_price.value *
        token.exchange_rate.value *
        token.total_supply.value;

      tvl += balance;
    })
  );

  // --- Staking Services --
  let bsc_staking_service = await utils.fetchURL(
    "https://api.binance.org/v1/staking/chains/bsc/validators/bva1asktsxqny35hwxltpzqsvr64s5vr2ph2t2vlnw/"
  );

  tvl += bsc_staking_service.data.votingPower * price_feed.data.binancecoin.usd;

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

  try {
    const fantomStakingData = await graphQLClient.request(query, {
      address: stakerCreamAddressInFantom,
    });

    console.log(fantomStakingData);

    const totalStakedFantom =
      Number(fantomStakingData.data.staker.totalStake) / 10 ** 18;

    tvl += totalStakedFantom * price_feed.data.fantom.usd;
  } catch (err) {
    console.error("---------------------------");
    console.error(err);
  }

  // --- Contract where ETH is staked `CRETH2` & eth2 deposit contracts ----
  const CRETH2 = "0xcBc1065255cBc3aB41a6868c22d1f1C573AB89fd";

  // --- Account 1st the pendant ETH in CRETH2 (not sent to `eth2Deposit`) ---
  try {
    const eth_bal_in_creth2 = web3.utils.fromWei(
      await web3.eth.getBalance(CRETH2),
      "ether"
    );

    tvl += Number(eth_bal_in_creth2) * price_feed.data.ethereum.usd;
  } catch (err) {
    console.error("---------------------------");
    console.error(err);
  }

  // --- Account also for the ETH already deposited in `eth2Deposit` ---
  try {
    const CRETHContract = new web3.eth.Contract(CRETHAbi, CRETH2);

    const accumulated = web3.utils.fromWei(
      await CRETHContract.methods.accumulated().call()
    );

    tvl += Number(accumulated) * price_feed.data.ethereum.usd;
  } catch (err) {
    console.error("---------------------------");
    console.error(err);
  }

  console.log(tvl);
  return tvl;
}

module.exports = {
  fetch,
};
