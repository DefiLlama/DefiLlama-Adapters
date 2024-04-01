/**{
 * Defi Adapter for Verified that gets TVLs for all Verified pools(primary, secondary and margin)
 * on Polygon, Georli and Gnosis chain/network.
 * } **/

//import prewritten getLogs from helper
const { getLogs } = require("../helper/cache/getLogs");

//configuration showcasing chainlist with address and fromBlocks(block to start reading logs from)
// toBlocks(block to stop reading logs from) for each chain
const chainConfig = {
  polygon: {
    primary: {
      address: "0x3Af6bae7e4779808B5B6cE03c5095Af00Fd87731", //not current must change
      fromBlock: 42888477, //not current ust channge
      toBlock: 43403266, // test only(for contract that have been deployed long time)
    },
    // secondary: {
    //   address: "0x9e4fcc52d9F34DC0dc3744E5b8c3eEC32e8b8214", // current up to 1/4/2024
    //   fromBlock: 54695675, // current up to 1/4/2024
    // },
    // margin: {
    //   address: "0x8965Fc965ffc410E14A211a344eb08993Cb1Bee6", // current up to 1/4/2024
    //   fromBlock: 54695749, // current up to 1/4/2024
    // },
  },
};

//gets and record total tvl for each token
const getTokensTvl = async (tokens, tvls) => {
  let table = {};
  tokens.forEach((token, idx) => {
    if (!table[token]) {
      table[token] = tvls[idx];
    } else {
      table[token] = table[token] + tvls[idx];
    }
  });
  return table;
};

//customise table indicating the address, tvl and total tvl of each token
const customiseTable = async (tokens, tvls) => {
  let table = [];
  tokens.forEach((token, idx) => {
    table.push({ Token: token, Tvl: tvls[idx] });
  });
  return table;
};

//gets chainTvl for any chain in chainCoinfig configuration with manager contracts that emits
//event topics: [
//0x03e4d401f7446bde326c5951f40797b975fbe06e73f36b2a41646ea680cc40f2,
//0x0dd4a121adafd4537e046c792647be3f3978f362ad83b50586e249ae8641de2f,
//0x4f21132feec602e5e9588b602a7ede709b68eed293452dd8745c2c80cb3c3f11
//]
const getChainTvls = (chain) => {
  let allCurrencies = [];
  let allTvls = [];
  return async (_, _1, _2, { api }) => {
    let primaryLogs = [],
      secondaryLogs = [],
      marginLogs = [];
    if (
      chainConfig[chain] &&
      chainConfig[chain].primary &&
      chainConfig[chain].primary.address
    ) {
      primaryLogs = await getLogs({
        api,
        target: chainConfig[chain].primary.address,
        topic:
          "subscribers(address,bytes32,address,address,uint256,uint256,uint256,bool)",
        fromBlock: chainConfig[chain].primary.fromBlock,
        toBlock: chainConfig[chain].primary.toBlock ?? null,
        eventAbi:
          "event subscribers(address indexed security, bytes32 poolId, address investor, address currency, uint256 cashSwapped, uint256 securitySwapped, uint256 timestamp, bool subscription)",
        onlyArgs: true,
      });
    }

    if (
      chainConfig[chain] &&
      chainConfig[chain].secondary &&
      chainConfig[chain].secondary.address
    ) {
      secondaryLogs = await getLogs({
        api,
        target: chainConfig[chain].secondary.address,
        topic:
          "subscribers(bytes32,address,address,address,address,uint256,uint256,bytes32,bytes32,uint256)",
        fromBlock: chainConfig[chain].secondary.fromBlock,
        toBlock: chainConfig[chain].primary.toBlock ?? null,
        eventAbi:
          "event subscribers(bytes32 poolId, address seller, address investor, address indexed securityTraded, address currencySettled, uint256 amount, uint256 price, bytes32 tradeRef, bytes32 DPID, uint256 timestamp)",
        onlyArgs: true,
      });
    }

    if (
      chainConfig[chain] &&
      chainConfig[chain].margin &&
      chainConfig[chain].margin.address
    ) {
      marginLogs = await getLogs({
        api,
        target: chainConfig[chain].margin.address,
        topic:
          "subscribers(address,address,address,uint256,address,uint256,bytes32,uint256)",
        fromBlock: chainConfig[chain].margin.fromBlock,
        toBlock: chainConfig[chain].primary.toBlock ?? null,
        eventAbi:
          "event subscribers(address party, address counterparty, address indexed securityTraded, uint256 securityAmount, address currencySettled, uint256 cashAmount, bytes32 orderRef, uint256 timestamp)",
        onlyArgs: true,
      });
    }

    if (primaryLogs.length > 0) {
      const primaryTvls = primaryLogs.map((i) => Number(i.cashSwapped)).flat();
      const primaryCurrencies = primaryLogs.map((i) => i.currency).flat();
      primaryTvls.forEach((tvl) => {
        allTvls.push(tvl);
      });
      primaryCurrencies.forEach((curr) => {
        allCurrencies.push(curr);
      });
      const names = await api.multiCall({
        abi: "string:name",
        calls: primaryCurrencies,
      });
      const currencyTvls = await getTokensTvl(names, primaryTvls);
      const tabl = await customiseTable(
        Object.keys(currencyTvls),
        Object.values(currencyTvls)
      );
      console.log(
        "---------",
        chain,
        "TVL Details For Primary Manager ---------"
      );
      console.table(tabl);
    }
    if (secondaryLogs.length > 0) {
      const secondaryTvls = secondaryLogs.map((i) => Number(i.amount)).flat();
      const secondaryCurrencies = secondaryLogs
        .map((i) => i.currencySettled)
        .flat();
      secondaryTvls.forEach((tvl) => {
        allTvls.push(tvl);
      });
      secondaryCurrencies.forEach((curr) => {
        allCurrencies.push(curr);
      });
      const names = await api.multiCall({
        abi: "string:name",
        calls: secondaryCurrencies,
      });
      const currencyTvls = await getTokensTvl(names, secondaryTvls);
      const tabl = await customiseTable(
        Object.keys(currencyTvls),
        Object.values(currencyTvls)
      );
      console.log(
        "---------",
        chain,
        "TVL Details For Secondary Manager ---------"
      );
      console.table(tabl);
    }
    if (marginLogs.length > 0) {
      const marginTvls = marginLogs.map((i) => Number(i.cashAmount)).flat();
      const marginCurrencies = marginLogs.map((i) => i.currencySettled).flat();
      marginTvls.forEach((tvl) => {
        allTvls.push(tvl);
      });
      marginCurrencies.forEach((curr) => {
        allCurrencies.push(curr);
      });
      const names = await api.multiCall({
        abi: "string:name",
        calls: marginCurrencies,
      });
      const currencyTvls = await getTokensTvl(names, marginTvls);
      const tabl = await customiseTable(
        Object.keys(currencyTvls),
        Object.values(currencyTvls)
      );
      console.log(
        "---------",
        chain,
        "TVL Details For Margin Manager ---------"
      );
      console.table(tabl);
    }

    if (allCurrencies.length > 0) {
      const decimals = await api.multiCall({
        abi: "uint256:decimals",
        calls: allCurrencies,
      }); //get decials to verify for each pool(primar sees ok without decimals)
      console.log("=============== Total", chain, "TVL  ===============");
      return api.addTokens(allCurrencies, allTvls);
    } else {
      return 0;
    }
  };
};

module.exports = {};

Object.keys(chainConfig).forEach((chain) => {
  module.exports[chain] = {
    tvl: getChainTvls(chain),
  };
});
