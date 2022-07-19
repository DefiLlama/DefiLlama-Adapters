const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const IOTEX_CG_MAPPING = require("./../xdollar-finance/iotex_cg_mapping.json");
const BigNumber = require("bignumber.js");

const nullAddress = '0x0000000000000000000000000000000000000000'

async function transformFantomAddress() {
  const multichainTokens = (await utils.fetchURL(
    "https://netapi.anyswap.net/bridge/v2/info"
  )).data.bridgeList;

  const mapping = {
    "0xbf07093ccd6adfc3deb259c557b61e94c1f66945":
      "fantom:0xd6070ae98b8069de6b494332d1a1a81b6179d960",
    "0x1b156c5c75e9df4caab2a5cc5999ac58ff4f9090":
      "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0xa48d959ae2e88f1daa7d5f611e01908106de7598":
      "fantom:0x841fad6eae12c286d1fd18d1d525dffa75c7effe",
    "0xd795d70ec3c7b990ffed7a725a18be5a9579c3b9":
      "avax:0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    "0xb6767518b205ea8b312d2ef4d992a2a08c2f2416":
      "avax:0xc7198437980c041c805a1edcba50c1ce5db95118",
    "0xaf9f33df60ca764307b17e62dde86e9f7090426c":
      "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
    "0x808d5f0a62336917da14fa9a10e9575b1040f71c":
      "avax:0x60781c2586d68229fde47564546784ab3faca982",
    "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0":
      "fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    "0x637ec617c86d24e421328e6caea1d92114892439":
      "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8":
      "0x514910771af9ca656af840dff83e8264ecf986ca",
    "0x0a03d2c1cfca48075992d810cc69bd9fe026384a":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0x97927abfe1abbe5429cbe79260b290222fc9fbba":
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "0x6dfe2aaea9daadadf0865b661b53040e842640f8":
      "0x514910771af9ca656af840dff83e8264ecf986ca",
    "0x920786cff2a6f601975874bb24c63f0115df7dc8":
      "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0x49c68edb7aebd968f197121453e41b8704acde0c":
      "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "0x0665ef3556520b21368754fb644ed3ebf1993ad4":
      "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
    // update below to binspirit when it lists on coingecko
    "0x7345a537a975d9ca588ee631befddfef34fd5e8f":
      "fantom:0x5Cc61A78F164885776AA610fb0FE1257df78E59B",
    "0xdbf31df14b66535af65aac99c32e9ea844e14501":
      "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", // RenBTC
    "0x4a89338a2079a01edbf5027330eac10b615024e5":
      "fantom:0xad84341756bf337f5a0164515b1f6f993d194e1f", // USDL
    "0xc0d9784fdba39746919bbf236eb73bc015fd351d":
      "fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", // FTML
    "0xe3a486c1903ea794eed5d5fa0c9473c7d7708f40":
      "fantom:0xad84341756bf337f5a0164515b1f6f993d194e1f", // cUSD (revenent finance)
    "0x02a2b736f9150d36c0919f3acee8ba2a92fbbb40":
      "0x1a7e4e63778b4f12a199c062f3efdd288afcbce8", // agEUR
    "0x1b6382dbdea11d97f24495c9a90b7c88469134a4":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // axUSDC
    "0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E":
      "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9", // alUSD
    "0x8cc97b50fe87f31770bcdcd6bc8603bc1558380b":
      "cronos:0x0804702a4e749d39a35fde73d1df0b1f1d6b8347", // single
    "0x95bf7e307bc1ab0ba38ae10fc27084bc36fcd605":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  };

  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
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
      token => token.chainId === "250" && token.token === addr.toLowerCase()
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
  const [
    bridgeTokensOld,
    bridgeTokensNew,
    bridgeTokenDetails
  ] = await Promise.all([
    utils.fetchURL(
      "https://raw.githubusercontent.com/0xngmi/bridge-tokens/main/data/penultimate.json"
    ),
    utils
      .fetchURL(
        "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/avalanche_contract_address.json"
      )
      .then(r => Object.entries(r.data)),
    utils.fetchURL(
      "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/token_list.json"
    )
  ]);
  return addr => {
    if (compareAddresses(addr, "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7")) {
      return "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
    }
    const srcToken = bridgeTokensOld.data.find(token =>
      compareAddresses(token["Avalanche Token Address"], addr)
    );
    if (
      srcToken !== undefined &&
      srcToken["Ethereum Token Decimals"] ===
      srcToken["Avalanche Token Decimals"]
    ) {
      return srcToken["Ethereum Token Address"];
    }
    const newBridgeToken = bridgeTokensNew.find(token =>
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
      "0xaf2c034c764d53005cc6cbc092518112cbd652bb":
        "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33":
        "avax:0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd",
      "0x0000000000000000000000000000000000000000":
        "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx":
        "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0xd45b7c061016102f9fa220502908f2c0f1add1d7":
        "0xffc97d72e13e01096502cb8eb52dee56f74dad7b",
      "0x46a51127c3ce23fb7ab1de06226147f446e4a857":
        "0xbcca60bb61934080951369a648fb03df4f96263c",
      "0x532e6537fea298397212f09a61e03311686f548e":
        "0x3ed3b47dd13ec9a98b44e6204a523e766b225811",
      "0xdfe521292ece2a4f44242efbcd66bc594ca9714b":
        "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0x686bef2417b6dc32c50a3cbfbcc3bb60e1e9a15d":
        "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656",
      "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21":
        "0x030ba81f1c18d280636f32af80b9aad02cf0854e",
      "0x47afa96cdc9fab46904a55a6ad4bf6660b53c38a":
        "0x028171bca77440897b824ca71d1c56cac55b68a3",
      "0x574679ec54972cf6d705e0a71467bb5bb362919d":
        "avax:0x5817d4f0b62a59b17f75207da1848c2ce75e7af4",
      "0x2f28add68e59733d23d5f57d94c31fb965f835d0":
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // sUSDC(Avalanche) -> USDC(Ethereum)
      "0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd":
        "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // sBUSD(Avalanche) -> BUSD(BSC)
      "0xb0a8e082e5f8d2a04e74372c1be47737d85a0e73":
        "polygon:0xac63686230f64bdeaf086fe6764085453ab3023f", // USV
      "0x02bfd11499847003de5f0f5aa081c43854d48815":
        "0x7a5d3A9Dcd33cb8D527f7b5F96EB4Fef43d55636", // Radioshack
      "0xbf07093ccd6adfc3deb259c557b61e94c1f66945":
        "fantom:0xd6070ae98b8069de6b494332d1a1a81b6179d960",
      "0x1b156c5c75e9df4caab2a5cc5999ac58ff4f9090":
        "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      "0xa48d959ae2e88f1daa7d5f611e01908106de7598":
        "fantom:0x841fad6eae12c286d1fd18d1d525dffa75c7effe",
      "0xd795d70ec3c7b990ffed7a725a18be5a9579c3b9":
        "avax:0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      "0xb6767518b205ea8b312d2ef4d992a2a08c2f2416":
        "avax:0xc7198437980c041c805a1edcba50c1ce5db95118",
      "0xaf9f33df60ca764307b17e62dde86e9f7090426c":
        "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
      "0x808d5f0a62336917da14fa9a10e9575b1040f71c":
        "avax:0x60781c2586d68229fde47564546784ab3faca982",
      "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0":
        "fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
      "0x637ec617c86d24e421328e6caea1d92114892439":
        "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8":
        "0x514910771af9ca656af840dff83e8264ecf986ca",
      "0x0a03d2c1cfca48075992d810cc69bd9fe026384a":
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "0x97927abfe1abbe5429cbe79260b290222fc9fbba":
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "0x6dfe2aaea9daadadf0865b661b53040e842640f8":
        "0x514910771af9ca656af840dff83e8264ecf986ca",
      "0x920786cff2a6f601975874bb24c63f0115df7dc8":
        "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0x49c68edb7aebd968f197121453e41b8704acde0c":
        "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      "0x0665ef3556520b21368754fb644ed3ebf1993ad4":
        "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
      // update below to binspirit when it lists on coingecko
      "0x7345a537a975d9ca588ee631befddfef34fd5e8f":
        "fantom:0x5Cc61A78F164885776AA610fb0FE1257df78E59B",
      "0x90a424754ad0d72cebd440faba18cdc362bfe70a":
        "heco:0xcbd6cb9243d8e3381fea611ef023e17d1b7aedf0", // BXH
      "0x8965349fb649a33a30cbfda057d8ec2c48abe2a2":
        "0x6e9730ecffbed43fd876a264c982e254ef05a0de", // Nord
      "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7":
        "0xdac17f958d2ee523a2206206994597c13d831ec7"
    };
    return map[addr.toLowerCase()] || `avax:${addr}`;
  };
}

