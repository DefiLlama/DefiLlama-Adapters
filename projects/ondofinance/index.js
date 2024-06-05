const { getTokenSupply } = require('../helper/solana');
const sui = require("../helper/chain/sui");

module.exports = {
  methodology: "Sums the total supplies of Ondo's issued tokens.",
};

const config = {
  solana: {
    OUSG: "i7u4r16TcsJTgq1kAG8opmVZyVnAKBwLKu6ZPMwzxNc",
    USDY: "A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6",
  },
  ethereum: {
    OUSG: '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92',
    USDY: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
    USDYc: '0xe86845788d6e3e5c2393ade1a051ae617d974c09',
  },
  polygon: {
    OUSG: '0xbA11C5effA33c4D6F8f593CFA394241CfE925811',
  },
  mantle: {
    USDY: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
  },
  sui: {
    USDY: "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY"
  }
}

async function getUSDYTotalSupplySUI() {
  const USDY_TREASURY_CAP_OBJECT_ID = '0x9dca9f57a78fa7f132f95a0cf5c4d1b796836145ead7337da6b94012db62267a';
  let treasuryCapInfo = await sui.getObject(USDY_TREASURY_CAP_OBJECT_ID);
  return treasuryCapInfo.fields.total_supply.fields.value;
}

Object.keys(config).forEach((chain) => {
  let fundsMap = config[chain];
  const fundAddresses = Object.values(fundsMap);

  module.exports[chain] = {
    tvl: async (api) => {
      let supplies;
      if (chain === 'solana') {
        supplies = await Promise.all(fundAddresses.map(getTokenSupply))
          .catch(error => {
            throw error;
          });

        const scaledSupplies = supplies.map(supply => supply * 1_000_000);
        api.addTokens(fundAddresses, scaledSupplies);
      } else if (chain === "sui") {
        let usdySupply = await getUSDYTotalSupplySUI();
        api.addTokens(fundAddresses, [usdySupply]);
      } else {
        supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: fundAddresses });
        api.addTokens(fundAddresses, supplies);
      }
      return api.getBalances();
    },
  };
});

