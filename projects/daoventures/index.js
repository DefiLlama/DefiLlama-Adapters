const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const moment = require("moment");
const { unwrapYearn } = require("../helper/unwrapLPs");

const DAOvault = {
  Elon: "0x2D9a136cF87D599628BCBDfB6C4fe75Acd2A0aA8",
  Cuban: "0x2AD9F8d4c24652Ea9F8A954F7E1FdB50a3bE1DFD",
  Citadel: "0x8fE826cC1225B03Aa06477Ad5AF745aEd5FE7066",
  FAANG: "0x9ee54014e1E6CF10fD7E9290FdB6101fd0d5D416",
  Metaverse: "0x5b3ae8b672a753906b1592d44741f71fbd05ba8c",
  //MoneyPrinter: "0x3DB93e95c9881BC7D9f2C845ce12e97130Ebf5f2",
};

//timestamp, ethereumBlock, chainBlocks
async function tvl(timestamp, ethereumBlock, chainBlocks) {
  //const timestamp = moment().unix();
  let block = await sdk.api.util.lookupBlock(timestamp);

  let [ElonTVL, CubanTVL, CitadelTVL, FAANGTVL, MetaverseTVL] =
    await Promise.all([
      sdk.api.abi.call({
        target: DAOvault.Elon, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),

      sdk.api.abi.call({
        target: DAOvault.Cuban, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),
      sdk.api.abi.call({
        target: DAOvault.Citadel, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),

      sdk.api.abi.call({
        target: DAOvault.FAANG, // contract address
        abi: abi.getTotalValueInPool, // erc20:methodName
        block: block[block], // Current block number
      }),

      sdk.api.abi.call({
        target: DAOvault.Metaverse, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),
    ]);

  ElonTVL = parseInt(ElonTVL.output) / 10 ** 6;
  CitadelTVL = parseInt(CitadelTVL.output) / 10 ** 6;
  CubanTVL = parseInt(CubanTVL.output) / 10 ** 6;
  MetaverseTVL = parseInt(MetaverseTVL.output) / 10 ** 18;
  FAANGTVL = parseInt(FAANGTVL.output) / 10 ** 18;

  const result = {
    "Elon Vault": ElonTVL,
    "Citadel Vault": CitadelTVL,
    "Cuban Vault": CubanTVL,
    "Metaverse Vault": MetaverseTVL,
    "FAANG Vault": FAANGTVL,
  };

  let balances = 0;
  for (const prop in result) {
    balances += result[prop];
  }
  //await unwrapYearn(balances);
  return { "usd-coin": balances };
}

/*
async function final() {
  console.log(moment().unix());
  const result = await tvl(moment().unix());
  console.log(result);
}

final();
*/

async function stakingTvl(timestamp, block) {
  let balances = {};
  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: "0x77dce26c03a9b833fc2d7c31c22da4f42e9d9582",
    owner: "0x1193c036833B0010fF80a3617BBC94400A284338",
    block,
  });

  sdk.util.sumSingleBalance(
    balances,
    "0x77dce26c03a9b833fc2d7c31c22da4f42e9d9582",
    balance
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: tvl,
    staking: stakingTvl,
  },
  tvl: tvl,
};
