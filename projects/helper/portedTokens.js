const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const IOTEX_CG_MAPPING = require("./../xdollar-finance/iotex_cg_mapping.json")
const BigNumber = require("bignumber.js");

async function transformFantomAddress() {
  const multichainTokens = (
    await utils.fetchURL("https://netapi.anyswap.net/bridge/v2/info")
  ).data.bridgeList;

  const mapping = {
    "0xbf07093ccd6adfc3deb259c557b61e94c1f66945": "fantom:0xd6070ae98b8069de6b494332d1a1a81b6179d960",
    "0x1b156c5c75e9df4caab2a5cc5999ac58ff4f9090": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0xa48d959ae2e88f1daa7d5f611e01908106de7598": "fantom:0x841fad6eae12c286d1fd18d1d525dffa75c7effe",
    "0xd795d70ec3c7b990ffed7a725a18be5a9579c3b9": "avax:0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    "0xb6767518b205ea8b312d2ef4d992a2a08c2f2416": "avax:0xc7198437980c041c805a1edcba50c1ce5db95118",
    "0xaf9f33df60ca764307b17e62dde86e9f7090426c": "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
    "0x808d5f0a62336917da14fa9a10e9575b1040f71c": "avax:0x60781c2586d68229fde47564546784ab3faca982",
    "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0": "fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    "0x637ec617c86d24e421328e6caea1d92114892439": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8": "0x514910771af9ca656af840dff83e8264ecf986ca",
    "0x0a03d2c1cfca48075992d810cc69bd9fe026384a": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0x97927abfe1abbe5429cbe79260b290222fc9fbba": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "0x6dfe2aaea9daadadf0865b661b53040e842640f8": "0x514910771af9ca656af840dff83e8264ecf986ca",
    "0x920786cff2a6f601975874bb24c63f0115df7dc8": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0x49c68edb7aebd968f197121453e41b8704acde0c": "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "0x0665ef3556520b21368754fb644ed3ebf1993ad4": "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
    // update below to binspirit when it lists on coingecko
    "0x7345a537a975d9ca588ee631befddfef34fd5e8f": "fantom:0x5Cc61A78F164885776AA610fb0FE1257df78E59B",
    "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501": "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", // RenBTC
  }

  normalizeMapping(mapping)

  return (addr) => {
    addr = addr.toLowerCase()
    // WFTM && FTM
    if (
      compareAddresses(addr, "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83") ||
      compareAddresses(addr, "0x0000000000000000000000000000000000000000") ||
      compareAddresses(addr, "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
    ) {
      return "0x4e15361fd6b4bb609fa63c81a2be19d873717870";
    }
    if (compareAddresses(addr, "0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad")) {
      // fETH
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    }
    if (compareAddresses(addr, "0x82f0b8b456c1a451378467398982d4834b6829c1")) {
      // MIM
      return "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3";
    }
    if (compareAddresses(addr, "0x260b3e40c714ce8196465ec824cd8bb915081812")) {
      return "polygon:0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef"; // IRON ICE
    }
    const srcToken = multichainTokens.find(
      (token) => token.chainId === "250" && token.token === addr.toLowerCase()
    );
    if (srcToken !== undefined) {
      if (srcToken.srcChainId === "1") {
        return srcToken.srcToken;
      } else if (srcToken.srcChainId === "56") {
        if (srcToken.srcToken === "") {
          return "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
        }
        return `bsc:${srcToken.srcToken}`;
      }
    }
    return mapping[addr] || `fantom:${addr}`;
  };
}

function compareAddresses(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

async function transformAvaxAddress() {
  const [bridgeTokensOld, bridgeTokensNew, bridgeTokenDetails] =
    await Promise.all([
      utils.fetchURL(
        "https://raw.githubusercontent.com/0xngmi/bridge-tokens/main/data/penultimate.json"
      ),
      utils
        .fetchURL(
          "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/avalanche_contract_address.json"
        )
        .then((r) => Object.entries(r.data)),
      utils.fetchURL(
        "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/token_list.json"
      ),
    ]);
  return (addr) => {
    if (compareAddresses(addr, "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7")) {
      return "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
    }
    const srcToken = bridgeTokensOld.data.find((token) =>
      compareAddresses(token["Avalanche Token Address"], addr)
    );
    if (
      srcToken !== undefined &&
      srcToken["Ethereum Token Decimals"] ===
      srcToken["Avalanche Token Decimals"]
    ) {
      return srcToken["Ethereum Token Address"];
    }
    const newBridgeToken = bridgeTokensNew.find((token) =>
      compareAddresses(addr, token[1])
    );
    if (newBridgeToken !== undefined) {
      const tokenName = newBridgeToken[0].split(".")[0];
      const tokenData = bridgeTokenDetails.data[tokenName];
      if (tokenData !== undefined) {
        return tokenData.nativeContractAddress;
      }
    }
    const map = {
      "0xaf2c034c764d53005cc6cbc092518112cbd652bb": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33": "avax:0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd",
      "0x0000000000000000000000000000000000000000": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0xd45b7c061016102f9fa220502908f2c0f1add1d7": "0xffc97d72e13e01096502cb8eb52dee56f74dad7b",
      "0x46a51127c3ce23fb7ab1de06226147f446e4a857": "0xbcca60bb61934080951369a648fb03df4f96263c",
      "0x532e6537fea298397212f09a61e03311686f548e": "0x3ed3b47dd13ec9a98b44e6204a523e766b225811",
      "0xdfe521292ece2a4f44242efbcd66bc594ca9714b": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0x686bef2417b6dc32c50a3cbfbcc3bb60e1e9a15d": "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656",
      "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21": "0x030ba81f1c18d280636f32af80b9aad02cf0854e",
      "0x47afa96cdc9fab46904a55a6ad4bf6660b53c38a": "0x028171bca77440897b824ca71d1c56cac55b68a3",
      "0x574679ec54972cf6d705e0a71467bb5bb362919d": "avax:0x5817d4f0b62a59b17f75207da1848c2ce75e7af4",
      "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7": "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "0x2f28add68e59733d23d5f57d94c31fb965f835d0": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",// sUSDC(Avalanche) -> USDC(Ethereum)
      "0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd": "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // sBUSD(Avalanche) -> BUSD(BSC)
      "0xb0a8e082e5f8d2a04e74372c1be47737d85a0e73": "polygon:0xac63686230f64bdeaf086fe6764085453ab3023f", // USV
      "0x02bfd11499847003de5f0f5aa081c43854d48815": "0x7a5d3A9Dcd33cb8D527f7b5F96EB4Fef43d55636", // Radioshack
      "0xbf07093ccd6adfc3deb259c557b61e94c1f66945": "fantom:0xd6070ae98b8069de6b494332d1a1a81b6179d960",
      "0x1b156c5c75e9df4caab2a5cc5999ac58ff4f9090": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0xa48d959ae2e88f1daa7d5f611e01908106de7598": "fantom:0x841fad6eae12c286d1fd18d1d525dffa75c7effe",
      "0xd795d70ec3c7b990ffed7a725a18be5a9579c3b9": "avax:0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      "0xb6767518b205ea8b312d2ef4d992a2a08c2f2416": "avax:0xc7198437980c041c805a1edcba50c1ce5db95118",
      "0xaf9f33df60ca764307b17e62dde86e9f7090426c": "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
      "0x808d5f0a62336917da14fa9a10e9575b1040f71c": "avax:0x60781c2586d68229fde47564546784ab3faca982",
      "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0": "fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
      "0x637ec617c86d24e421328e6caea1d92114892439": "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8": "0x514910771af9ca656af840dff83e8264ecf986ca",
      "0x0a03d2c1cfca48075992d810cc69bd9fe026384a": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "0x97927abfe1abbe5429cbe79260b290222fc9fbba": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "0x6dfe2aaea9daadadf0865b661b53040e842640f8": "0x514910771af9ca656af840dff83e8264ecf986ca",
      "0x920786cff2a6f601975874bb24c63f0115df7dc8": "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0x49c68edb7aebd968f197121453e41b8704acde0c": "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      "0x0665ef3556520b21368754fb644ed3ebf1993ad4": "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
      // update below to binspirit when it lists on coingecko
      "0x7345a537a975d9ca588ee631befddfef34fd5e8f": "fantom:0x5Cc61A78F164885776AA610fb0FE1257df78E59B",
    }
    return map[addr.toLowerCase()] || `avax:${addr}`
  }
}

async function transformBscAddress() {
  const binanceBridge = (
    await utils.fetchURL(
      "https://api.binance.org/bridge/api/v2/tokens?walletNetwork="
    )
  ).data.data.tokens;

  const mapping = {
    '0x0000000000000000000000000000000000000000': 'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BNB -> WBNB
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BNB -> WBNB
    '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c',  // ELK
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',  // WETH
    '0xa35d95872d8eb056eb2cbd67d25124a6add7455e': '0x123',  // 2030FLOKI returns nonsense TVL
    '0x0cf8e180350253271f4b917ccfb0accc4862f262': '0x123',  // BTCBR returns nonsense TVL
    '0x6ded0f2c886568fb4bb6f04f179093d3d167c9d7': '0x09ce2b746c32528b7d864a1e3979bd97d2f095ab',  // DFL
    '0x2f28add68e59733d23d5f57d94c31fb965f835d0': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',  // sUSDC(BSC) -> USDC(Ethereum)
    '0xaf6162dc717cfc8818efc8d6f46a41cf7042fcba': 'polygon:0xac63686230f64bdeaf086fe6764085453ab3023f',  // USV Token
    '0x30807d3b851a31d62415b8bb7af7dca59390434a': '0x7a5d3A9Dcd33cb8D527f7b5F96EB4Fef43d55636',  // Radio Token
    '0xce86f7fcd3b40791f63b86c3ea3b8b355ce2685b': '0xb4d930279552397bba2ee473229f89ec245bc365',  // MahaDao
    '0xbb9858603b1fb9375f6df972650343e985186ac5': 'bsc:0xc087c78abac4a0e900a327444193dbf9ba69058e',  // Treat staked  BUSD-USDC Staked APE-LP as LP Token
    '0xc5fb6476a6518dd35687e0ad2670cb8ab5a0d4c5': 'bsc:0x2e707261d086687470b515b320478eb1c88d49bb',  // Treat staked  BUSD-USDT Staked APE-LP as LP Token
  }

  return (addr) => {
    addr = addr.toLowerCase()
    const srcToken = binanceBridge.find(
      (token) =>
        token.ethContractAddress !== "" &&
        token.bscContractAddress.toLowerCase() === addr
    );
    if (srcToken && srcToken.bscContractDecimal === srcToken.ethContractDecimal) {
      return srcToken.ethContractAddress;
    }

    return mapping[addr] || `bsc:${addr}`;
  };
}

const PoSMappedTokenList =
  "https://api.bridge.matic.network/api/tokens/pos/erc20";
const PlasmaMappedTokenList =
  "https://api.bridge.matic.network/api/tokens/plasma/erc20";

async function transformPolygonAddress() {
  const posTokens = await utils.fetchURL(PoSMappedTokenList);
  const plasmaTokens = await utils.fetchURL(PlasmaMappedTokenList);
  const tokens = posTokens.data.tokens
    .concat(plasmaTokens.data.tokens)
    .reduce((tokenMap, token) => {
      tokenMap[token.childToken.toLowerCase()] = token.rootToken.toLowerCase();
      return tokenMap;
    }, {});
  const mapping = {
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',  // 
    '0x0000000000000000000000000000000000000000': '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',  // 
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': '0x0000000000000000000000000000000000000000',  // 
    '0x2f28add68e59733d23d5f57d94c31fb965f835d0': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',  // sUSDC(Polygon) -> USDC(Ethereum)
    '0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',  // sBUSD(Polygon) -> BUSD(BSC)
    '0x8eb3771a43a8c45aabe6d61ed709ece652281dc9': 'avax:0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',  // sUSDC.e(Polygon) -> USDC.e(Avalanche)
    '0x613a489785c95afeb3b404cc41565ccff107b6e0': '0x7a5d3A9Dcd33cb8D527f7b5F96EB4Fef43d55636',  // radioshack
  }

  return (addr) => {
    addr = addr.toLowerCase()
    return mapping[addr] || tokens[addr] || `polygon:${addr}`;
  };
}

async function transformXdaiAddress() {
  const mapping = {
    '0x0000000000000000000000000000000000000000': '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x44fa8e6f47987339850636f88629646662444217': '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d': '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x4537e328bf7e4efa29d05caea260d7fe26af9d74': '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0x4ecaba5870353805a9f068101a40e0f32ed605c6': '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x7122d7661c4564b7c6cd4878b06766489a6028a2': '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    // '0x29414ec76d79ff238e5e773322799d1c7ca2443f': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // Boring oBTC
  }

  normalizeMapping(mapping)

  return (address) => {
    address = address.toLowerCase()
    if (!mapping[address]) {
      console.log('Xdai mapping not found for %s', address)
      return address
    }

    return mapping[address]
  };
}

async function transformOkexAddress() {
  const okexBridge = (
    await utils.fetchURL(
      "https://www.okex.com/v2/asset/cross-chain/currencyAddress"
    )
  ).data.data.tokens;
  // TODO
  return (addr) => {
    if (compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")) {
      return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c";
    }
    // Native token -> OKB
    if (compareAddresses(addr, "0x0000000000000000000000000000000000000000")) {
      return "0x75231f58b43240c9718dd58b4967c5114342a86c";
    }
    return `okexchain:${addr}`;
  };
}

async function transformHecoAddress() {
  return (addr) => {
    if (addr.toLowerCase() == "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c") {
      return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c";
    }
    if (addr.toLowerCase() == "0x0000000000000000000000000000000000000000" || addr.toLowerCase() == "0xhecozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz") {
      return "0x6f259637dcd74c767781e37bc6133cd6a68aa161";
    }
    return `heco:${addr}`;
  };
}

async function transformHooAddress() {
  const mapping = {
    '0xd16babe52980554520f6da505df4d1b124c815a7': '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x3eff9d389d13d6352bfb498bcf616ef9b1beac87': '0x6f259637dcd74c767781e37bc6133cd6a68aa161', // wHOO
  }
  normalizeMapping(mapping)

  return (addr) => {
    addr = addr.toLowerCase()
    return mapping[addr] || `hoo:${addr}`;
  };
}


async function transformCeloAddress() {
  return (addr) => {
    if (addr.toLowerCase() === "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73") {
      //return "0xd71ecff9342a5ced620049e616c5035f1db98620" //sEUR
      return "celo-euro";
    }
    if (addr.toLowerCase() === "0x765de816845861e75a25fca122bb6898b8b1282a") {
      //return "0x8e870d67f660d95d5be530380d0ec0bd388289e1" //USDP
      return "celo-dollar";
    }
    if (addr.toLowerCase() === "0x471ece3750da237f93b8e339c536989b8978a438") {
      return "celo"; //CELO
    }
    return `celo:${addr}`;
  };
}

async function transformHarmonyAddress() {
  const bridge = (
    await utils.fetchURL("https://be4.bridge.hmny.io/tokens/?page=0&size=1000")
  ).data.content;

  return (addr) => {
    if (compareAddresses(addr, "0x6983D1E6DEf3690C4d616b13597A09e6193EA013")) {
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    }
    if (compareAddresses(addr, "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a")) {
      return "harmony:0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a";
    }
    if (compareAddresses(addr, "0x224e64ec1bdce3870a6a6c777edd450454068fec")) {
      return "0xa47c8bf37f92abed4a126bda807a7b7498661acd";
    }
    if (compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")) {
      return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c";
    }
    if (compareAddresses(addr, "0xd754ae7bb55feb0c4ba6bc037b4a140f14ebe018")) {
      return "bsc:0x19e6bfc1a6e4b042fb20531244d47e252445df01";
    }
    const srcToken = bridge.find((token) =>
      compareAddresses(addr, token.hrc20Address)
    );
    if (srcToken !== undefined) {
      const prefix = srcToken.network === "BINANCE" ? "bsc:" : "";
      return prefix + srcToken.erc20Address;
    }
    return `harmony:${addr}`;
  };
}

const optimismSynths = {
  "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9":
    "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
  "0xc5db22719a06418028a40a9b5e9a7c02959d0d08":
    "0xbbc455cb4f1b9e4bfc4b73970d360c8f032efee6",
  "0xe405de8f52ba7559f9df3c368500b6e6ae6cee49":
    "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb",
  "0x298b9b95708152ff6968aafd889c6586e9169f1d":
    "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6",
};

async function transformOptimismAddress() {
  const bridge = (
    await utils.fetchURL("https://static.optimism.io/optimism.tokenlist.json")
  ).data.tokens;

  return (addr) => {
    if (compareAddresses(addr, "0x4200000000000000000000000000000000000006")) {
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    }
    if (compareAddresses(addr, "0x5029c236320b8f15ef0a657054b84d90bfbeded3")) {
      return "0x15ee120fd69bec86c1d38502299af7366a41d1a6";
    }
    // OETH -> WETH
    if (compareAddresses(addr, "0x0000000000000000000000000000000000000000")) {
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    }
    const possibleSynth = optimismSynths[addr.toLowerCase()];
    if (possibleSynth !== undefined) {
      return possibleSynth;
    }
    const dstToken = bridge.find(
      (token) => compareAddresses(addr, token.address) && token.chainId === 10
    );
    if (dstToken !== undefined) {
      const srcToken = bridge.find(
        (token) => dstToken.logoURI === token.logoURI && token.chainId === 1
      );
      if (srcToken !== undefined) {
        return srcToken.address;
      }
    }
    return addr; //`optimism:${addr}` // TODO: Fix
  };
}

async function transformMoonriverAddress() {
  return (addr) => {
    if (compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")) {
      return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c";
    }
    if (compareAddresses(addr, "0x0000000000000000000000000000000000000000")) {
      return "moonriver:0x98878B06940aE243284CA214f92Bb71a2b032B8A";
    }
    return `moonriver:${addr}`; //`optimism:${addr}` // TODO: Fix
  };
}

async function transformMoonbeamAddress() {
  return (addr) => {
    if (compareAddresses(addr, "0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9")) { //usdc
      return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    }
    if (compareAddresses(addr, "0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594")) { //usdt
      return "0xdac17f958d2ee523a2206206994597c13d831ec7";
    }
    if (compareAddresses(addr, "0x30D2a9F5FDf90ACe8c17952cbb4eE48a55D916A7")) { //eth
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    }
    if (compareAddresses(addr, "0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0")) { // wtbc
      return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
    }
    if (compareAddresses(addr, "0xc234A67a4F840E61adE794be47de455361b52413")) { // dai
      return "0x6b175474e89094c44da98b954eedeac495271d0f";
    }
    if (compareAddresses(addr, "0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E")) { //movr
      return "moonriver:0x98878b06940ae243284ca214f92bb71a2b032b8a";
    }
    // if (compareAddresses(addr, "0x0000000000000000000000000000000000000802")) { //GLMR
    //    return "moonbeam";
    // }
    return `moonbeam:${addr}`; //`optimism:${addr}` // TODO: Fix
  };
}

async function transformArbitrumAddress() {
  const bridge = (
    await utils.fetchURL("https://bridge.arbitrum.io/token-list-42161.json")
  ).data.tokens;
  const mapping = {
    '0x0000000000000000000000000000000000000000': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',  // WETH
    '0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A': '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3',  // MIM
    '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501': '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',  // renBTC
    '0x9ef758ac000a354479e538b8b2f01b917b8e89e7': 'polygon:0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea',  // XDO
    '0x31635A2a3892dAeC7C399102676E344F55d20Da7': '0x09ce2b746c32528b7d864a1e3979bd97d2f095ab',  //  DeFIL
  }

  normalizeMapping(mapping)

  return (addr) => {

    addr = addr.toLowerCase()
    if (mapping[addr]) return mapping[addr]
    const dstToken = bridge.find((token) => compareAddresses(addr, token.address));
    if (dstToken !== undefined) {
      return dstToken.extensions.bridgeInfo[1].tokenAddress;
    }
    return `arbitrum:${addr}`;
  };
}

function fixAvaxBalances(balances) {
  for (const representation of [
    "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0x9dEbca6eA3af87Bf422Cea9ac955618ceb56EfB4",
  ]) {
    if (balances[representation] !== undefined) {
      balances["avalanche-2"] = Number(balances[representation]) / 1e18;
      delete balances[representation];
    }
  }
}

function fixHarmonyBalances(balances) {
  for (const representation of [
    "harmony:0xcf664087a5bb0237a0bad6742852ec6c8d69a27a",
    "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a",
    "harmony:0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a",
    "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a",
    "bsc:0xdE976f3344cd9F06E451aF3A94a324afC3E154F4",
    "bsc:0xde976f3344cd9f06e451af3a94a324afc3e154f4",
  ]) {
    if (balances[representation] !== undefined) {
      sdk.util.sumSingleBalance(balances, 'harmony', Number(balances[representation]) / 1e18)
      delete balances[representation];
    }
  }
}

function transformOasisAddressBase(addr) {
  const map = {
    '0x21c718c22d52d0f3a789b752d4c2fd5908a8a733': 'oasis-network',
    '0x3223f17957ba502cbe71401d55a0db26e5f7c68f': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',  //WETH
    '0xe8a638b3b7565ee7c5eb9755e58552afc87b94dd': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e': '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x6cb9750a92643382e020ea9a170abb83df05f30b': '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0xdc19a122e268128b5ee20366299fc7b5b199c8e3': '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT wormhole
    '0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC celer
    '0x94fbffe5698db6f54d6ca524dbe673a7729014be': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',  // USDC
    //'0x21c718c22d52d0f3a789b752d4c2fd5908a8a733': 'wrapped-rose',
  }
  return map[addr.toLowerCase()] || `${addr}`
}

async function transformOasisAddress() {
  return transformOasisAddressBase
}

function fixOasisBalances(balances) {
  ['oasis-network', 'wrapped-rose'].forEach(key => {
    if (balances[key])
      balances[key] = balances[key] / 10 ** 18;
  })
}
async function transformIotexAddress() {
  return (addr) => {
    const dstToken = Object.keys(IOTEX_CG_MAPPING).find(token => compareAddresses(addr, token))
    if (dstToken !== undefined) {
      return IOTEX_CG_MAPPING[dstToken].contract || IOTEX_CG_MAPPING[dstToken].coingeckoId
    }
    return `iotex:${addr}`;
  };
}

async function transformKccAddress() {
  return (addr) => {
    if (compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")) {
      return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c";
    }
    if (
      compareAddresses(
        addr.toLowerCase(),
        "0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48"
      )
    ) {
      return "0xdac17f958d2ee523a2206206994597c13d831ec7";
    }
    if (compareAddresses(addr, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")) {
      return "okexchain:0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85";
    }
    if (compareAddresses(addr, "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c")) {
      return "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    }
    if (compareAddresses(addr, "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d")) {
      return "0x4fabb145d64652a948d72533023f6e7a623c7c53";
    }
    if (compareAddresses(addr, "0xc9baa8cfdde8e328787e29b4b078abf2dadc2055")) {
      return "0x6b175474e89094c44da98b954eedeac495271d0f";
    }
    if (compareAddresses(addr, "0x218c3c3d49d0e7b37aff0d8bb079de36ae61a4c0")) {
      return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
    }
    if (compareAddresses(addr, "0xf55af137a98607f7ed2efefa4cd2dfe70e4253b1")) {
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    }
    if (compareAddresses(addr, "0x980a5afef3d17ad98635f6c5aebcbaeded3c3430")) {
      return "okexchain:0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85";
    }
    return `kcc:${addr}`;
  };
}


function transformMetisAddress() {
  const map = {
    "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000": "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e",
    "0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "0x420000000000000000000000000000000000000a": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0x5801d0e1c7d977d78e4890880b8e579eb4943276": "bsc:0x5801d0e1c7d977d78e4890880b8e579eb4943276",
    "0xea32a96608495e54156ae48931a7c20f0dcc1a21": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0x2692be44a6e38b698731fddf417d060f0d20a0cb": "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
  }
  return (addr) => {
    if (compareAddresses(addr, "0xa5B55ab1dAF0F8e1EFc0eB1931a957fd89B918f4")) {
      return "avax:0x50b7545627a5162F82A992c33b87aDc75187B218";
    }
    if (compareAddresses(addr, "0xE253E0CeA0CDD43d9628567d097052B33F98D611")) {
      return "avax:0xE253E0CeA0CDD43d9628567d097052B33F98D611";
    }

    if (compareAddresses(addr, "0x4651B38e7ec14BB3db731369BFE5B08F2466Bd0A")) {
      return "bsc:0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
    }

    if (compareAddresses(addr, "0xfe282Af5f9eB59C30A3f78789EEfFA704188bdD4")) {
      return "metis:0xfe282Af5f9eB59C30A3f78789EEfFA704188bdD4";
    }

    if (compareAddresses(addr, "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8")) {
      return "bsc:0xad29abb318791d579433d831ed122afeaf29dcfe";
    }

    if (compareAddresses(addr, "0x4b9D2923D875edF43980BF5dddDEde3Fb20fC742")) {
      return "bsc:0xcc42724c6683b7e57334c4e856f4c9965ed682bd";
    }

    return map[addr.toLowerCase()] || `metis:${addr}`
  };
}

function transformBobaAddress() {
  const map = {
    "0x0000000000000000000000000000000000000000": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0x66a2a913e447d6b4bf33efbec43aaef87890fbbc": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0x5de1677344d3cb0d7d465c10b72a8f60699c062d": "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0xf74195bb8a5cf652411867c5c2c5b8c2a402be35": "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    "0x461d52769884ca6235B685EF2040F47d30C94EB5": "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
    "0xdc0486f8bf31df57a952bcd3c1d3e166e3d9ec8b": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    "0xa18bf3994c0cc6e3b63ac420308e5383f53120d7": "0x42bbfa2e77757c645eeaad1655e0911a7553efbc", // BOBA
    "0xe1e2ec9a85c607092668789581251115bcbd20de": "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07", // OMG
    "0x7562f525106f5d54e891e005867bf489b5988cd9": "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
    "0x2f28add68e59733d23d5f57d94c31fb965f835d0": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // sUSDC(Boba) -> USDC(Ethereum)
    "0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd": "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // sBUSD(Boba) -> BUSD(BSC)
  }

  normalizeMapping(map)

  return (addr) => {
    return map[addr.toLowerCase()] || `boba:${addr}`
  }
}

function transformNearAddress() {
  return (addr) => {
    const bridgedAssetIdentifier = '.factory.bridge.near'
    if (addr.endsWith(bridgedAssetIdentifier))
      return `0x${addr.slice(0, addr.length - bridgedAssetIdentifier.length)}`

    return addr
  }
}

async function transformKlaytnAddress() {
  const mapping = {
    '0x5388ce775de8f7a69d17fd5caa9f7dbfee65dfce': '0x4576E6825B462b6916D2a41E187626E9090A92c6', // Donkey
    '0x9eaefb09fe4aabfbe6b1ca316a3c36afc83a393f': 'ripple', // XRP
    '0x02cbe46fb8a1f579254a9b485788f2d86cad51aa': '0x26fb86579e371c7aedc461b2ddef0a8628c93d3b', // bora
    '0x5c74070fdea071359b86082bd9f9b3deaafbe32b': '0x6b175474e89094c44da98b954eedeac495271d0f', // dai
    '0x754288077d0ff82af7a5317c7cb8c444d421d103': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0x0268dbed3832b87582b1fa508acf5958cbb1cd74': 'bsc:0xf258f061ae2d68d023ea6e7cceef97962785c6c1', // IJM
    '0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167': '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x168439b5eebe8c83db9eef44a0d76c6f54767ae4': '0x6b175474e89094c44da98b954eedeac495271d0f', // pUSD
    '0x4fa62f1f404188ce860c8f0041d6ac3765a72e67': '0x6b175474e89094c44da98b954eedeac495271d0f', // KSD
    '0xce40569d65106c32550626822b91565643c07823': '0x6b175474e89094c44da98b954eedeac495271d0f', // KASH
    '0x210bc03f49052169d5588a52c317f71cf2078b85': 'bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56', // kBUSD
    '0x16d0e1fbd024c600ca0380a4c5d57ee7a2ecbf9c': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
    '0x34d21b1e550d73cee41151c77f3c73359527a396': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    '0x0000000000000000000000000000000000000000': 'klay-token', // Klaytn
  }

  return addr => {
    addr = addr.toLowerCase()
    return mapping[addr] || `klaytn:${addr}`
  }
}

function fixKlaytnBalances(balances) {
  const mapping = {
    '0xd7a4d10070a4f7bc2a015e78244ea137398c3b74': { coingeckoId: 'klay-token', decimals: 18, }, // Wrapped KLAY
  }
  return fixBalances(balances, mapping)
}

function transformVelasAddress() {
  return (addr) => {
    const map = {
      "0x85219708c49aa701871ad330a94ea0f41dff24ca": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
      "0xe2c120f188ebd5389f71cf4d9c16d05b62a58993": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0x01445c31581c354b7338ac35693ab2001b50b9ae": "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
      "0xc111c29a988ae0c0087d97b33c6e6766808a3bd3": "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
      "0x300a8be53b4b5557f48620d578e7461e3b927dd0": "0xf56842af3b56fd72d17cb103f92d027bba912e89", // BAMBOO
    }
    return map[addr.toLowerCase()] || `velas:${addr}`
  }
}

async function transformCronosAddress() {
  const mapping = {
    '0xbed48612bc69fa1cab67052b42a95fb30c1bcfee': 'shiba-inu',
    '0x1a8e39ae59e5556b56b76fcba98d22c9ae557396': 'dogecoin',
    '0xb888d8dd1733d72681b30c00ee76bde93ae7aa93': 'cosmos',
    '0x02dccaf514c98451320a9365c5b46c61d3246ff3': 'dogelon-mars',
  }
  return (addr) => mapping[addr.toLowerCase()] || `cronos:${addr.toLowerCase()}`
}

function fixShidenBalances(balances) {
  const mapping = {
    '0x765277EebeCA2e31912C9946eAe1021199B39C61': { coingeckoId: 'ethereum', decimals: 18, },
    '0x332730a4f6e03d9c55829435f10360e13cfa41ff': { coingeckoId: 'binancecoin', decimals: 18, },
    '0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a': { coingeckoId: 'binance-usd', decimals: 18, },
    '0x722377a047e89ca735f09eb7cccab780943c4cb4': { coingeckoId: 'standard-protocol', decimals: 18, },
  }

  return fixBalances(balances, mapping, { removeUnmapped: true })
}

function fixAstarBalances(balances) {
  const mapping = {
    '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283': { coingeckoId: 'tether', decimals: 6, },
    '0x19574c3c8fafc875051b665ec131b7e60773d2c9': { coingeckoId: 'astar', decimals: 18, },
    '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720': { coingeckoId: 'astar', decimals: 18, },
    '0xb361DAD0Cc1a03404b650A69d9a5ADB5aF8A531F': { coingeckoId: 'emiswap', decimals: 18, },
    '0xC404E12D3466acCB625c67dbAb2E1a8a457DEf3c': { coingeckoId: 'usd-coin', decimals: 6, },  // interest bearing USDC
    '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98': { coingeckoId: 'usd-coin', decimals: 6, },
  }

  return fixBalances(balances, mapping)
}

function fixHPBBalances(balances) {
  const mapping = {
    '0xBE05Ac1FB417c9EA435b37a9Cecd39Bc70359d31': { coingeckoId: 'high-performance-blockchain', decimals: 18, },
  }

  return fixBalances(balances, mapping, { removeUnmapped: true })
}

async function transformAstarAddress() {
  return (addr) => addr // we use fix balances instead
}

function fixCronosBalances(balances) {
  const tokenDecimals = {
    'shiba-inu': 18,//SHIBA
    'dogecoin': 8,//DOGE
    'cosmos': 6,//ATOM
    'dogelon-mars': 18//ELON
  }
  Object.keys(tokenDecimals).forEach(key => {
    if (balances[key])
      balances[key] = BigNumber(balances[key]).div(10 ** tokenDecimals[key]).toFixed(0)
  })
}

async function transformDfkAddress() {
  const mapping = {
    '0xb57b60debdb0b8172bb6316a9164bd3c695f133a': 'avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // AVAX
    '0x3ad9dfe640e1a9cc1d9b0948620820d975c3803a': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  }
  return (addr) => mapping[addr.toLowerCase()] || `dfk:${addr.toLowerCase()}`
}

function fixGodwokenBalances(balances) {
  const mapping = {
    '0xC3b946c53E2e62200515d284249f2a91d9DF7954': { coingeckoId: 'usd-coin', decimals: 6, },  // Wrapped USDC (ForceBridge from Ethereum)
    '0xA21B19d660917C1DE263Ad040Ba552737cfcEf50': { coingeckoId: 'usd-coin', decimals: 18, },  // Wrapped USDC (ForceBridge from BSC)
    '0x07a388453944bB54BE709AE505F14aEb5d5cbB2C': { coingeckoId: 'tether', decimals: 6, },  // Wrapped USDT (ForceBridge from Ethereum)
    '0x5C30d9396a97f2279737E63B2bf64CC823046591': { coingeckoId: 'tether', decimals: 18, },  // Wrapped USDT (ForceBridge from BSC)
    '0x7818FA4C71dC3b60049FB0b6066f18ff8c720f33': { coingeckoId: 'bitcoin', decimals: 8, },  // Wrapped BTC (ForceBridge from Ethereum)
    '0x3f8d2b24C6fa7b190f368C3701FfCb2bd919Af37': { coingeckoId: 'bitcoin', decimals: 18, },  // Wrapped BTC (ForceBridge from BSC)
  }

  return fixBalances(balances, mapping)
}


const wavesMapping = {
  '5UYBPpq4WoU5n4MwpFkgJnW3Fq4B1u3ukpK33ik4QerR': { coingeckoId: 'binancecoin', decimals: 8, },
  'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p': { coingeckoId: 'neutrino', decimals: 6, },
  'Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on': { coingeckoId: 'waves-exchange', decimals: 8, },
  '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu': { coingeckoId: 'ethereum', decimals: 8, },
  '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ': { coingeckoId: 'tether', decimals: 6, },
  '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS': { coingeckoId: 'bitcoin', decimals: 8, },
  'WAVES': { coingeckoId: 'waves', decimals: 8, },
  '2Fh9m3dNQXycHdnytEaETN3P1gDT7ij5U4HjMqQBeaqN': { coingeckoId: 'ftx-token', decimals: 8, },
  '4GZH8rk5vDmMXJ81Xqfm3ovFaczqMnQ11r7aELiNxWBV': { coingeckoId: 'fantom', decimals: 8, },
  '3KhNcHo4We1G5EWps7b1e5DTdLgWDzctc8S6ynu37KAb': { coingeckoId: 'curve-dao-token', decimals: 8, },
  'GVxGPBtgVWMW1wHiFnfaCakbJ6sKgZgowJgW5Dqrd7JH': { coingeckoId: 'shiba-inu', decimals: 2, },
  'HcHacFH51pY91zjJa3ZiUVWBww54LnsL4EP3s7hVGo9L': { coingeckoId: 'matic-network', decimals: 8, },
  '4YmM7mj3Av4DPvpNpbtK4jHbpzYDcZuY6UUnYpqTbzLj': { coingeckoId: 'uniswap', decimals: 8, },
  '6QUVF8nVVVvM7do7JT2eJ5o5ehnZgXUg13ysiB9JiQrZ': { coingeckoId: 'terra-luna', decimals: 8, },
  '7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt': { coingeckoId: 'aave', decimals: 8, },
  'E4rss7qLUcawCvD2uMrbLeTMPGkX15kS3okWCbUhLNKL': { coingeckoId: 'maker', decimals: 8, },
  'HLckRcg7hJ3Syf3PrGftFijKqQMJipf81WY3fwvHCJbe': { coingeckoId: 'crypto-com-chain', decimals: 8, },
  '8zUYbdB8Q6mDhpcXYv52ji8ycfj4SDX4gJXS7YY3dA4R': { coingeckoId: 'dai', decimals: 6, },
  '8DLiYZjo3UUaRBTHU7Ayoqg4ihwb6YH1AfXrrhdjQ7K1': { coingeckoId: 'binance-usd', decimals: 6, },
  '47cyc68FWJszCWEwMWVsD9CadjS2M1XtgANuRGbEW8UH': { coingeckoId: 'cosmos', decimals: 8, },
  '2bbGhKo5C31iEiB4CwGuqMYwjD7gCA9eXmm51fe2v8vT': { coingeckoId: 'chainlink', decimals: 8, },
  'BLRxWVJWaVuR2CsCoTvTw2bDZ3sQLeTbCofcJv7dP5J4': { coingeckoId: 'yearn-finance', decimals: 8, },
  'A1uMqYTzBdakuSNDv7CruWXP8mRZ4EkHwmip2RCauyZH': { coingeckoId: 'the-graph', decimals: 8, },
  '2thtesXvnVMcCnih9iZbJL3d2NQZMfzENJo8YFj6r5jU': { coingeckoId: 'terrausd', decimals: 6, },
  '2GBgdhqMjUPqreqPziXvZFSmDiQVrxNuGxR1z7ZVsm4Z': { coingeckoId: 'apecoin', decimals: 8, },
  'Aug9ccbPApb1hxXSue8fHuvbyMf1FV1BYBtLUuS5LZnU': { coingeckoId: 'decentraland', decimals: 8, },
  'ATQdLbehsMrmHZLNFhUm1r6s14NBT5JCFcSJGpaMrkAr': { coingeckoId: 'axie-infinity', decimals: 8, },
  '8YyrMfuBdZ5gtMWkynLTveRvGb6LJ4Aff9rpz46UUMW': { coingeckoId: 'the-sandbox', decimals: 8, },
  'EfwRV6MuUCGgAUchdsF4dDFnSpKrDW3UYshdaDy4VBeB': { coingeckoId: 'enjincoin', decimals: 8, },
  '5zoDNRdwVXwe7DveruJGxuJnqo7SYhveDeKb8ggAuC34': { coingeckoId: 'wrapped-bitcoin', decimals: 8, },
  'DSbbhLsSTeDg5Lsiufk2Aneh3DjVqJuPr2M9uU1gwy5p': { coingeckoId: 'vires-finance', decimals: 8, },
  // 'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS': { coingeckoId: 'duck-egg', decimals: 8, },  // fix this with right coin gecko id
  '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8': { coingeckoId: 'waves-enterprise', decimals: 8, },
  // 'HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS': { coingeckoId: 'puzzle', decimals: 8, },  // fix this with right coin gecko id
  // 'D4TPjtzpsDEJFS1pUAkvh1tJJJMNWGcSrds9sveBoQka': { coingeckoId: 'race', decimals: 8, },
  // '3UHgFQECoynwC3iunYBnbhzmcCzC5gVnVZMv8Yw1bneK': { coingeckoId: 'east', decimals: 8, },
  '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g': { coingeckoId: 'neutrino-system-base-token', decimals: 8, },
  // 'DUk2YTxhRoAqMJLus4G2b3fR8hMHVh6eiyFx5r29VR6t': { coingeckoId: 'neutrino eur', decimals: 8, },
  'Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT': { coingeckoId: 'swop', decimals: 6, },
  '7LMV3s1J4dKpMQZqge5sKYoFkZRLojnnU49aerqos4yg': { coingeckoId: 'enno-cash', decimals: 8, },
  '9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y': { coingeckoId: 'signaturechain', decimals: 8, },
  'DHgwrRvVyqJsepd32YbBqUeDH4GJ1N984X8QoekjgH8J': { coingeckoId: 'waves-community-token', decimals: 2, },
  // 'AbunLGErT5ctzVN8MVjb4Ad9YgjpubB8Hqb17VxzfAck': { coingeckoId: 'Waves World', decimals: 0, },
  'HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk': { coingeckoId: 'litecoin', decimals: 8, },
  '6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ': { coingeckoId: 'usd-coin', decimals: 6, },
}

function fixWavesBalances(balances) {
  return fixBalances(balances, wavesMapping)
}

function fixTezosBalances(balances) {
  const mapping = {
    'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn': { coingeckoId: 'tzbtc', decimals: 8, },
    'tezos': { coingeckoId: 'tezos', decimals: 0, },
    'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-19': { coingeckoId: 'wrapped-bitcoin', decimals: 8, },
    'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-17': { coingeckoId: 'usd-coin', decimals: 6, },
    'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV': { coingeckoId: 'kolibri-usd', decimals: 18, },
    'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9': { coingeckoId: 'usdtez', decimals: 6, },
    'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW': { coingeckoId: 'youves-uusd', decimals: 12, },
    // 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-1': { coingeckoId: 'youves-you-defi', decimals: 12, },  //uDEFI token - update gecko id here after adding in coin geckp
    'KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL': { coingeckoId: 'youves-you-governance', decimals: 12, },
    'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-2': { coingeckoId: 'wrapped-bitcoin', decimals: 12, }, // youves BTC
  }

  return fixBalances(balances, mapping)
}

const songbirdFixMapping = {
  '0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED': { coingeckoId: 'songbird', decimals: 18, },
  '0xC348F894d0E939FE72c467156E6d7DcbD6f16e21': { coingeckoId: 'flare-finance', decimals: 18, },
  '0x70Ad7172EF0b131A1428D0c1F66457EB041f2176': { coingeckoId: 'usd-coin', decimals: 18, },
}

const energywebFixMapping = {
  '0x6b3bd0478DF0eC4984b168Db0E12A539Cc0c83cd': { coingeckoId: 'energy-web-token', decimals: 18, },
}

function normalizeMapping(mapping) {
  Object.keys(mapping).forEach(key => mapping[key.toLowerCase()] = mapping[key])
}

function fixBalances(balances, mapping, { removeUnmapped = false } = {}) {
  normalizeMapping(mapping)

  Object.keys(balances).forEach(token => {
    const tokenKey = stripTokenHeader(token).toLowerCase()
    const { coingeckoId, decimals } = mapping[tokenKey] || {}
    if (!coingeckoId) {
      if (removeUnmapped) {
        console.log(`Removing token from balances, it is not part of whitelist: ${tokenKey}`)
        delete balances[token]
      }
      return;
    }
    const currentBalance = balances[token]
    delete balances[token]
    sdk.util.sumSingleBalance(balances, coingeckoId, +BigNumber(currentBalance).shiftedBy(-1 * decimals))
  })

  return balances
}

function stripTokenHeader(token) {
  token = token.toLowerCase()
  return token.indexOf(':') > -1 ? token.split(':')[1] : token
}

async function getFixBalances(chain) {
  const dummyFn = i => i
  return fixBalancesMapping[chain] || dummyFn
}

const fixBalancesMapping = {
  avax: fixAvaxBalances,
  astar: fixAstarBalances,
  shiden: fixShidenBalances,
  cronos: fixCronosBalances,
  tezos: fixTezosBalances,
  harmony: fixHarmonyBalances,
  hpb: fixHPBBalances,
  godwoken: fixGodwokenBalances,
  klaytn: fixKlaytnBalances,
  waves: fixWavesBalances,
  songbird: b => fixBalances(b, songbirdFixMapping, { removeUnmapped: true }),
  energyweb: b => fixBalances(b, energywebFixMapping, { removeUnmapped: true }),
  oasis: fixOasisBalances,
}

const chainTransforms = {
  astar: transformAstarAddress,
  celo: transformCeloAddress,
  cronos: transformCronosAddress,
  fantom: transformFantomAddress,
  bsc: transformBscAddress,
  boba: transformBobaAddress,
  polygon: transformPolygonAddress,
  xdai: transformXdaiAddress,
  avax: transformAvaxAddress,
  heco: transformHecoAddress,
  hoo: transformHooAddress,
  harmony: transformHarmonyAddress,
  optimism: transformOptimismAddress,
  moonriver: transformMoonriverAddress,
  milkomeda: transformMilkomedaAddress,
  okex: transformOkexAddress,
  kcc: transformKccAddress,
  arbitrum: transformArbitrumAddress,
  iotex: transformIotexAddress,
  metis: transformMetisAddress,
  near: transformNearAddress,
  moonbeam: transformMoonbeamAddress,
  klaytn: transformKlaytnAddress,
  velas: transformVelasAddress,
  ethereum: transformEthereumAddress,
  oasis: transformOasisAddress,
  dfk: transformDfkAddress,
  findora: transformFindoraAddress,
};

async function transformEthereumAddress() {
  const mapping = {
    '0x88536c9b2c4701b8db824e6a16829d5b5eb84440': 'polygon:0xac63686230f64bdeaf086fe6764085453ab3023f', // USV token
    '0xFEEf77d3f69374f66429C91d732A244f074bdf74': '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0', // CVX FXS token
  }
  normalizeMapping(mapping)

  return addr => {
    addr = addr.toLowerCase()
    return mapping[addr] || addr
  }
}
async function transformMilkomedaAddress() {
  const mapping = {
    '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52': 'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // BNB token
  }

  return transformChainAddress(mapping, 'milkomeda')
}

async function transformFindoraAddress() {
  const mapping = {
    '0xABc979788c7089B516B8F2f1b5cEaBd2E27Fd78b': 'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BNB token
    '0x008A628826E9470337e0Cd9c0C944143A83F32f3': 'bsc:0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH token
    '0x93EDFa31D7ac69999E964DAC9c25Cd6402c75DB3': 'bsc:0x55d398326f99059ff775485246999027b3197955', // USDT token
    '0xdA33eF1A7b48beBbF579eE86DFA735a9529C4950': 'bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC token
    '0xE80EB4a234f718eDc5B76Bb442653827D20Ebb2d': 'bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD token
    '0x07EfA82E00E458ca3D53f2CD5B162e520F46d911': 'bsc:0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c' //  WBTC token
  }

  return transformChainAddress(mapping, 'findora')
}

function transformChainAddress(mapping, chain) {
  normalizeMapping(mapping)

  return addr => {
    addr = addr.toLowerCase()
    return mapping[addr] || `${chain}:${addr}`
  }
}

async function getChainTransform(chain) {
  if (chainTransforms[chain])
    return chainTransforms[chain]();

  return (addr) => `${chain}:${addr}`;
}

module.exports = {
  getChainTransform,
  getFixBalances,
  transformCeloAddress,
  transformCronosAddress,
  fixCronosBalances,
  transformFantomAddress,
  transformBscAddress,
  transformPolygonAddress,
  transformXdaiAddress,
  transformAvaxAddress,
  transformHecoAddress,
  transformHarmonyAddress,
  transformOptimismAddress,
  transformMoonriverAddress,
  fixAvaxBalances,
  transformOkexAddress,
  transformKccAddress,
  transformArbitrumAddress,
  fixHarmonyBalances,
  fixOasisBalances,
  transformIotexAddress,
  transformMetisAddress,
  transformBobaAddress,
  transformNearAddress,
  transformMoonbeamAddress,
  transformKlaytnAddress,
  transformVelasAddress,
  transformEthereumAddress,
  transformOasisAddress,
  transformOasisAddressBase,
  transformMilkomedaAddress,
  transformDfkAddress,
  transformFindoraAddress,
  wavesMapping,
  stripTokenHeader,
};