async function transformBscAddress() {
  const mapping = {
    "0x0000000000000000000000000000000000000000":
      "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BNB -> WBNB
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
      "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BNB -> WBNB
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c":
      "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c", // ELK
    "0xb7f8cd00c5a06c0537e2abff0b58033d02e5e094":
      "0x8e870d67f660d95d5be530380d0ec0bd388289e1", // PAX
    "0x2170ed0880ac9a755fd29b2688956bd959f933f8":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0xa35d95872d8eb056eb2cbd67d25124a6add7455e": "0x123", // 2030FLOKI returns nonsense TVL
    "0x0cf8e180350253271f4b917ccfb0accc4862f262": "0x123", // BTCBR returns nonsense TVL
    "0x6ded0f2c886568fb4bb6f04f179093d3d167c9d7":
      "0x09ce2b746c32528b7d864a1e3979bd97d2f095ab", // DFL
    "0x2f28add68e59733d23d5f57d94c31fb965f835d0":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // sUSDC(BSC) -> USDC(Ethereum)
    "0xaf6162dc717cfc8818efc8d6f46a41cf7042fcba":
      "polygon:0xac63686230f64bdeaf086fe6764085453ab3023f", // USV Token
    "0x30807d3b851a31d62415b8bb7af7dca59390434a":
      "0x7a5d3A9Dcd33cb8D527f7b5F96EB4Fef43d55636", // Radio Token
    "0xce86f7fcd3b40791f63b86c3ea3b8b355ce2685b":
      "0xb4d930279552397bba2ee473229f89ec245bc365", // MahaDao
    "0xbb9858603b1fb9375f6df972650343e985186ac5":
      "bsc:0xc087c78abac4a0e900a327444193dbf9ba69058e", // Treat staked  BUSD-USDC Staked APE-LP as LP Token
    "0xc5fb6476a6518dd35687e0ad2670cb8ab5a0d4c5":
      "bsc:0x2e707261d086687470b515b320478eb1c88d49bb", // Treat staked  BUSD-USDT Staked APE-LP as LP Token
    "0xaed19dab3cd68e4267aec7b2479b1ed2144ad77f":
      "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // valas BUSD -> BUSD
    "0xa6fdea1655910c504e974f7f1b520b74be21857b":
      "bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // valas USDC -> BUSD
    "0x5f7f6cb266737b89f7af86b30f03ae94334b83e9":
      "bsc:0x55d398326f99059ff775485246999027b3197955", // valas USDT -> BUSD
    "0x532197ec38756b9956190b845d99b4b0a88e4ca9":
      "0x1614f18fc94f47967a3fbe5ffcd46d4e7da3d787", // PAID
    "0x6d1b7b59e3fab85b7d3a3d86e505dd8e349ea7f3":
      "heco:0xcbd6cb9243d8e3381fea611ef023e17d1b7aedf0", // BXH
    "0x42586ef4495bb512a86cf7496f6ef85ae7d69a64":
      "polygon:0x66e8617d1df7ab523a316a6c01d16aa5bed93681", // SPICE
    "0x60d01ec2d5e98ac51c8b4cf84dfcce98d527c747": "0x9ad37205d608b8b219e6a2573f922094cec5c200", // iZi
    "0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d": "0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d", // iUSD
    // "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // BETH->WETH
  };

  return addr => {
    addr = addr.toLowerCase();

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
    "0x60d01ec2d5e98ac51c8b4cf84dfcce98d527c747":
      "0x9ad37205d608b8b219e6a2573f922094cec5c200", // IZI
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
      "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", //
    // '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',  // WMATIC
    "0x0000000000000000000000000000000000000000":
      "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", //
    "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619":
      "0x0000000000000000000000000000000000000000", //
    "0xAa9654BECca45B5BDFA5ac646c939C62b527D394":
      "polygon:0xAa9654BECca45B5BDFA5ac646c939C62b527D394", // Dino
    "0x2f28add68e59733d23d5f57d94c31fb965f835d0":
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // sUSDC(Polygon) -> USDC(Ethereum)
    "0x9fffb2f49adfc231b44ddcff3ffcf0e81b06430a":
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // moUSD(Polygon) -> DAI
    "0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd":
      "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // sBUSD(Polygon) -> BUSD(BSC)
    "0x8eb3771a43a8c45aabe6d61ed709ece652281dc9":
      "avax:0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // sUSDC.e(Polygon) -> USDC.e(Avalanche)
    "0x613a489785c95afeb3b404cc41565ccff107b6e0":
      "0x7a5d3A9Dcd33cb8D527f7b5F96EB4Fef43d55636", // radioshack
    "0x1ddcaa4ed761428ae348befc6718bcb12e63bfaa": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // deUSDC
    "0x794baab6b878467f93ef17e2f2851ce04e3e34c8": "0x794baab6b878467f93ef17e2f2851ce04e3e34c8", // Yin
    "0x282d8efce846a88b159800bd4130ad77443fa1a1": "0x967da4048cd07ab37855c090aaf366e4ce1b9f48" //ocean
  };
  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
    return mapping[addr] || tokens[addr] || `polygon:${addr}`;
  };
}

async function transformXdaiAddress() {
  const mapping = {
    "0x0000000000000000000000000000000000000000":
      "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0x44fa8e6f47987339850636f88629646662444217":
      "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d":
      "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0x4537e328bf7e4efa29d05caea260d7fe26af9d74":
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    "0x4ecaba5870353805a9f068101a40e0f32ed605c6":
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "0x7122d7661c4564b7c6cd4878b06766489a6028a2":
      "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252":
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
    // '0x29414ec76d79ff238e5e773322799d1c7ca2443f': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // Boring oBTC
  };

  return transformChainAddress(mapping, "xdai", { skipUnmapped: false });
}

async function transformOkexAddress() {
  // const okexBridge = (
  //   await utils.fetchURL(
  //     "https://www.okex.com/v2/asset/cross-chain/currencyAddress"
  //   )
  // ).data.data.tokens; TODO
  const mapping = {
    "0x0000000000000000000000000000000000000000":
      "0x75231f58b43240c9718dd58b4967c5114342a86c", // okex
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c":
      "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c"
  };

  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
    if (mapping[addr]) return mapping[addr];
    return `okexchain:${addr}`;
  };
}

async function transformHecoAddress() {
  const mapping = {
    "0xb6f4c418514dd4680f76d5caa3bb42db4a893acb":
      "bsc:0x250632378e573c6be1ac2f97fcdf00515d0aa91b",
    "0x0000000000000000000000000000000000000000":
      "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
    "0xhecozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz":
      "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
    "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f":
      "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c":
      "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c",
    "0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a":
      "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0xCe0A5CA134fb59402B723412994B30E02f083842":
      "0xc00e94cb662c3520282e6f5717214004a7f26888",
    "0x1Ee8382bE3007Bd9249a89f636506284DdEf6Cc0":
      "0x35a532d376ffd9a705d0bb319532837337a398e7",
    "0x40280e26a572745b1152a54d1d44f365daa51618":
      "bsc:0xba2ae424d960c26247dd6c32edc70b295c744c43",
    "0x5ee41ab6edd38cdfb9f6b4e6cf7f75c87e170d98":
      "0x0000000000085d4780b73119b644ae5ecd22b376",
    "0xA2F3C2446a3E20049708838a779Ff8782cE6645a":
      "bsc:0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe", // XRP
    "0x843Af718EF25708765a8E0942F89edEae1D88DF0":
      "bsc:0x3ee2200efb3400fabb9aacf31297cbdd1d435d47" // ADA
  };

  return transformChainAddress(mapping, "heco", { skipUnmapped: false });
}

async function transformHooAddress() {
  const mapping = {
    "0xd16babe52980554520f6da505df4d1b124c815a7":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0x3eff9d389d13d6352bfb498bcf616ef9b1beac87":
      "0x6f259637dcd74c767781e37bc6133cd6a68aa161" // wHOO
  };
  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
    return mapping[addr] || `hoo:${addr}`;
  };
}

async function transformCeloAddress() {
  return addr => {
    return `celo:${addr}`;
  };
}

