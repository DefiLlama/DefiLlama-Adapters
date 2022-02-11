const { sumTokens, unwrapUniswapLPs } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { BigNumber } = require("bignumber.js");
const { fixHarmonyBalances } = require("../helper/portedTokens");

const translateTokens = {
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
  "0x0665ef3556520b21368754fb644ed3ebf1993ad4": "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490"
}

async function handleMooTokens(balances, block, chain, tokens) {
  let balance = (
    await sdk.api.abi.multiCall({
      calls: tokens.map((p) => ({
        target: p[0],
        params: p[1],
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let pricePerShare = (
    await sdk.api.abi.multiCall({
      calls: tokens.map((p) => ({
        target: p[0],
      })),
      abi: abi.getPricePerFullShare,
      block,
      chain,
    })
  ).output;
  for (let i = 0; i < balance.length; i++) {
    let addr = balance[i].input.target.toLowerCase();
    if (translateTokens[addr] !== null) {
      addr =  translateTokens[addr];
    } else {
      addr = `${chain}:${addr}`;
    }
    sdk.util.sumSingleBalance(
      balances,
      addr,
      BigNumber(balance[i].output)
        .times(pricePerShare[i].output).div(1e18)
        .toFixed(0)
    );
  }
}

async function handleMooLPs(balances, block, chain, tokens) {
  let lpBalances = (
    await sdk.api.abi.multiCall({
      calls: tokens.map((p) => ({
        target: p[1],
        params: p[0],
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let pricePerShare = (
    await sdk.api.abi.multiCall({
      calls: tokens.map((p) => ({
        target: p[1],
      })),
      abi: abi.getPricePerFullShare,
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  for (let i = 0; i < tokens.length; i++) {
    lpPositions.push({
      balance: BigNumber(lpBalances[i].output)
        .times(pricePerShare[i].output).div(1e18)
        .toFixed(0),
      token: tokens[i][2],
    });
  }
  await unwrapUniswapLPs(balances, lpPositions, block, chain, (addr) => {
    return `${chain}:${addr}`;
  });
}

async function polygon(timestamp, block, chainBlocks) {
  const balances = {};
  await sumTokens(
    balances,
    [
      // vaults
      [
        "0x1a13f4ca1d028320a707d99520abfefca3998b7f",
        "0x22965e296d9a0Cd0E917d6D70EF2573009F8a1bB",
      ], //amUSDC
      [
        "0x27f8d03b3a2196956ed754badc28d73be8830a6e",
        "0xE6C23289Ba5A9F0Ef31b8EB36241D5c800889b7b",
      ], //amDAI
      [
        "0x28424507fefb6f7f8e9d3860f56504e4e5f5f390",
        "0x0470CD31C8FcC42671465880BA81D631F0B76C1D",
      ], //amWETH
      [
        "0x60d55f02a771d515e077c9c2403a1ef324885cec",
        "0xB3911259f435b28EC072E4Ff6fF5A2C604fea0Fb",
      ], //amUSDT
      [
        "0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4",
        "0x7068Ea5255cb05931EFa8026Bd04b18F3DeB8b0B",
      ], //amMATIC
      [
        "0x1d2a0e5ec8e5bbdca5cb219e649b565d8e5c3360",
        "0xeA4040B21cb68afb94889cB60834b13427CFc4EB",
      ], //amAAVE
      [
        "0x5c2ed810328349100a66b82b78a1791b101c9d61",
        "0xBa6273A78a23169e01317bd0f6338547F869E8Df",
      ], // amWBTC
      // anchor
      [
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "0x947D711C25220d8301C087b25BA111FE8Cbf6672",
      ], //USDC
      [
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        "0xa4742A65f24291AA421497221AaF64c70b098d98",
      ], //USDT
      [
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
        "0x6062E92599a77E62e0cC9749261eb2eaC3aBD44F",
      ], //DAI
      // mai vaults
      [
        "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
        "0x3fd939B017b31eaADF9ae50C7fF7Fa5c0661d47C",
      ], // weth
      [
        "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
        "0x61167073E31b1DAd85a3E531211c7B8F1E5cAE72",
      ], // link
      [
        "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
        "0x87ee36f780ae843A78D5735867bc1c13792b7b11",
      ], // aave
      [
        "0x172370d5cd63279efa6d502dab29171933a610af",
        "0x98B5F32dd9670191568b661a3e847Ed764943875",
      ], // crv
      [
        "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
        "0x37131aEDd3da288467B6EBe9A77C523A700E6Ca1",
      ], // wbtc
      [
        "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3",
        "0x701A1824e5574B0b6b1c8dA808B184a7AB7A2867",
      ], //bal
      [
        "0xf28164a485b0b2c90639e47b0f377b4a438a16b1",
        "0x649Aa6E6b6194250C077DF4fB37c23EE6c098513",
      ], //dquick
      [
        "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7",
        "0xF086dEdf6a89e7B16145b03a6CB0C0a9979F1433",
      ],
      [
        "0x1a3acf6d19267e2d3e7f898f42803e90c9219062",
        "0xff2c44fb819757225a176e825255a01b3b8bb051",
      ],
    ],
    chainBlocks.polygon,
    "polygon",
    (addr) => `polygon:${addr}`
  );
  balances["polygon:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"] = (
    await sdk.api.eth.getBalance({
      target: "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
      block: chainBlocks.polygon,
      chain: "polygon",
    })
  ).output;

  balances['avax:0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664'] = (
    await sdk.api.erc20.balanceOf({
      target: "0x7d60F21072b585351dFd5E8b17109458D97ec120",
      owner: "0x57cbf36788113237d64e46f25a88855c3dff1691",
      block: chainBlocks.polygon,
      chain: "polygon",
    })
  ).output / 10 ** 12;
  return balances;
}

async function fantom(timestamp, block, chainBlocks) {
  const balances = {};
  const chain = "fantom";
  await sumTokens(
    balances,
    [
      [
        "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
        "0x1066b8FC999c1eE94241344818486D5f944331A0",
      ],
      [
        "0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0",
        "0x7efB260662a6FA95c1CE1092c53Ca23733202798",
      ],
      [
        "0x637eC617c86D24E421328e6CAEa1d92114892439",
        "0x682E473FcA490B0adFA7EfE94083C1E63f28F034",
      ],
      [
        "0x74b23882a30290451A17c44f4F05243b6b58C76d",
        "0xD939c268C49c442F037E968F045ba02f499562D4",
      ],
      [
        "0x321162Cd933E2Be498Cd2267a90534A804051b11",
        "0xE5996a2cB60eA57F03bf332b5ADC517035d8d094",
      ],
      [
        "0xae75A438b2E0cB8Bb01Ec1E1e376De11D44477CC",
        "0x267bDD1C19C932CE03c7A62BBe5b95375F9160A6",
      ],
      [
        "0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8",
        "0xd6488d586E8Fcd53220e4804D767F19F5C846086",
      ],
      [
        "0x6a07A792ab2965C72a5B8088d3a069A7aC3a993B",
        "0xdB09908b82499CAdb9E6108444D5042f81569bD9",
      ],
      [
        "0x49c68edb7aebd968f197121453e41b8704acde0c",
        "0x3609A304c6A41d87E895b9c1fd18c02ba989Ba90",
      ],
      [
        "0x0a03d2c1cfca48075992d810cc69bd9fe026384a",
        "0xC1c7eF18ABC94013F6c58C6CdF9e829A48075b4e",
      ],
      [
        "0x97927abfe1abbe5429cbe79260b290222fc9fbba",
        "0x5563Cc1ee23c4b17C861418cFF16641D46E12436",
      ],
      [
        "0x6dfe2aaea9daadadf0865b661b53040e842640f8",
        "0x8e5e4D08485673770Ab372c05f95081BE0636Fa2",
      ],
      [
        "0x920786cff2a6f601975874bb24c63f0115df7dc8",
        "0xBf0ff8ac03f3E0DD7d8faA9b571ebA999a854146",
      ],
      [
        "0x6c021Ae822BEa943b2E66552bDe1D2696a53fbB7",
        "0x051b82448a521bC32Ac7007a7A76F9dEC80F6BA2"
      ],
      [
        "0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37",
        "0xD60FBaFc954Bfbd594c7723C980003c196bDF02F"
      ],
      [
        "0x5cc61a78f164885776aa610fb0fe1257df78e59b",
        "0xCB99178C671761482097F32595cb79fb28a49Fd8"
      ]
      //[t,p],
      
    ],
    chainBlocks[chain],
    chain,
    (addr) => {
      addr = addr.toLowerCase();
      if (translateTokens[addr] !== undefined) {
        return translateTokens[addr];
      }
      return `${chain}:${addr}`;
    }
  );
  const ftmMooTokens = [
    [
      "0xbf07093ccd6adfc3deb259c557b61e94c1f66945",
      "0x75D4aB6843593C111Eeb02Ff07055009c836A1EF",
    ]
  ];
  await handleMooTokens(balances, chainBlocks.fantom, chain, ftmMooTokens);
  const ftmLPs = [
    //Vault, token, LP
    [
      "0x9BA01B1279B1F7152b42aCa69fAF756029A9ABDe",
      "0x2a30C5e0d577108F694d2A96179cd73611Ee069b",
      "0xf0702249F4D3A25cD3DED7859a165693685Ab577",
    ],
    [
      "0xF34e271312e41Bbd7c451B76Af2AF8339D6f16ED",
      "0xA3e3Af161943CfB3941B631676134bb048739727",
      "0xFdb9Ab8B9513Ad9E419Cf19530feE49d412C3Ee3",
    ],
    [
      "0xB595C02147bCEDE84e0E85D9e95727cF38C02b07",
      "0xee3a7c885fd3cc5358ff583f2dab3b8bc473316f",
      "0xEc7178F4C41f346b2721907F5cF7628E388A7a58"
    ],
    [
      "0x3F4f523ACf811E713e7c34852b24E927D773a9e5",
      "0x27c77411074ba90ca35e6f92a79dad577c05a746",
      "0x2a651563c9d3af67ae0388a5c8f89b867038089e"
    ],
    [
      "0x872C847056e11cF75D1D9636b522D077E8C9F653",
      "0xae94e96bf81b3a43027918b138b71a771d381150",
      "0x4733bc45eF91cF7CcEcaeeDb794727075fB209F2"
    ],
    [
      "0x413f1815D32e5aca0d8984FA89e50E83dDac0BBE",
      "0x5d2EF803D6e255eF4D1c66762CBc8845051B54dB",
      "0x9606d683d03f012dda296ef0ae9261207c4a5847"
    ],
    [
      "0x03c20569c2c78CD48f491415a4cDEAC02608DB7e",
      "0xA4e2EE5a7fF51224c27C98098D8DB5C770bAAdbE",
      "0xe7e90f5a767406eff87fdad7eb07ef407922ec1d"
    ],
    [
      "0xD3af91f21F791F29FC664cD5cD61180edc263191",
      "0xD8dd2EA228968F7f043474Db610A20aF887866c7",
      "0xd14dd3c56d9bc306322d4cea0e1c49e9ddf045d4"
    ]
  ];
  await handleMooLPs(balances, chainBlocks.fantom, chain, ftmLPs);

  await sumTokens(
    balances,
    [
      [
        "0xa48d959ae2e88f1daa7d5f611e01908106de7598",
        "0xf18F4847a5Db889B966788dcbDbcBfA72f22E5A6",
      ]
    ],
    chainBlocks.fantom,
    "fantom",
    addr=> {
      addr = addr.toLowerCase();
      if (translateTokens[addr] !== undefined) {
        return translateTokens[addr];
      }
      return `fantom:${addr}`
    }
  )
  return balances;
}

async function avax(timestamp, block, chainBlocks) {
  const balances = {};
  const chain = "avax";
  const avaxMooTokens = [
    [
      "0x1B156C5c75E9dF4CAAb2a5cc5999aC58ff4F9090",
      "0xfA19c1d104F4AEfb8d5564f02B3AdCa1b515da58",
    ],
    [
      "0xD795d70ec3C7b990ffED7a725a18Be5A9579c3b9",
      "0xC3537ef04Ad744174A4A4a91AfAC4Baf0CF80cB3"
    ],
    [
      "0xb6767518b205ea8B312d2EF4d992A2a08C2f2416",
      "0xF8AC186555cbd5104c0e8C5BacF8bB779a3869f5"
    ],
    [
      "0xAf9f33df60CA764307B17E62dde86e9F7090426c",
      "0xEa88eB237baE0AE26f4500146c251d25F409FA32"
    ],
    [
      "0x808D5f0A62336917Da14fA9A10E9575B1040f71c",
      "0x8Edc3fB6Fcdd5773216331f74AfDb6a2a2E16dc9"
    ]
  ];
  await handleMooTokens(balances, chainBlocks.avax, chain, avaxMooTokens);

  await sumTokens(
    balances,
    [
      [
        "0x60781C2586D68229fde47564546784ab3fACA982",
        "0xfc3eAFD931ebcd0D8E59bfa0BeaE776d7F987716"
      ],
      [
        "0x0665eF3556520B21368754Fb644eD3ebF1993AD4",
        "0x13a7fe3ab741ea6301db8b164290be711f546a73"
      ]
    ],
    chainBlocks.avax,
    "avax",
    addr=> {
      addr = addr.toLowerCase();
      if (translateTokens[addr] !== undefined) {
        return translateTokens[addr];
      }
      return `avax:${addr}`
    }
  );
  return balances;
}

async function moonriver(timestamp, block, chainBlocks) {
  const balances = {};
  const chain = "moonriver";
  const moonriverMooLPs = [
    [
      "0x97D811A7eb99Ef4Cb027ad59800cE27E68Ee1109",
      "0x932009984bd2a7da8c6396694e811da5c0952d05",
      "0xA0D8DFB2CC9dFe6905eDd5B71c56BA92AD09A3dC",
    ],
  ];
  await sumTokens(
    balances,
    [
      [
        "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c",
        "0x4a0474E3262d4DB3306Cea4F207B5d66eC8E0AA9",
      ],
    ],
    chainBlocks.moonriver,
    chain,
    (addr) => {
      return `moonriver:${addr}`;
    }
  );
  await handleMooLPs(balances, chainBlocks.moonriver, chain, moonriverMooLPs);
  return balances;
}

async function harmony(timestamp, block, chainBlocks) {
  const balances = {};
  await sumTokens(
    balances,
    [
      [
        "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a",
        "0x12FcB286D664F37981a42cbAce92eAf28d1dA94f",
      ],
      [
        "0x6983d1e6def3690c4d616b13597a09e6193ea013",
        "0x46469f995A5CB60708200C25EaD3cF1667Ed36d6",
      ],
    ],
    chainBlocks.harmony,
    "harmony",
    (addr) => {
      return `harmony:${addr}`;
    }
  );
  fixHarmonyBalances(balances);
  return balances;
}

async function xdai (timestamp, block, chainBlocks) {
  const balances = {};
  await sumTokens(
    balances,
    [
      [
        "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
        "0x5c49b268c9841AFF1Cc3B0a418ff5c3442eE3F3b"
      ]
    ],
    chainBlocks.xdai,
    "xdai",
    addr=>`xdai:${addr}`
  );
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL counts the AAVE tokens that are deposited within the Yield Instruments section of QiDao, the Vault token deposits of CRV, LINK, AAVE and WETH, as well as USDC deposited to mint MAI.",
  polygon: {
    tvl: polygon,
  },
  fantom: {
    tvl: fantom,
  },
  avalanche: {
    tvl: avax,
  },
  moonriver: {
    tvl: moonriver,
  },
  harmony: {
    tvl: harmony,
  },
  xdai: {
    tvl: xdai
  }
};
// node test.js projects/qidao/index.js