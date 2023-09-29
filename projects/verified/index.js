/**{
 * Defi Adapter for Verified that gets TVLs for both primary and secondary manager contracts
 * on Polygon, Georli and Gnosis chain/network.
 * } **/

//import prewritten getLogs from helper
const { getLogs } = require("../helper/cache/getLogs");

//configuration showcasing chainlist with address and fromBlocks(block to start reading logs from)
//for each chain
const chainConfig = {
  polygon: {
    primary: {
      address: "0xDA13BC71FEe08FfD523f10458B0e2c2D8427BBD5",
      fromBlock: 48018079,
    },
    secondary: {
      address: "0xbe7a3D193d91D1F735d14ec8807F20FF2058f342",
      fromBlock: 48018079,
    },
  },
  goerli: {
    primary: {
      address: "0x57E416421ffCDF26d630F2bf36776Dc019A9Dc02",
      fromBlock: 9572471,
    },
    secondary: {
      address: "0x252b67835032D25b3913571446EDB0d1597D2DFf",
      fromBlock: 9774083,
    },
  },
  //   gnosis: {
  //     primary: {
  //       address: "0xe5459436AE26C4fDC77f51c459e9Aa08b5d32064",
  //       fromBlock: 30181663,
  //     },
  //     secondary: {
  //       address: "0xB1ae3Fc5B16d3736bf0db20606fB9a10b435392c",
  //       fromBlock: 30181663,
  //     },
  //   },
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

//customise table indicating the address, tvl and total tvl of each tokens
const customiseTable = async (tokens, tvls) => {
  let table = [];
  tokens.forEach((token, idx) => {
    table.push({ Token: token, Tvl: tvls[idx] });
  });
  return table;
};

//gets chainTvl can be used for any chain in chainCoinfig configuration with contracts that emits
//event topics: 0x03e4d401f7446bde326c5951f40797b975fbe06e73f36b2a41646ea680cc40f2 or 0x0dd4a121adafd4537e046c792647be3f3978f362ad83b50586e249ae8641de2f
const getChainTvls = (chain) => {
  let allCurrencies = [];
  let allTvls = [];
  return async (_, _1, _2, { api }) => {
    const primaryLogs = await getLogs({
      api,
      target: chainConfig[chain].primary.address,
      topic:
        "subscribers(address,bytes32,address,address,uint256,uint256,uint256,bool)",
      fromBlock: chainConfig[chain].primary.fromBlock,
      eventAbi:
        "event subscribers(address indexed security, bytes32 poolId, address investor, address currency, uint256 cashSwapped, uint256 securitySwapped, uint256 timestamp, bool subscription)",
      onlyArgs: true,
    });
    const secondaryLogs = await getLogs({
      api,
      target: chainConfig[chain].secondary.address,
      topic:
        "subscribers(bytes32,address,address,address,address,uint256,uint256,bytes32,bytes32,uint256)",
      fromBlock: chainConfig[chain].secondary.fromBlock,
      eventAbi:
        "event subscribers(bytes32 poolId, address seller, address investor, address indexed securityTraded, address currencySettled, uint256 amount, uint256 price, bytes32 tradeRef, bytes32 DPID, uint256 timestamp)",
      onlyArgs: true,
    });
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
    if (allCurrencies.length > 0) {
      const decimals = await api.multiCall({
        abi: "uint256:decimals",
        calls: allCurrencies,
      });
      console.log("=============== Total", chain, "TVL  ===============");
      return api.addTokens(
        allCurrencies,
        allTvls.map((tvl, idx) => tvl * 10 ** decimals[idx]).flat()
      );
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