async function transformHarmonyAddress() {
  const bridge = (await utils.fetchURL(
    "https://be4.bridge.hmny.io/tokens/?page=0&size=1000"
  )).data.content;

  const mapping = {
    "0x6983D1E6DEf3690C4d616b13597A09e6193EA013":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0xb1f6E61E1e113625593a22fa6aa94F8052bc39E0":
      "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    "0xFbdd194376de19a88118e84E279b977f165d01b8":
      "polygon:0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a":
      "harmony:0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a",
    "0x72cb10c6bfa5624dd07ef608027e366bd690048f":
      "harmony:0x72cb10c6bfa5624dd07ef608027e366bd690048f",
    "0xa9ce83507d872c5e1273e745abcfda849daa654f":
      "harmony:0xa9ce83507d872c5e1273e745abcfda849daa654f",
    "0xb12c13e66ade1f72f71834f2fc5082db8c091358":
      "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", //avax
    "0x224e64ec1bdce3870a6a6c777edd450454068fec":
      "0xa47c8bf37f92abed4a126bda807a7b7498661acd",
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c":
      "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c",
    "0xd754ae7bb55feb0c4ba6bc037b4a140f14ebe018":
      "0x19e6bfc1a6e4b042fb20531244d47e252445df01",
    "0x0000000000000000000000000000000000000000":
      "0x799a4202c12ca952cB311598a024C80eD371a41e", // Harmony ONE
    "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f":
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0x985458e523db3d53125813ed68c274899e9dfab4":
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1":
      "0x6B175474E89094C44Da98b954EedeAC495271d0F" // DAI
  };

  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
    if (mapping[addr]) return mapping[addr];
    const srcToken = bridge.find(token =>
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
    "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6"
};

async function transformOptimismAddress() {
  const bridge = (await utils.fetchURL(
    "https://static.optimism.io/optimism.tokenlist.json"
  )).data.tokens;

  const mapping = {
    "0x4200000000000000000000000000000000000006":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0x5029c236320b8f15ef0a657054b84d90bfbeded3":
      "0x15ee120fd69bec86c1d38502299af7366a41d1a6",
    "0x0000000000000000000000000000000000000000":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // OETH -> WETH
    "0x121ab82b49B2BC4c7901CA46B8277962b4350204":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // synapse WETH -> WETH
    "0x35D48A789904E9b15705977192e5d95e2aF7f1D3":
      "0x956f47f50a910163d8bf957cf5846d573e7f87ca", // FEI
    "0xcb8fa9a76b8e203d8c3797bf438d8fb81ea3326a":
      "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9", // alUSD
    "0x67CCEA5bb16181E7b4109c9c2143c24a1c2205Be":
      "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", // FRAX Share
    "0x2E3D870790dC77A83DD1d18184Acc7439A53f475":
      "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
    "0x0b5740c6b4a97f90eF2F0220651Cca420B868FfB":
      "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f" // gOHM
  };
  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();

    if (mapping[addr]) return mapping[addr];

    const possibleSynth = optimismSynths[addr.toLowerCase()];
    if (possibleSynth !== undefined) {
      return possibleSynth;
    }
    const dstToken = bridge.find(
      token => compareAddresses(addr, token.address) && token.chainId === 10
    );
    if (dstToken !== undefined) {
      const srcToken = bridge.find(
        token => dstToken.logoURI === token.logoURI && token.chainId === 1
      );
      if (srcToken !== undefined) {
        return srcToken.address;
      }
    }
    return `optimism:${addr}`;
  };
}

async function transformMoonriverAddress() {
  const mapping = {
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c":
      "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c",
    "0x0000000000000000000000000000000000000000":
      "moonriver:0x98878B06940aE243284CA214f92Bb71a2b032B8A"
  };

  return transformChainAddress(mapping, "moonriver", { skipUnmapped: false });
}



async function transformMoonbeamAddress() {
  const mapping = {
    '0x322E86852e492a7Ee17f28a78c663da38FB33bfb': '0x853d955aCEf822Db058eb8505911ED77F175b99e', // frax
    '0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // usdc
    '0xdfa46478f9e5ea86d57387849598dbfb2e964b02': 'polygon:0xa3fa99a148fa48d14ed51d610c367c61876997f1', // mai
    '0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594': '0xdac17f958d2ee523a2206206994597c13d831ec7', // usdt
    '0x30D2a9F5FDf90ACe8c17952cbb4eE48a55D916A7': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // eth
    '0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // wtbc
    '0xc234A67a4F840E61adE794be47de455361b52413': '0x6b175474e89094c44da98b954eedeac495271d0f', // dai
    '0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E': 'moonriver:0x98878b06940ae243284ca214f92bb71a2b032b8a', // movr
    '0x0000000000000000000000000000000000000000': 'moonbeam:0xacc15dc74880c9944775448304b263d191c6077f', // GLMR -> WGLMR
  }

  return transformChainAddress(mapping, "moonbeam", { skipUnmapped: false });
}

async function transformArbitrumAddress() {
  const bridge = (await utils.fetchURL(
    "https://bridge.arbitrum.io/token-list-42161.json"
  )).data.tokens;
  const mapping = {
    "0x0000000000000000000000000000000000000000":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0x09ad12552ec45f82be90b38dfe7b06332a680864":
      "polygon:0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539", // ADDy
    "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A":
      "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3", // MIM
    "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501":
      "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", // renBTC
    "0x9ef758ac000a354479e538b8b2f01b917b8e89e7":
      "polygon:0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea", // XDO
    "0x31635A2a3892dAeC7C399102676E344F55d20Da7":
      "0x09ce2b746c32528b7d864a1e3979bd97d2f095ab", //  DeFIL
    "0x4a717522566c7a09fd2774ccedc5a8c43c5f9fd2":
      "0x956f47f50a910163d8bf957cf5846d573e7f87ca", //  FEI
    "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688":
      "0x6b175474e89094c44da98b954eedeac495271d0f", //  nUSD
    "0x289ba1701c2f088cf0faf8b3705246331cb8a839":
      "0x58b6a8a3302369daec383334672404ee733ab239", // LPT
    "0x61a1ff55c5216b636a294a07d77c6f4df10d3b56": "0x52a8845df664d76c69d2eea607cd793565af42b8", // APEX
  };

  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
    if (mapping[addr]) return mapping[addr];
    const dstToken = bridge.find(token =>
      compareAddresses(addr, token.address)
    );
    if (dstToken !== undefined) {
      return dstToken.extensions.bridgeInfo[1].tokenAddress;
    }
    return `arbitrum:${addr}`;
  };
}

async function transformFuseAddress() {
  const mapping = {
    "0x0000000000000000000000000000000000000000":
      "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d", // FUSE
    "0x0be9e53fd7edac9f859882afdda116645287c629":
      "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d", // FUSE
    "0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5":
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA":
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10":
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xa722c13135930332Eb3d749B2F0906559D2C5b99":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0x43b17749b246fd2a96de25d9e4184e27e09765b0":
      "0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202" // KYC
  };

  return transformChainAddress(mapping, "fuse", {
    skipUnmapped: true,
    chainName: "fuse"
  });
}

async function transformEvmosAddress() {
  const mapping = {
    // '0x0000000000000000000000000000000000000000': '',  // EVMOS
    // '0xD4949664cD82660AaE99bEdc034a0deA8A0bd517': '',  // WEVMOS
    "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82":
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // madUSDC
    "0x8d395AfFC1767141387ffF45aF88a074614E7Ccf":
      "0x18084fba666a33d37592fa2633fd49a74dd93a88", // tBTCv2
    "0xb1a8C961385B01C3aA782fba73E151465445D319":
      "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", // renBTC
    "0xe46910336479F254723710D57e7b683F3315b22B":
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // ceUSDC
    "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA":
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e":
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // madUSDT
    "0xb72A7567847abA28A2819B855D7fE679D4f59846":
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // ceUSDT
    "0x5842C5532b61aCF3227679a8b1BD0242a41752f2":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0xF80699Dc594e00aE7bA200c7533a07C1604A106D":
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    "0x28eC4B29657959F4A5052B41079fe32919Ec3Bd3":
      "0x853d955aCEf822Db058eb8505911ED77F175b99e", // madFRAX
    "0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8":
      "0x853d955aCEf822Db058eb8505911ED77F175b99e" // FRAX
  };

  return transformChainAddress(mapping, "evmos", {
    skipUnmapped: false,
    chainName: "evmos"
  });
}

function fixAvaxBalances(balances) {
  for (const representation of [
    "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0x9dEbca6eA3af87Bf422Cea9ac955618ceb56EfB4"
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
    "0x799a4202c12ca952cB311598a024C80eD371a41e"
  ]) {
    if (balances[representation] !== undefined) {
      sdk.util.sumSingleBalance(
        balances,
        "harmony",
        Number(balances[representation]) / 1e18
      );
      delete balances[representation];
    }
  }
  const xJewel = "harmony:0xa9ce83507d872c5e1273e745abcfda849daa654f";
  if (balances[xJewel]) {
    sdk.util.sumSingleBalance(
      balances,
      "xjewel",
      Number(balances[xJewel]) / 1e18
    );
    delete balances[xJewel];
  }
}

function transformOasisAddressBase(addr) {
  const map = {
    "0x21c718c22d52d0f3a789b752d4c2fd5908a8a733": "oasis-network",
    "0x3223f17957ba502cbe71401d55a0db26e5f7c68f":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH
    "0xe8a638b3b7565ee7c5eb9755e58552afc87b94dd":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0x6cb9750a92643382e020ea9a170abb83df05f30b":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0xdc19a122e268128b5ee20366299fc7b5b199c8e3":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT wormhole
    "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC celer
    "0x94fbffe5698db6f54d6ca524dbe673a7729014be":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844":
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" // USDC
    //'0x21c718c22d52d0f3a789b752d4c2fd5908a8a733': 'wrapped-rose',
  };
  return map[addr.toLowerCase()] || `${addr}`;
}

