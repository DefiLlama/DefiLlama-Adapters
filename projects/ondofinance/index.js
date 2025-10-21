const ADDRESSES = require('../helper/coreAssets.json')
const { getTokenSupplies } = require("../helper/solana");
const sui = require("../helper/chain/sui");
const { aQuery } = require("../helper/chain/aptos");
const { get } = require("../helper/http");
const {post} = require("../helper/http");

const RIPPLE_ENDPOINT = 'https://s1.ripple.com:51234';

async function getXrplTokenBalances(issuer_acct, currency_code) {
  const body =  {
      method: 'gateway_balances',
      params: [{ account: issuer_acct, ledger_index: 'validated' }]
  };
  const res = await post(RIPPLE_ENDPOINT, body);

  const obligations = res.result.obligations?.[currency_code] ?? "0";

  let frozenAmount = 0;
  if (res.result.frozen_balances) {
    const frozenBalances = Object.values(res.result.frozen_balances)
      .flat() // Flatten the balances for each user into a single array
      .filter((balance) => balance.currency === currency_code) // Filter for OUSG currency
    frozenBalances.forEach((balance) => {
      frozenAmount = frozenAmount + parseFloat(balance.value)
    });
  }

  const totalAmount = (parseFloat(obligations) + frozenAmount);

  return totalAmount;
}

module.exports = {
  methodology: "Sums the total supplies of Ondo's issued tokens.",
};

const config = {
  solana: {
    OUSG: "i7u4r16TcsJTgq1kAG8opmVZyVnAKBwLKu6ZPMwzxNc",
    USDY: "A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6",
  },
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
  sui: {
    USDY: ADDRESSES.sui.USDY,
  },
  aptos: {
    USDY: "0xcfea864b32833f157f042618bd845145256b1bf4c0da34a7013b76e42daa53cc",
  },
  noble: {
    USDY: ADDRESSES.noble.USDY,
  },
  arbitrum: {
    USDY: "0x35e050d3C0eC2d29D269a8EcEa763a183bDF9A9D",
  },
  ripple: {
     OUSG: "4F55534700000000000000000000000000000000.rHuiXXjHLpMP8ZE9sSQU5aADQVWDwv6h5p",
  },
  stellar: {
    USDY: "USDY-GAJMPX5NBOG6TQFPQGRABJEEB2YE7RFRLUKJDZAZGAD5GFX4J7TADAZ6",
  },
};

async function getUSDYTotalSupplySUI() {
  const USDY_TREASURY_CAP_OBJECT_ID =
    "0x9dca9f57a78fa7f132f95a0cf5c4d1b796836145ead7337da6b94012db62267a";
  let treasuryCapInfo = await sui.getObject(USDY_TREASURY_CAP_OBJECT_ID);
  return treasuryCapInfo.fields.total_supply.fields.value;
}

Object.keys(config).forEach((chain) => {
  let fundsMap = config[chain];
  const fundAddresses = Object.values(fundsMap);

  module.exports[chain] = {
    tvl: async (api) => {
      let supplies;
      if (chain === "solana") {
        supplies = await getTokenSupplies(fundAddresses)
        api.addTokens(Object.keys(supplies), Object.values(supplies));
      } else if (chain === "sui") {
        let usdySupply = await getUSDYTotalSupplySUI();
        api.addTokens(fundAddresses, [usdySupply]);
      } else if (chain === "aptos") {
        const {
          data: { supply, decimals },
        } = await aQuery(
          `/v1/accounts/${config.aptos.USDY}/resource/0x1::coin::CoinInfo<${config.aptos.USDY}::usdy::USDY>`
        );

        const aptosSupply =
          supply.vec[0].integer.vec[0].value / Math.pow(10, decimals);

        api.addTokens(ADDRESSES.aptos.USDY, aptosSupply * 1e6);
      } else if (chain === "noble") {
        const res = await get(`https://rest.cosmos.directory/noble/cosmos/bank/v1beta1/supply/by_denom?denom=ausdy`);
        api.addTokens(config.noble.USDY, parseInt(res.amount.amount));
      } else if (chain === "ripple") {
        const split = config.ripple.OUSG.split('.');
        const XRPL_OUSG_CURRENCY = split[0];
        const XRPL_OUSG_ISSUER = split[1];
        // XRPL RPCs automatically adjust for the currency's decimal places, but DefiLlama expects the raw value
        // so we convert to a raw balance by multiplying by 10^6
        const ousgSupply = (await getXrplTokenBalances(XRPL_OUSG_ISSUER, XRPL_OUSG_CURRENCY)) * Math.pow(10, 6);
        api.addTokens(config.ripple.OUSG, ousgSupply);
      } else if (chain === "stellar") {
        const [code, issuer] = config.stellar.USDY.split('-');
        const res = await get(`https://api.stellar.expert/explorer/public/asset/${code}-${issuer}`);

        api.addTokens(config.stellar.USDY, res.supply);
      } else {
        supplies = await api.multiCall({ abi: "erc20:totalSupply", calls: fundAddresses, })
        api.addTokens(fundAddresses, supplies);
      }
    },
  };
});
