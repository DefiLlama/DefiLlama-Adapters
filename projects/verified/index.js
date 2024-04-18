const { getLogs } = require("../helper/cache/getLogs");

const chainConfig = {
  polygon: {
    primary: {
      address: "0x3Af6bae7e4779808B5B6cE03c5095Af00Fd87731",
      fromBlock: 42888477,
    },
    secondary: {
      address: "0x775979123aD2e6DA3074bB38116430FEAE26974f",
      fromBlock: 54695675,
    },
    margin: {
      address: "0x8965Fc965ffc410E14A211a344eb08993Cb1Bee6",
      fromBlock: 54695749,
    },
  },
};

//gets and record tvl for each token
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

//customise table indicating the address and tvl of each token
const customiseTable = async (tokens, tvls) => {
  let table = [];
  tokens.forEach((token, idx) => {
    table.push({ Token: token, Tvl: tvls[idx] });
  });
  return table;
};

const getChainTvls = (chain) => {
  let allCurrencies = [];
  let allTvls = [];
  return async (_, _1, _2, { api }) => {
    let primaryLogs, secondaryLogs, marginLogs;
    //get primary pool subcribers logs
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
        eventAbi:
          "event subscribers(address indexed security, bytes32 poolId, address investor, address currency, uint256 cashSwapped, uint256 securitySwapped, uint256 timestamp, bool subscription)",
        onlyArgs: true,
      });
    }
    //get secondary pool subcribers logs
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
        eventAbi:
          "event subscribers(bytes32 poolId, address seller, address investor, address indexed securityTraded, address currencySettled, uint256 amount, uint256 price, bytes32 tradeRef, bytes32 DPID, uint256 timestamp)",
        onlyArgs: true,
      });
    }
    //get margin pool subcribers logs
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
        eventAbi:
          "event subscribers(address party, address counterparty, address indexed securityTraded, uint256 securityAmount, address currencySettled, uint256 cashAmount, bytes32 orderRef, uint256 timestamp)",
        onlyArgs: true,
      });
    }
    //extract currencies tvl and showcase table for primary pool
    if (primaryLogs && primaryLogs.length > 0) {
      const primaryTvls = primaryLogs
        .map((i) =>
          i.subscription ? Number(i.cashSwapped) : Number(-i.cashSwapped)
        )
        .flat(); //mark sell orders amounts as negative(to reduce tvl) and buy orders as positive(increase tvl)
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
      console.log("---------", chain, "TVL Details For Primary Pool ---------");
      console.table(tabl);
    }
    //extract currencies tvl and showcase table for secondary pool
    if (secondaryLogs && secondaryLogs.length > 0) {
      const secondaryCurrencies = secondaryLogs
        .map((i) => i.currencySettled)
        .flat();
      const currenciesDecimals = await api.multiCall({
        abi: "uint:decimals",
        calls: secondaryCurrencies,
      });
      const secondaryTvls = secondaryLogs
        .map((i, idx) => {
          if (idx === 0) {
            const rawAmount = Number(i.amount) / 10 ** 18; //since amount is expressed in 18 decimals
            return rawAmount * 10 ** currenciesDecimals[idx];
          } else {
            if (Number(i.price) > Number(secondaryTvls[idx - 1].price)) {
              const rawAmount = Number(i.amount) / 10 ** 18; //since amount is expressed in 18 decimals
              return rawAmount * 10 ** currenciesDecimals[idx];
            } else {
              //Todo: reduce with % reduction??
              const rawAmount = Number(i.amount) / 10 ** 18; //since amount is expressed in 18 decimals
              return -rawAmount * 10 ** currenciesDecimals[idx];
            }
          }
        })
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
        "TVL Details For Secondary Pool ---------"
      );
      console.table(tabl);
    }
    //extract currencies tvl and showcase table for margin pool
    if (marginLogs && marginLogs.length > 0) {
      const marginTvls = marginLogs
        .map((i, idx) => {
          if (idx === 0) {
            return Number(i.cashAmount);
          } else {
            const currentPrice =
              Number(i.cashAmount) / Number(i.securityAmount);
            const previousPrice =
              Number(marginTvls[idx - 1].cashAmount) /
              Number(marginTvls[idx - 1].securityAmount);
            if (currentPrice > previousPrice) {
              return Number(i.cashAmount);
            } else {
              //Todo: reduce with % reduction??
              return Number(-i.cashAmount);
            }
          }
        })
        .flat();
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
      console.log("---------", chain, "TVL Details For Margin Pool ---------");
      console.logTable(tabl);
    }
    if (allCurrencies.length > 0) {
      return api.addTokens(allCurrencies, allTvls);
    } else {
      return () => ({});
    }
  };
};

module.exports = {
  methodology:
    "TVL is digital assests paid in to purchase security tokens on the Verified Network",
  timetravel: true,
  misrepresentedTokens: false,
};

Object.keys(chainConfig).forEach((chain) => {
  module.exports[chain] = {
    tvl: getChainTvls(chain),
  };
});