async function transformOasisAddress() {
  return transformOasisAddressBase;
}
function fixBscBalances(balances) {
  if (balances["bsc:0x8b04E56A8cd5f4D465b784ccf564899F30Aaf88C"]) {
    sdk.util.sumSingleBalance(
      balances,
      "anchorust",
      Number(balances["bsc:0x8b04E56A8cd5f4D465b784ccf564899F30Aaf88C"]) /
      10 ** 6
    );
  }
}
function fixOasisBalances(balances) {
  ["oasis-network", "wrapped-rose"].forEach(key => {
    if (balances[key]) balances[key] = balances[key] / 10 ** 18;
  });
}
async function transformIotexAddress() {
  return addr => {
    const dstToken = Object.keys(IOTEX_CG_MAPPING).find(token =>
      compareAddresses(addr, token)
    );
    if (dstToken !== undefined) {
      return (
        IOTEX_CG_MAPPING[dstToken].contract ||
        IOTEX_CG_MAPPING[dstToken].coingeckoId
      );
    }
    return `iotex:${addr}`;
  };
}

async function transformKccAddress() {
  return addr => {
    if (compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")) {
      return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c";
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
    if (compareAddresses(addr, "0xfa93c12cd345c658bc4644d1d4e1b9615952258c")) {
      return "bsc:0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c";
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
    "0x0000000000000000000000000000000000000000": "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e", // METIS
    "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000": "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e",
    "0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "0x420000000000000000000000000000000000000a": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0x5801d0e1c7d977d78e4890880b8e579eb4943276": "bsc:0x5801d0e1c7d977d78e4890880b8e579eb4943276",
    "0xea32a96608495e54156ae48931a7c20f0dcc1a21": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0x2692be44a6e38b698731fddf417d060f0d20a0cb": "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    "0xa5B55ab1dAF0F8e1EFc0eB1931a957fd89B918f4": "avax:0x50b7545627a5162F82A992c33b87aDc75187B218",
    "0x12d84f1cfe870ca9c9df9785f8954341d7fbb249": "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // bUSD
    "0xE253E0CeA0CDD43d9628567d097052B33F98D611": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // wAVAX
    "0xa9109271abcf0c4106ab7366b4edb34405947eed": "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // wFTM
    "0x4651B38e7ec14BB3db731369BFE5B08F2466Bd0A": "bsc:0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    "0xfe282Af5f9eB59C30A3f78789EEfFA704188bdD4": "metis:0xfe282Af5f9eB59C30A3f78789EEfFA704188bdD4",
    "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8": "bsc:0xad29abb318791d579433d831ed122afeaf29dcfe",
    "0x4b9D2923D875edF43980BF5dddDEde3Fb20fC742": "bsc:0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
    "0x67c10c397dd0ba417329543c1a40eb48aaa7cd00": "0x0f2d719407fdbeff09d87557abb7232601fd9f29", //SYN
    "0x226d8bfb4da78ddc5bd8fd6c1532c58e88f9fd34": "0xbc19712feb3a26080ebf6f2f7849b417fdd792ca", // BoringDAO
  }
  normalizeMapping(map)

  return addr => {
    addr = addr.toLowerCase()

    return map[addr] || `metis:${addr}`;
  };
}

function transformBobaAddress() {
  const map = {
    "0x0000000000000000000000000000000000000000":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0xd203De32170130082896b4111eDF825a4774c18E":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // synapse wETH
    "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0x66a2a913e447d6b4bf33efbec43aaef87890fbbc":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0x5de1677344d3cb0d7d465c10b72a8f60699c062d":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0xf74195bb8a5cf652411867c5c2c5b8c2a402be35":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    "0x461d52769884ca6235B685EF2040F47d30C94EB5":
      "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
    "0xdc0486f8bf31df57a952bcd3c1d3e166e3d9ec8b":
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    "0xa18bf3994c0cc6e3b63ac420308e5383f53120d7":
      "0x42bbfa2e77757c645eeaad1655e0911a7553efbc", // BOBA
    "0xe1e2ec9a85c607092668789581251115bcbd20de":
      "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07", // OMG
    "0x7562f525106f5d54e891e005867bf489b5988cd9":
      "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
    "0x2f28add68e59733d23d5f57d94c31fb965f835d0":
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // sUSDC(Boba) -> USDC(Ethereum)
    "0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd":
      "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56" // sBUSD(Boba) -> BUSD(BSC)
  };

  normalizeMapping(map);

  return addr => {
    return map[addr.toLowerCase()] || `boba:${addr}`;
  };
}

function transformNearAddress() {
  return addr => {
    const bridgedAssetIdentifier = ".factory.bridge.near";
    if (addr.endsWith(bridgedAssetIdentifier))
      return `0x${addr.slice(0, addr.length - bridgedAssetIdentifier.length)}`;

    return addr
  };
}

const nearFixMapping = {
  "token.jumbo_exchange.near": {
    coingeckoId: "jumbo-exchange",
    decimals: 18
  },
  "token.paras.near": {
    coingeckoId: "paras",
    decimals: 18
  },
  "marmaj.tkn.near": {
    coingeckoId: "marmaj",
    decimals: 18
  },
  "linear-protocol.near": {
    coingeckoId: "linear-protocol",
    decimals: 24
  },
  "token.pembrock.near": {
    coingeckoId: "pembrock",
    decimals: 18
  },
  "token.burrow.near": {
    coingeckoId: "burrow",
    decimals: 18
  },
}

async function transformKlaytnAddress() {
  const mapping = {
    "0x5388ce775de8f7a69d17fd5caa9f7dbfee65dfce":
      "0x4576E6825B462b6916D2a41E187626E9090A92c6", // Donkey
    "0x02cbe46fb8a1f579254a9b485788f2d86cad51aa":
      "0x26fb86579e371c7aedc461b2ddef0a8628c93d3b", // bora
    "0x5c74070fdea071359b86082bd9f9b3deaafbe32b":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // dai
    "0x754288077d0ff82af7a5317c7cb8c444d421d103":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0x0268dbed3832b87582b1fa508acf5958cbb1cd74":
      "bsc:0xf258f061ae2d68d023ea6e7cceef97962785c6c1", // IJM
    "0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0x168439b5eebe8c83db9eef44a0d76c6f54767ae4":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // pUSD
    "0x4fa62f1f404188ce860c8f0041d6ac3765a72e67":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // KSD
    "0xce40569d65106c32550626822b91565643c07823":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // KASH
    "0x210bc03f49052169d5588a52c317f71cf2078b85":
      "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // kBUSD
    "0x16d0e1fbd024c600ca0380a4c5d57ee7a2ecbf9c":
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    "0x34d21b1e550d73cee41151c77f3c73359527a396":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0x0000000000000000000000000000000000000000": "0xd7a4d10070a4f7bc2a015e78244ea137398c3b74" // Klaytn
  };

  return addr => {
    addr = addr.toLowerCase();
    return mapping[addr] || `klaytn:${addr}`;
  };
}

function fixKlaytnBalances(balances) {
  const mapping = {
    "0xd7a4d10070a4f7bc2a015e78244ea137398c3b74": {
      coingeckoId: "klay-token",
      decimals: 18
    }, // Wrapped KLAY
    "0xe4f05a66ec68b54a58b17c22107b02e0232cc817": {
      coingeckoId: "klay-token",
      decimals: 18
    }, // Wrapped KLAY
    "0x9eaefb09fe4aabfbe6b1ca316a3c36afc83a393f": {
      coingeckoId: "ripple",
      decimals: 6
    },
    "0xd6dab4cff47df175349e6e7ee2bf7c40bb8c05a3": {
      coingeckoId: "tether",
      decimals: 6
    },
    "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654": {
      coingeckoId: "klayswap-protocol",
      decimals: 18
    } // KLAYSWAP
  };
  return fixBalances(balances, mapping);
}

function transformVelasAddress() {
  return addr => {
    const map = {
      "0x85219708c49aa701871ad330a94ea0f41dff24ca":
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
      "0xe41c4324dCbD2926481101f8580D13930AFf8A75":
        "velas:0xc579D1f3CF86749E05CD06f7ADe17856c2CE3126", // WVLX
      "0x6ab0B8C1a35F9F4Ce107cCBd05049CB1Dbd99Ec5":
        "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", // MATIC
      "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C":
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
      "0x2B8e9cD44C9e09D936149549a8d207c918ecB5C4":
        "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BNB
      "0xc9b3aA6E91d70f4ca0988D643Ca2bB93851F3de4":
        "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // FTM
      "0xe2c120f188ebd5389f71cf4d9c16d05b62a58993":
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0x01445c31581c354b7338ac35693ab2001b50b9ae":
        "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
      "0xc111c29a988ae0c0087d97b33c6e6766808a3bd3":
        "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
      "0x300a8be53b4b5557f48620d578e7461e3b927dd0":
        "0xf56842af3b56fd72d17cb103f92d027bba912e89" // BAMBOO
    };
    normalizeMapping(map)
    return map[addr.toLowerCase()] || `velas:${addr}`;
  };
}
async function transformCronosAddress() {
  const mapping = {
    "0x0000000000000000000000000000000000000000":
      "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b",
    "0x09ad12552ec45f82be90b38dfe7b06332a680864":
      "polygon:0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539" // ADDY
  };
  return addr => mapping[addr.toLowerCase()] || `cronos:${addr.toLowerCase()}`;
}

function fixShidenBalances(balances) {
  const mapping = {
    "0x0f933dc137d21ca519ae4c7e93f87a4c8ef365ef": {
      coingeckoId: "shiden",
      decimals: 18
    },
    "0xb4BcA5955F26d2fA6B57842655d7aCf2380Ac854": {
      coingeckoId: "emiswap",
      decimals: 18
    },
    "0x765277EebeCA2e31912C9946eAe1021199B39C61": {
      coingeckoId: "ethereum",
      decimals: 18
    },
    "0x332730a4f6e03d9c55829435f10360e13cfa41ff": {
      coingeckoId: "binancecoin",
      decimals: 18
    },
    "0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a": {
      coingeckoId: "binance-usd",
      decimals: 18
    },
    "0x722377a047e89ca735f09eb7cccab780943c4cb4": {
      coingeckoId: "standard-protocol",
      decimals: 18
    }
  };

  return fixBalances(balances, mapping, { removeUnmapped: true });
}

function fixAstarBalances(balances) {
  const mapping = {
    "0xcdb32eed99aa19d39e5d6ec45ba74dc4afec549f": {
      coingeckoId: "orcus-oru",
      decimals: 18,
    },
    "0xc5bcac31cf55806646017395ad119af2441aee37": {
      coingeckoId: "muuu",
      decimals: 18,
    },
    "0x6df98e5fbff3041105cb986b9d44c572a43fcd22": {
      coingeckoId: "alnair-finance-nika",
      decimals: 18,
    },
    "0x29F6e49c6E3397C3A84F715885F9F233A441165C": {
      coingeckoId: "origin-dollar",
      decimals: 18,
    },
    "0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af": {
      coingeckoId: "wmatic",
      decimals: 18,
    },
    "0x257f1a047948f73158dadd03eb84b34498bcdc60": {
      coingeckoId: "kagla-finance",
      decimals: 18,
    },
    "0xc4335b1b76fa6d52877b3046eca68f6e708a27dd": {
      coingeckoId: "starlay-finance",
      decimals: 18,
    },
    "0xde2578edec4669ba7f41c5d5d2386300bcea4678": {
      coingeckoId: "arthswap",
      decimals: 18,
    },
    "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c": {
      coingeckoId: "ethereum",
      decimals: 18,
    },
    "0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52": {
      coingeckoId: "binancecoin",
      decimals: 18,
    },
    "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4": {
      coingeckoId: "shiden",
      decimals: 18,
    },
    "0xad543f18cff85c77e140e3e5e3c3392f6ba9d5ca": {
      coingeckoId: "bitcoin",
      decimals: 8,
    },
    "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283": {
      coingeckoId: "tether",
      decimals: 6,
    },
    "0x430D50963d9635bBef5a2fF27BD0bDDc26ed691F": {
      coingeckoId: "tether",
      decimals: 6,
    },
    "0x19574c3c8fafc875051b665ec131b7e60773d2c9": {
      coingeckoId: "astar",
      decimals: 18,
    },
    "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720": {
      coingeckoId: "astar",
      decimals: 18,
    },
    "0xb361DAD0Cc1a03404b650A69d9a5ADB5aF8A531F": {
      coingeckoId: "emiswap",
      decimals: 18,
    },
    "0xC404E12D3466acCB625c67dbAb2E1a8a457DEf3c": {
      coingeckoId: "usd-coin",
      decimals: 6,
    }, // interest bearing USDC
    "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98": {
      coingeckoId: "usd-coin",
      decimals: 6,
    },
    "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb": {
      coingeckoId: "dai",
      decimals: 18,
    },
    "0x4dd9c468A44F3FEF662c35c1E9a6108B70415C2c": {
      coingeckoId: "dai",
      decimals: 18,
    },
    "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E": {
      coingeckoId: "binance-usd",
      decimals: 18,
    },
    "0xb7aB962c42A8Bb443e0362f58a5A43814c573FFb": {
      coingeckoId: "binance-usd",
      decimals: 18,
    },
    "0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35": {
      coingeckoId: "bai-stablecoin",
      decimals: 18,
    },
    "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF": {
      coingeckoId: "polkadot",
      decimals: 10,
    },
    "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB": {
      coingeckoId: "jpy-coin",
      decimals: 18,
    },
  };

  return fixBalances(balances, mapping);
}


function fixHPBBalances(balances) {
  const mapping = {
    "0xBE05Ac1FB417c9EA435b37a9Cecd39Bc70359d31": {
      coingeckoId: "high-performance-blockchain",
      decimals: 18
    }
  };

  return fixBalances(balances, mapping, { removeUnmapped: true });
}

async function transformAstarAddress() {
  return addr => addr; // we use fix balances instead
}

const cronosFixMapping = {
  "0x45c135c1cdce8d25a3b729a28659561385c52671": {
    coingeckoId: "alethea-artificial-liquid-intelligence-token",
    decimals: 18
  },
  "0x39a65a74dc5a778ff93d1765ea51f57bc49c81b3": {
    coingeckoId: "akash-network",
    decimals: 6
  },
  "0xbed48612bc69fa1cab67052b42a95fb30c1bcfee": {
    coingeckoId: "shiba-inu",
    decimals: 18
  },
  "0x1a8e39ae59e5556b56b76fcba98d22c9ae557396": {
    coingeckoId: "dogecoin",
    decimals: 8
  },
  "0xb888d8dd1733d72681b30c00ee76bde93ae7aa93": {
    coingeckoId: "cosmos",
    decimals: 6
  },
  "0x02dccaf514c98451320a9365c5b46c61d3246ff3": {
    coingeckoId: "dogelon-mars",
    decimals: 18
  },
};

async function transformDfkAddress() {
  const mapping = {
    "0xb57b60debdb0b8172bb6316a9164bd3c695f133a":
      "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // AVAX
    "0x3ad9dfe640e1a9cc1d9b0948620820d975c3803a":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" // USDC
  };
  return addr => mapping[addr.toLowerCase()] || `dfk:${addr.toLowerCase()}`;
}
async function transformAuroraAddress() {
  const mapping = {
    "0x0000000000000000000000000000000000000000":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // Aurora gas -> WETH
    "0xda2585430fef327ad8ee44af8f1f989a2a91a3d2":
      "0x853d955aCEf822Db058eb8505911ED77F175b99e", // FRAX
    "0x07379565cd8b0cae7c60dc78e7f601b34af2a21c":
      "0x6b175474e89094c44da98b954eedeac495271d0f", //  nUSD -> DAI
  };

  normalizeMapping(mapping)
  return addr => mapping[addr.toLowerCase()] || `aurora:${addr.toLowerCase()}`;
}

function transformNovachainAddress() {
  const mapping = {
    "0x0000000000000000000000000000000000000000":
      "fantom:0x69D17C151EF62421ec338a0c92ca1c1202A427EC", // SNT
    "0x657a66332a65b535da6c5d67b8cd1d410c161a08":
      "fantom:0x69D17C151EF62421ec338a0c92ca1c1202A427EC", // SNT
    "0x1f5396f254ee25377a5c1b9c6bff5f44e9294fff":
      "fantom:0x04068da6c83afcfa0e13ba15a6696662335d5b75" // USDC
  };

  return transformChainAddress(mapping, "nova", { skipUnmapped: true });
}


function fixGodwokenBalances(balances) {
  const mapping = {
    "0xC3b946c53E2e62200515d284249f2a91d9DF7954": {
      coingeckoId: "usd-coin",
      decimals: 6
    }, // Wrapped USDC (ForceBridge from Ethereum)
    "0xA21B19d660917C1DE263Ad040Ba552737cfcEf50": {
      coingeckoId: "usd-coin",
      decimals: 18
    }, // Wrapped USDC (ForceBridge from BSC)
    "0x07a388453944bB54BE709AE505F14aEb5d5cbB2C": {
      coingeckoId: "tether",
      decimals: 6
    }, // Wrapped USDT (ForceBridge from Ethereum)
    "0x5C30d9396a97f2279737E63B2bf64CC823046591": {
      coingeckoId: "tether",
      decimals: 18
    }, // Wrapped USDT (ForceBridge from BSC)
    "0x7818FA4C71dC3b60049FB0b6066f18ff8c720f33": {
      coingeckoId: "bitcoin",
      decimals: 8
    }, // Wrapped BTC (ForceBridge from Ethereum)
    "0x3f8d2b24C6fa7b190f368C3701FfCb2bd919Af37": {
      coingeckoId: "bitcoin",
      decimals: 18
    } // Wrapped BTC (ForceBridge from BSC)
  };

  return fixBalances(balances, mapping);
}

const wavesMapping = {
  "5UYBPpq4WoU5n4MwpFkgJnW3Fq4B1u3ukpK33ik4QerR": {
    coingeckoId: "binancecoin",
    decimals: 8
  },
  DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p: {
    coingeckoId: "neutrino",
    decimals: 6
  },
  Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on: {
    coingeckoId: "waves-exchange",
    decimals: 8
  },
  "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu": {
    coingeckoId: "ethereum",
    decimals: 8
  },
  "34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ": {
    coingeckoId: "tether",
    decimals: 6
  },
  "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS": {
    coingeckoId: "bitcoin",
    decimals: 8
  },
  WAVES: { coingeckoId: "waves", decimals: 8 },
  "2Fh9m3dNQXycHdnytEaETN3P1gDT7ij5U4HjMqQBeaqN": {
    coingeckoId: "ftx-token",
    decimals: 8
  },
  "4GZH8rk5vDmMXJ81Xqfm3ovFaczqMnQ11r7aELiNxWBV": {
    coingeckoId: "fantom",
    decimals: 8
  },
  "3KhNcHo4We1G5EWps7b1e5DTdLgWDzctc8S6ynu37KAb": {
    coingeckoId: "curve-dao-token",
    decimals: 8
  },
  GVxGPBtgVWMW1wHiFnfaCakbJ6sKgZgowJgW5Dqrd7JH: {
    coingeckoId: "shiba-inu",
    decimals: 2
  },
  HcHacFH51pY91zjJa3ZiUVWBww54LnsL4EP3s7hVGo9L: {
    coingeckoId: "matic-network",
    decimals: 8
  },
  "4YmM7mj3Av4DPvpNpbtK4jHbpzYDcZuY6UUnYpqTbzLj": {
    coingeckoId: "uniswap",
    decimals: 8
  },
  "6QUVF8nVVVvM7do7JT2eJ5o5ehnZgXUg13ysiB9JiQrZ": {
    coingeckoId: "terra-luna",
    decimals: 8
  },
  "7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt": {
    coingeckoId: "aave",
    decimals: 8
  },
  E4rss7qLUcawCvD2uMrbLeTMPGkX15kS3okWCbUhLNKL: {
    coingeckoId: "maker",
    decimals: 8
  },
  HLckRcg7hJ3Syf3PrGftFijKqQMJipf81WY3fwvHCJbe: {
    coingeckoId: "crypto-com-chain",
    decimals: 8
  },
  "8zUYbdB8Q6mDhpcXYv52ji8ycfj4SDX4gJXS7YY3dA4R": {
    coingeckoId: "dai",
    decimals: 6
  },
  "8DLiYZjo3UUaRBTHU7Ayoqg4ihwb6YH1AfXrrhdjQ7K1": {
    coingeckoId: "binance-usd",
    decimals: 6
  },
  "47cyc68FWJszCWEwMWVsD9CadjS2M1XtgANuRGbEW8UH": {
    coingeckoId: "cosmos",
    decimals: 8
  },
  "2bbGhKo5C31iEiB4CwGuqMYwjD7gCA9eXmm51fe2v8vT": {
    coingeckoId: "chainlink",
    decimals: 8
  },
  BLRxWVJWaVuR2CsCoTvTw2bDZ3sQLeTbCofcJv7dP5J4: {
    coingeckoId: "yearn-finance",
    decimals: 8
  },
  A1uMqYTzBdakuSNDv7CruWXP8mRZ4EkHwmip2RCauyZH: {
    coingeckoId: "the-graph",
    decimals: 8
  },
  "2thtesXvnVMcCnih9iZbJL3d2NQZMfzENJo8YFj6r5jU": {
    coingeckoId: "terrausd",
    decimals: 6
  },
  "2GBgdhqMjUPqreqPziXvZFSmDiQVrxNuGxR1z7ZVsm4Z": {
    coingeckoId: "apecoin",
    decimals: 8
  },
  Aug9ccbPApb1hxXSue8fHuvbyMf1FV1BYBtLUuS5LZnU: {
    coingeckoId: "decentraland",
    decimals: 8
  },
  ATQdLbehsMrmHZLNFhUm1r6s14NBT5JCFcSJGpaMrkAr: {
    coingeckoId: "axie-infinity",
    decimals: 8
  },
  "8YyrMfuBdZ5gtMWkynLTveRvGb6LJ4Aff9rpz46UUMW": {
    coingeckoId: "the-sandbox",
    decimals: 8
  },
  EfwRV6MuUCGgAUchdsF4dDFnSpKrDW3UYshdaDy4VBeB: {
    coingeckoId: "enjincoin",
    decimals: 8
  },
  "5zoDNRdwVXwe7DveruJGxuJnqo7SYhveDeKb8ggAuC34": {
    coingeckoId: "wrapped-bitcoin",
    decimals: 8
  },
  DSbbhLsSTeDg5Lsiufk2Aneh3DjVqJuPr2M9uU1gwy5p: {
    coingeckoId: "vires-finance",
    decimals: 8
  },
  // 'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS': { coingeckoId: 'duck-egg', decimals: 8, },  // fix this with right coin gecko id
  "4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8": {
    coingeckoId: "waves-enterprise",
    decimals: 8
  },
  // 'HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS': { coingeckoId: 'puzzle', decimals: 8, },  // fix this with right coin gecko id
  // 'D4TPjtzpsDEJFS1pUAkvh1tJJJMNWGcSrds9sveBoQka': { coingeckoId: 'race', decimals: 8, },
  // '3UHgFQECoynwC3iunYBnbhzmcCzC5gVnVZMv8Yw1bneK': { coingeckoId: 'east', decimals: 8, },
  "6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g": {
    coingeckoId: "neutrino-system-base-token",
    decimals: 8
  },
  // 'DUk2YTxhRoAqMJLus4G2b3fR8hMHVh6eiyFx5r29VR6t': { coingeckoId: 'neutrino eur', decimals: 8, },
  Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT: {
    coingeckoId: "swop",
    decimals: 6
  },
  "7LMV3s1J4dKpMQZqge5sKYoFkZRLojnnU49aerqos4yg": {
    coingeckoId: "enno-cash",
    decimals: 8
  },
  "9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y": {
    coingeckoId: "signaturechain",
    decimals: 8
  },
  DHgwrRvVyqJsepd32YbBqUeDH4GJ1N984X8QoekjgH8J: {
    coingeckoId: "waves-community-token",
    decimals: 2
  },
  // 'AbunLGErT5ctzVN8MVjb4Ad9YgjpubB8Hqb17VxzfAck': { coingeckoId: 'Waves World', decimals: 0, },
  HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk: {
    coingeckoId: "litecoin",
    decimals: 8
  },
  "6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ": {
    coingeckoId: "usd-coin",
    decimals: 6
  }
};

function fixWavesBalances(balances) {
  return fixBalances(balances, wavesMapping);
}

function fixTezosBalances(balances) {
  const mapping = {
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: { coingeckoId: "tzbtc", decimals: 8 },
    tezos: { coingeckoId: "tezos", decimals: 0 },
    KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b: {
      coingeckoId: "plenty-dao",
      decimals: 18
    },
    KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4: { coingeckoId: "tezos", decimals: 6 }, // this is ctez, ideally should be valued higher
    KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8: {
      coingeckoId: "dogami",
      decimals: 5
    },
    KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH: {
      coingeckoId: "kolibri-dao",
      decimals: 18
    },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-19": {
      coingeckoId: "wrapped-bitcoin",
      decimals: 8
    },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-17": {
      coingeckoId: "usd-coin",
      decimals: 6
    },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-1": {
      coingeckoId: "binance-usd",
      decimals: 18
    },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-20": {
      coingeckoId: "ethereum",
      decimals: 18
    },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-5": {
      coingeckoId: "dai",
      decimals: 18
    },
    KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ: { coingeckoId: "aave", decimals: 18 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-18": {
      coingeckoId: "tether",
      decimals: 6
    },
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: {
      coingeckoId: "kolibri-usd",
      decimals: 18
    },
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: {
      coingeckoId: "usdtez",
      decimals: 6
    },
    KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW: {
      coingeckoId: "youves-uusd",
      decimals: 12
    },
    // 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-1': { coingeckoId: 'youves-you-defi', decimals: 12, },  //uDEFI token - update gecko id here after adding in coin geckp
    KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL: {
      coingeckoId: "youves-you-governance",
      decimals: 12
    },
    "KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-2": {
      coingeckoId: "wrapped-bitcoin",
      decimals: 12
    }, // youves BTC
    KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY: {
      coingeckoId: "ethereum",
      decimals: 18
    }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-0": {
      coingeckoId: "ethereum",
      decimals: 18
    }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-1": {
      coingeckoId: "wrapped-bitcoin",
      decimals: 8
    }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-2": {
      coingeckoId: "usd-coin",
      decimals: 6
    }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-3": {
      coingeckoId: "tether",
      decimals: 6
    }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-4": {
      coingeckoId: "matic-network",
      decimals: 18
    }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-5": {
      coingeckoId: "chainlink",
      decimals: 18
    }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-6": {
      coingeckoId: "dai",
      decimals: 18
    }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-7": {
      coingeckoId: "binance-usd",
      decimals: 18
    } // plenty bridge
  };

  return fixBalances(balances, mapping);
}

