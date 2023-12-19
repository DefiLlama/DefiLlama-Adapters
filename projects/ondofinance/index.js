const sdk = require("@defillama/sdk");

const { getTokenSupply } = require("../helper/solana");
module.exports = {
  methodology: "Sums Ondo's fund supplies.",
  doublecounted: true,
};

const config = {
  ethereum: {
    OUSG: "0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92",
    USDY: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
    USDYc: "0xe86845788d6e3e5c2393ade1a051ae617d974c09",
  },
  polygon: {
    OUSG: "0xbA11C5effA33c4D6F8f593CFA394241CfE925811",
  },
  mantle: {
    USDY: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
  },
  solana: {
    OUSG: "i7u4r16TcsJTgq1kAG8opmVZyVnAKBwLKu6ZPMwzxNc",
    USDY: "A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6",
  },
};

const getTvlForChain = (chain) => {
  let fundsMap = config[chain];
  const fundAddresses = Object.values(fundsMap);
  if (chain === "solana") {
    return async () => {
      const OUSG = await getTokenSupply(config.solana.OUSG);
      const USDY = await getTokenSupply(config.solana.USDY);

      return { OUSG, USDY };
    };
  }
  return async (_, _b, _cb, { api }) => {
    const balances = {};
    const supplies = await api.multiCall({
      abi: "erc20:totalSupply",
      calls: fundAddresses,
    });

    supplies.forEach((supply, index) => {
      const tokenAddress = fundAddresses[index];
      const key = `${chain}:${tokenAddress}`;
      balances[key] = supply;
    });

    return balances;
  };
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: getTvlForChain(chain),
  };
});
