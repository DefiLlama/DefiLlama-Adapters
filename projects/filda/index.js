const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const { compoundExportsWithDifferentBase, compoundExports, usdCompoundExports } = require('../helper/compound');

const comptroller = "0xb74633f2022452f377403B638167b0A135DB096d"

// ask comptroller for all markets array
async function getAllCTokens(block) {
  return (await sdk.api.abi.call({
    block,
    chain: 'heco',
    target: comptroller,
    params: [],
    abi: abi['getAllMarkets'],
  })).output;
}

async function getUnderlying(block, cToken) {
  if (cToken === '0x824151251B38056d54A15E56B73c54ba44811aF8') {
    return '0x6f259637dcd74c767781e37bc6133cd6a68aa161';//cHT => HT
  } else {
    const token = (await sdk.api.abi.call({
      block,
      chain: 'heco',
      target: cToken,
      abi: abi['underlying'],
    })).output;
    return token
  }
}

function transformAddress(token) {
  if (token === '0x6f259637dcd74c767781e37bc6133cd6a68aa161') {
    return token
  } else if (token === ADDRESSES.heco.DAI_HECO) {
    return ADDRESSES.ethereum.DAI;//DAI => DAI
  } else if (token === ADDRESSES.heco.USDC_HECO) {
    return ADDRESSES.ethereum.USDC;//USDC => USDC
  } else if (token === ADDRESSES.heco.TUSD) {
    return ADDRESSES.ethereum.TUSD //TUSD
  } else {
    return 'heco:' + token
  }
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(block) {
  let allCTokens = await getAllCTokens(block);
  const markets = []
  await (
    Promise.all(allCTokens.map(async (cToken) => {
      let underlying = await getUnderlying(block, cToken);
      markets.push({ underlying, cToken })
    }))
  );

  return markets;
}

const replacements = {
  "0xc2CB6B5357CcCE1B99Cd22232942D9A225Ea4eb1": {
    coingecko: "bitcoin-cash-sv",
    decimals: 1e18
  },
  //"heco:0x581EdD7eAb23896513360D7EE8DfE07A5Cad2aBd": "tether",
  "0x6514a5Ebff7944099591Ae3e8A5c0979C83B2571": {
    coingecko: "neo",
    decimals: 1e8
  },
  "0x45e97daD828AD735af1dF0473fc2735F0Fd5330c": {
    coingecko: "tezos",
    decimals: 1e18,
  }
}
function lending(borrowed) {
  return async (timestamp, ethBlock, {heco: block}) => {
    let balances = {};
    let markets = await getMarkets(block);

    let v2Locked = await sdk.api.abi.multiCall({
      block,
      calls: markets.map((market) => ({
        target: market.cToken,
      })),
      chain: 'heco',
      abi: borrowed ? abi.totalBorrows : abi['getCash'],
    });

    const symbols = await sdk.api.abi.multiCall({
      block,
      calls: markets.map((market) => ({
        target: market.cToken,
      })),
      chain: 'heco',
      abi: "erc20:symbol",
    });

    const lps = []
    markets.forEach((market, idx) => {
      let getCash = v2Locked.output.find((result) => result.input.target === market.cToken);
      const symbol = symbols.output.find((result) => result.input.target === market.cToken);
      if (getCash.output === null) {
        throw new Error("getCash failed")
      }
      if (symbol.output.endsWith("LP")) {
        lps.push({
          token: market.underlying,
          balance: getCash.output
        })
      } else {
        const replacement = replacements[market.underlying]
        if (replacement === undefined) {
          sdk.util.sumSingleBalance(balances, transformAddress(market.underlying), getCash.output)
        } else {
          sdk.util.sumSingleBalance(balances, replacement.coingecko, Number(getCash.output) / replacement.decimals)
        }
      }
    });

    await unwrapUniswapLPs(balances, lps, block, "heco", transformAddress)
    return balances;
  }
}

// DANGER!! Oracles are not priced against USD but against other base tokens, such as IOTX
module.exports = {
  timetravel: true, // Impossible because getBlock will rug tho
  heco: {
    tvl: lending(false),
    borrowed: lending(true)
  },
  iotex: compoundExportsWithDifferentBase("0x55E5F6E48FD4715e1c05b9dAfa5CfD0B387425Ee", "iotex", "iotex"),
  bsc: compoundExports("0xF0700A310Cb14615a67EEc1A8dAd5791859f65f1", "bsc"),
  rei: compoundExportsWithDifferentBase("0xEc1e6e331e990a0D8e40AC51f773e9c998ec7BC3", "rei", "rei-network"),
  polygon: compoundExports("0xfBE0f3A3d1405257Bd69691406Eafa73f5095723", "polygon"),
  arbitrum: compoundExports("0xF67EF5E77B350A81DcbA5430Bc8bE876eDa8D591", "arbitrum"),
  elastos: compoundExportsWithDifferentBase("0xE52792E024697A6be770e5d6F1C455550265B2CD", "elastos", "elastos"),
  kava: compoundExportsWithDifferentBase("0xD2CBE89a36df2546eebc71766264e0F306d38196", "kava", "kava"),
  bittorrent: compoundExportsWithDifferentBase("0xE52792E024697A6be770e5d6F1C455550265B2CD", "bittorrent", "bittorrent"),
  hallmarks: [
    [Math.floor(new Date('2023-04-24')/1e3), 'Protocol was hacked'],
  ],
};