const songbirdFixMapping = {
  "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED": {
    coingeckoId: "songbird",
    decimals: 18
  },
  "0xC348F894d0E939FE72c467156E6d7DcbD6f16e21": {
    coingeckoId: "flare-finance",
    decimals: 18
  },
  "0x70Ad7172EF0b131A1428D0c1F66457EB041f2176": {
    coingeckoId: "canary-dollar",
    decimals: 18
  }
};

const smartbchFixMapping = {
  [nullAddress]: {
    coingeckoId: "bitcoin-cash",
    decimals: 18
  },
  "0x3743ec0673453e5009310c727ba4eaf7b3a1cc04": {
    coingeckoId: "bitcoin-cash",
    decimals: 18
  },
  "0x0b00366fBF7037E9d75E4A569ab27dAB84759302": {
    coingeckoId: "law",
    decimals: 18
  },
  "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72": {
    coingeckoId: "flex-usd",
    decimals: 18
  },
  "0x24d8d5Cbc14FA6A740c3375733f0287188F8dF3b": {
    coingeckoId: "tropical-finance",
    decimals: 18
  },
  "0xBc2F884680c95A02cea099dA2F524b366d9028Ba": {
    coingeckoId: "tether",
    decimals: 18
  },
};

const evmosFixMapping = {
  "0x3F75ceabcdfed1aca03257dc6bdc0408e2b4b026": {
    coingeckoId: "diffusion",
    decimals: 18
  },
  "0xd4949664cd82660aae99bedc034a0dea8a0bd517": {
    coingeckoId: "evmos",
    decimals: 18
  }
};

const energywebFixMapping = {
  "0x6b3bd0478DF0eC4984b168Db0E12A539Cc0c83cd": {
    coingeckoId: "energy-web-token",
    decimals: 18
  }
};

const bittorrentFixMapping = {
  "0xca424b845497f7204d9301bd13ff87c0e2e86fcf": {
    coingeckoId: "usd-coin",
    decimals: 18
  },
  "0x9b5f27f6ea9bbd753ce3793a07cba3c74644330d": {
    coingeckoId: "tether",
    decimals: 18
  },
  "0x23181f21dea5936e24163ffaba4ea3b316b57f3c": {
    coingeckoId: 'bittorrent',
    decimals: 18,
  },
  "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR": {
    coingeckoId: 'tron',
    decimals: 6,
  }
};

const syscoinFixMapping = {
  "0xd3e822f3ef011Ca5f17D82C956D952D8d7C3A1BB": {
    coingeckoId: "syscoin",
    decimals: 18
  }
};

const kavaFixMapping = {
  "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b": {
    coingeckoId: "kava",
    decimals: 18
  },
  "0x332730a4F6E03D9C55829435f10360E13cfA41Ff": {
    coingeckoId: "binance-usd",
    decimals: 18
  },
  "0x65e66a61D0a8F1e686C2D6083ad611a10D84D97A": {
    coingeckoId: "binancecoin",
    decimals: 18
  },
  "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f": {
    coingeckoId: "usd-coin",
    decimals: 6
  },
  "0xB44a9B6905aF7c801311e8F4E76932ee959c663C": {
    coingeckoId: "tether",
    decimals: 6
  },
  "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b": {
    coingeckoId: "bitcoin",
    decimals: 8
  },
  "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D": {
    coingeckoId: "ethereum",
    decimals: 18
  },
  "0x765277EebeCA2e31912C9946eAe1021199B39C61": {
    coingeckoId: "dai",
    decimals: 18
  }
};

function normalizeMapping(mapping) {
  Object.keys(mapping).forEach(
    key => (mapping[key.toLowerCase()] = mapping[key])
  );
}

function fixBalances(balances, mapping, { removeUnmapped = false } = {}) {
  normalizeMapping(mapping);

  Object.keys(balances).forEach(token => {
    const tokenKey = stripTokenHeader(token).toLowerCase();
    const { coingeckoId, decimals } = mapping[tokenKey] || {};
    if (!coingeckoId) {
      if (removeUnmapped && tokenKey.startsWith('0x')) {
        console.log(
          `Removing token from balances, it is not part of whitelist: ${tokenKey}`
        );
        delete balances[token];
      }
      return;
    }
    const currentBalance = balances[token];
    delete balances[token];
    sdk.util.sumSingleBalance(
      balances,
      coingeckoId,
      +BigNumber(currentBalance).shiftedBy(-1 * decimals)
    );
  });

  return balances;
}

function stripTokenHeader(token) {
  token = token.toLowerCase();
  return token.indexOf(":") > -1 ? token.split(":")[1] : token;
}

async function getFixBalances(chain) {
  const dummyFn = i => i;
  return fixBalancesMapping[chain] || dummyFn;
}

const energiFixMapping = {
  "0x7A86173daa4fDA903c9A4C0517735a7d34B9EC39": {
    coingeckoId: "energi",
    decimals: 18
  },
  "0xa55f26319462355474a9f2c8790860776a329aa4": {
    coingeckoId: "energi",
    decimals: 18
  }
};

const palmFixMapping = {
  "0x4c1f6fcbd233241bf2f4d02811e3bf8429bc27b8": {
    coingeckoId: "dai",
    decimals: 18
  },
  "0x726138359c17f1e56ba8c4f737a7caf724f6010b": {
    coingeckoId: "ethereum",
    decimals: 18
  }
};

const ethereumFixMapping = {
  "0xf6b1c627e95bfc3c1b4c9b825a032ff0fbf3e07d": {
    coingeckoId: "jpyc",
    decimals: 18
  },
  "0x97fe22e7341a0cd8db6f6c021a24dc8f4dad855f": {
    coingeckoId: "jarvis-synthetic-british-pound",
    decimals: 18
  },
  "0x0f83287ff768d1c1e17a42f44d644d7f22e8ee1d": {
    coingeckoId: "upper-swiss-franc",
    decimals: 18
  },
  "0x9fcf418b971134625cdf38448b949c8640971671": {
    coingeckoId: "tether-eurt",
    decimals: 18
  },
  "0x8751d4196027d4e6da63716fa7786b5174f04c15": {
    coingeckoId: "wrapped-bitcoin",
    decimals: 18
  }
};

const sxFixMapping = {
  "0x90d27E008d5Db7f0a3c90a15A8Dcc4Ca18cFc670": {
    coingeckoId: "sx-network",
    decimals: 18
  },
  "0xA173954Cc4b1810C0dBdb007522ADbC182DaB380": {
    coingeckoId: "ethereum",
    decimals: 18
  },
  "0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e": {
    coingeckoId: "usd-coin",
    decimals: 6
  },
  "0xfa6F64DFbad14e6883321C2f756f5B22fF658f9C": {
    coingeckoId: "matic-network",
    decimals: 18
  },
  "0x53813CD4aCD7145A716B4686b195511FA93e4Cb7": {
    coingeckoId: "dai",
    decimals: 18
  },
  "0xa0cB58E7F783fce0F4042C790ea3045c48CD51e8": {
    coingeckoId: "shark",
    decimals: 18
  }
};

const meterFixMapping = {
  "0xd86e243fc0007e6226b07c9a50c9d70d78299eb5": {
    coingeckoId: "usd-coin",
    decimals: 6
  },
  "0x5729cb3716a315d0bde3b5e489163bf8b9659436": {
    coingeckoId: "meter",
    decimals: 18
  },
  "0x6abaedab0ba368f1df52d857f24154cc76c8c972": {
    coingeckoId: "meter-stable",
    decimals: 18
  },
  "0x24aa189dfaa76c671c279262f94434770f557c35": {
    coingeckoId: "binance-usd",
    decimals: 18
  },
  "0x5fa41671c48e3c951afc30816947126ccc8c162e": {
    coingeckoId: "tether",
    decimals: 6
  }
};

const callistoFixMapping = {
  "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a": {
    coingeckoId: "callisto",
    decimals: 18
  },
  "0xbf6c50889d3a620eb42c0f188b65ade90de958c4": {
    coingeckoId: "tether",
    decimals: 18
  },
  "0xccc766f97629a4e14b3af8c91ec54f0b5664a69f": {
    coingeckoId: "ethereum-classic",
    decimals: 18
  },
  "0xcc208c32cc6919af5d8026dab7a3ec7a57cd1796": {
    coingeckoId: "ethereum",
    decimals: 18
  },
  "0xccde29903e621ca12df33bb0ad9d1add7261ace9": {
    coingeckoId: "binancecoin",
    decimals: 18
  },
  "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65": {
    coingeckoId: "soy-finance",
    decimals: 18
  },
};

const thundercoreFixMapping = {
  "0x4f3c8e20942461e2c3bdd8311ac57b0c222f2b82": {
    coingeckoId: "tether",
    decimals: 6
  },
  "0x22e89898a04eaf43379beb70bf4e38b1faf8a31e": {
    coingeckoId: "usd-coin",
    decimals: 6
  },
};

const ontologyFixMapping = {
  "0xd8bc24cfd45452ef2c8bc7618e32330b61f2691b": {
    coingeckoId: "ong",
    decimals: 18,
  },
};

const fixBalancesMapping = {
  avax: fixAvaxBalances,
  evmos: b => fixBalances(b, evmosFixMapping, { removeUnmapped: false }),
  astar: fixAstarBalances,
  shiden: fixShidenBalances,
  cronos: b => fixBalances(b, cronosFixMapping, { removeUnmapped: false }),
  tezos: fixTezosBalances,
  harmony: fixHarmonyBalances,
  hpb: fixHPBBalances,
  godwoken: fixGodwokenBalances,
  klaytn: fixKlaytnBalances,
  waves: fixWavesBalances,
  songbird: b => fixBalances(b, songbirdFixMapping, { removeUnmapped: true }),
  energi: b => fixBalances(b, energiFixMapping, { removeUnmapped: true }),
  smartbch: b => fixBalances(b, smartbchFixMapping, { removeUnmapped: true }),
  energyweb: b => fixBalances(b, energywebFixMapping, { removeUnmapped: true }),
  palm: b => fixBalances(b, palmFixMapping, { removeUnmapped: true }),
  oasis: fixOasisBalances,
  bittorrent: b =>
    fixBalances(b, bittorrentFixMapping, { removeUnmapped: false }),
  syscoin: b => fixBalances(b, syscoinFixMapping, { removeUnmapped: true }),
  kava: b => fixBalances(b, kavaFixMapping, { removeUnmapped: false }),
  ethereum: b => fixBalances(b, ethereumFixMapping, { removeUnmapped: false }),
  sx: b => fixBalances(b, sxFixMapping, { removeUnmapped: true }),
  meter: b => fixBalances(b, meterFixMapping, { removeUnmapped: true }),
  callisto: b => fixBalances(b, callistoFixMapping, { removeUnmapped: true }),
  near: b => fixBalances(b, nearFixMapping, { removeUnmapped: false }),
  thundercore: b => fixBalances(b, thundercoreFixMapping, { removeUnmapped: true }),
  ontology_evm: b => fixBalances(b, ontologyFixMapping, { removeUnmapped: false }),
};

const chainTransforms = {
  astar: transformAstarAddress,
  fuse: transformFuseAddress,
  celo: transformCeloAddress,
  cronos: transformCronosAddress,
  evmos: transformEvmosAddress,
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
  aurora: transformAuroraAddress,
  findora: transformFindoraAddress,
  bittorrent: transformBittorrentAddress,
  reichain: transformReichainAddress,
  nova: transformNovachainAddress,
};

async function transformReichainAddress() {
  const mapping = {
    "0xDD2bb4e845Bd97580020d8F9F58Ec95Bf549c3D9":
      "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // killswitch busd -> busd token
    "0xf8ab4aaf70cef3f3659d3f466e35dc7ea10d4a5d":
      "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" // killswitch bnb -> bnb token
  };

  return transformChainAddress(mapping, "reichain", { skipUnmapped: true });
}

async function transformEthereumAddress() {
  const mapping = {
    "0x88536c9b2c4701b8db824e6a16829d5b5eb84440":
      "polygon:0xac63686230f64bdeaf086fe6764085453ab3023f", // USV token
    "0xFEEf77d3f69374f66429C91d732A244f074bdf74":
      "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", // CVX FXS token
    "0xb8c77482e45f1f44de1745f52c74426c631bdd52":
      "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BNB
    "0xeb637a9ab6be83c7f8c79fdaa62e1043b65534f0":
      "heco:0xcbd6cb9243d8e3381fea611ef023e17d1b7aedf0", // BXH
    "0x18a1ea69a50a85752b7bc204a2c45a95ce6e429d":
      "avax:0xf30c5083a1479865c9a8916dec6ddadd82e8907b", // SPICE
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // ETH -> WETH
    "0x18084fbA666a33d37592fA2633fD49a74DD93a88":
      "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa", //tBTC
    "0xef779cf3d260dbe6177b30ff08b10db591a6dd9c":
      "0x0000000000085d4780B73119b644AE5ecd22b376", // kUSD
    "0x42ef9077d8e79689799673ae588e046f8832cb95":
      "0x0000000000085d4780B73119b644AE5ecd22b376", //fUSD
    "0x99534ef705df1fff4e4bd7bbaaf9b0dff038ebfe":
      "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", // aMATICb
    "0xd3d13a578a53685b4ac36a1bab31912d2b2a2f36":
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // tWETH
    "0x94671a3cee8c7a12ea72602978d1bb84e920efb2":
      "0x853d955aCEf822Db058eb8505911ED77F175b99e", // tFRAX
    "0x2fc6e9c1b2c07e18632efe51879415a580ad22e1":
      "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197", // tGAMMA
    "0xeff721eae19885e17f5b80187d6527aad3ffc8de":
      "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", // tSNX
    "0xdc0b02849bb8e0f126a216a2840275da829709b0":
      "0x4104b135dbc9609fc1a9490e61369036497660c8", // tAPW
    "0x15a629f0665a3eb97d7ae9a7ce7abf73aeb79415":
      "0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050", // tTCR
    "0x808d3e6b23516967ceae4f17a5f9038383ed5311":
      "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d", // tFOX
    "0xf49764c9c5d644ece6ae2d18ffd9f1e902629777":
      "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", // tSUSHI
    "0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84":
      "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF", // tALCX
    "0xadf15ec41689fc5b6dca0db7c53c9bfe7981e655":
      "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0", // tFXS
    "0xc7d9c108d4e1dd1484d3e2568d7f74bfd763d356":
      "0x0000000000085d4780B73119b644AE5ecd22b376", // XSTUSD
    "0x65f7ba4ec257af7c55fd5854e5f6356bbd0fb8ec":
      "0x92d6c1e31e14520e676a687f0a93788b716beff5", // sDYDX
    "0x586aa273f262909eef8fa02d90ab65f5015e0516":
      "0x0000000000085d4780B73119b644AE5ecd22b376", // FIAT
    "0x0a5e677a6a24b2f1a2bf4f3bffc443231d2fdec8":
      "bsc:0xb5102cee1528ce2c760893034a4603663495fd72", // USX
  };
  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
    return mapping[addr] || addr;
  };
}

function transformBittorrentAddress() {
  const mapping = {
    "0xdb28719f7f938507dbfe4f0eae55668903d34a15":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0x935faa2fcec6ab81265b301a30467bbc804b43d3":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0x8d193c6efa90bcff940a98785d1ce9d093d3dc8a":
      "0xc669928185dbce49d2230cc9b0979be6dc797957", // BTT
    "0x17f235fd5974318e4e2a5e37919a209f7c37a6d1":
      "0x0c10bf8fcb7bf5412187a595ab97a3609160b5c6", // USDD
    "0xae17940943ba9440540940db0f1877f101d39e8b":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0xedf53026aea60f8f75fca25f8830b7e2d6200662":
      "tron:TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR", // TRX
    "0x1249c65afb11d179ffb3ce7d4eedd1d9b98ad006":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0xe887512ab8bc60bcc9224e1c3b5be68e26048b8b":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0xe467f79e9869757dd818dfb8535068120f6bcb97":
      "0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202", // KNC
    "0x9888221fe6b5a2ad4ce7266c7826d2ad74d40ccf":
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" // WBTC
  };
  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
    return mapping[addr] || addr;
  };
}

async function transformMilkomedaAddress() {
  const mapping = {
    "0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52":
      "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BNB token
    // '0x0000000000000000000000000000000000000000': '' // MilkADA
    "0x5950F9B6EF36f3127Ea66799e64D0ea1f5fdb9D1":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0x41eAFC40CD5Cb904157A10158F73fF2824dC1339":
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0xab58DA63DFDd6B97EAaB3C94165Ef6f43d951fb2":
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0x5a955FDdF055F2dE3281d99718f5f1531744B102":
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0x48AEB7584BA26D3791f06fBA360dB435B3d7A174":
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" // WBTC
  };

  return transformChainAddress(mapping, "milkomeda");
}

async function transformFindoraAddress() {
  const mapping = {
    "0xABc979788c7089B516B8F2f1b5cEaBd2E27Fd78b":
      "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BNB token
    "0x008A628826E9470337e0Cd9c0C944143A83F32f3":
      "bsc:0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH token
    "0x93EDFa31D7ac69999E964DAC9c25Cd6402c75DB3":
      "bsc:0x55d398326f99059ff775485246999027b3197955", // USDT token
    "0xdA33eF1A7b48beBbF579eE86DFA735a9529C4950":
      "bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC token
    "0xE80EB4a234f718eDc5B76Bb442653827D20Ebb2d":
      "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD token
    "0x07EfA82E00E458ca3D53f2CD5B162e520F46d911":
      "bsc:0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c" //  WBTC token
  };

  return transformChainAddress(mapping, "findora");
}

function transformChainAddress(
  mapping,
  chain,
  { skipUnmapped = false, chainName = "" } = {}
) {
  normalizeMapping(mapping);

  return addr => {
    addr = addr.toLowerCase();
    if (!mapping[addr] && skipUnmapped) {
      console.log(
        "Mapping for addr %s not found in chain %s, returning garbage address",
        addr,
        chain
      );
      return "0x1000000000000000000000000000000000000001";
    }
    return mapping[addr] || `${chain}:${addr}`;
  };
}

async function getChainTransform(chain) {
  if (chainTransforms[chain]) return chainTransforms[chain]();

  return addr => `${chain}:${addr}`;
}

module.exports = {
  getChainTransform,
  getFixBalances,
  transformCeloAddress,
  transformCronosAddress,
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
  fixBscBalances,
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
  transformEvmosAddress,
  wavesMapping,
  stripTokenHeader,
  transformBittorrentAddress,
  transformAuroraAddress
};
