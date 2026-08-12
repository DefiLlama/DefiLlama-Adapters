/**
 * DefiLlama TVL adapter for Hootdex
 *
 * HD Vault Liquidity (HDVL):
 * Live PECU balances held in the specific Digital Asset Treasury (DAT)
 *
 * Both balances and PECU/USD price are obtained directly from the
 * Pecu Novus JSON-RPC endpoint.
 */

const axios = require('axios');

const treasuries = [
  "0xDA4135e154455206FBdee1B8cA0F67F3CAEf1C3E",
  "0xb32EadEe50b2EE242c68A4cC91b61a938D843898",
  "0x55240d975678488a13faEd41daA465080ae7148f",
  "0x6a50bD9a393Ad9449D3C4235dC473157Eec5c512",
  "0x86947C992BA66ab18Dd00E440bb9991E0921eBD8",
  "0xbBde63E7F1fe3d2899C1Ad1725Ed20f7f78858Cb",
  "0x440ef6f1a259c6A508F46Eba3242b1Ec1Ae90926",
  "0xEab7520702EEAcA636b0E08DD78458a5d7c425f0",
  "0x0588BDb0Ae1D8C7F98f1adE729eF09BC517BF007",
  "0xcAfFf9975F3eAdaf61DCcc679722F86bf3B47D53",
  "0x93Eb236fc8E044715420D58cC519864008415CF4",
  "0x6A11D34a843DE112329b0B8Be2E8e8dFBEd956D2",
  "0x36DcF09bD58a592935d47f8Caa55a96e74c909D1",
  "0x819F51a0f50c8421DBd8bD1860dBE88DeA4EA7bb",
  "0x8b457E6E42F02EE4B5870bFeb1f4F4BEb26fCC71",
  "0x3dC91EF50930dA6663b5000CB3b68b1978E7a4FE",
  "0x53613410066bb07aa2091725bd7a147dF4b8eb97",
  "0x01f358982A10f637dA6ecec0f01C3E06D90163d3",
  "0x9bDdb50D52936D31BB5B96DDb168c747d73D5829",
  "0x92022c33f818E94a20d976DbFfC8b803b2A8aE7F",
  "0x4f4955cdbFDC31117172cd4dC0Db5DaA4A8Ef25b",
  "0xb26Ac9ab3Fc4978e8a3BF471895b46b73257b1b0",
  "0xE6BCB1523d23534cf0bda4e86572Cf9BC9c7e35d",
  "0x4B6dA6c58Fe468C3dad3C803557a43aE234E35Db",
  "0x28e396e56Cf4E16c1Fa18a26413bc9463b94Ca03",
  "0x9B84dD045893ceFd6119409E6A1170e4a2a4b6d9",
  "0x880781058e326f6fEaD8d0Df46eD1C2a3D53C20D",
  "0xACfE26632BA9BeFB1809c380bF4d727e70F1730F",
  "0xd2bA863cE4DcD71763D5D589612B552D9c9e82E9",
  "0x35fCbd458cCA06bfBb0D63dFA5b2110DBFD97E0F",
  "0xc73E6CE4d309eE83b59c2CEB84086A46c5451eC8",
  "0x7d1DDFb0645f44574c3Bb1281265D332d8a6C584",
  "0xB182866190f799AF2FFe11B2648Abb2636B4964d",
  "0x2Fd0F6b2faaFcd7CeE190584E602211e05C0E5dc",
  "0xD377d49c1cfC2378e745F67E3ec08790404881f9",
  "0xa9AD603CDA81AF24EA3057E53D2b5f6C7F728618",
  "0x877767BC196001c700b9dba949f58336eE2690d8",
  "0x6b6855A931A53E22315B05fD04238FCB782b453D",
  "0x200F57a81B42441D8D8D49a505edab94E8344F71",
  "0xf0CC09636fBF21AEbeFf985Dd09a47D37984f38f",
  "0x89b56842C8BB68ccA8810926DF7A6DC4C8E4CEc1",
  "0xa8613a6FF5E7B0598F196C49C91F2aE8402412C9",
  "0x6897326aE5F14D62BFfad0d6479DFA700965B917",
  "0x46B470567c4773404fE30b94ecdFE75d076cA115",
  "0xAC94280c0fE7F28aF8b589907609931260D6a9f5",
  "0x767A46Dbc5877CBAFa1B271FF2a05F6a8785af64",
  "0x77f549f9cCb66E9056f699a14e592c38c8D67604",
  "0x2702aAaf4aB354Ba8836263C71F45D1D35dE73b2",
  "0x6f80e02eAE9B8d3Fb3B1FEE2Bbc28EdaD401Dac0",
  "0x3828C573F23f1c7925a22f8D1e01ccD99447ad1b",
  "0xa2e2c387927EC36b1831225E8561D6bdC87A2c1C",
  "0x2f51341e53b7F947A508e1d5e4F8DB69933C5E63",
  "0x5791F0E49a35038A7826e5BE9ae6a774Ff759aA4",
  "0xA9a3580044e7756F133B7a0aa685395bE22277EB",
  "0x9bF9326A785FF979DD425576f1251D4a8d607D18",
  "0x6570a99F577Ca569C34371eD95b519C18F5F2CeB",
  "0x0cc91902962a54fb7aFBAA95C48e82E61EedB123",
  "0x73280DA8249A29d10D4CFbF1085d10A6933fE275",
  "0x8b16927287d76985D4dDD2fC425Ed991D22B93F3",
  "0x020c38a7dB84524F257f15D4EfbEb6A3E860D747",
  "0xbF963Aa72c18E5c6B85E5914e69C25d5E11666F8",
  "0x656cA57D1d3C7E914b6077d9a3E3cb3cd8a28dD1",
  "0x8447f7F5230A31fF11eeF01f83f5aD73bb74430f",
  "0xc6eee25cceF20C48D6d29236D8717832c7b39D1C",
  "0x4760A6521890Ef1a2dcdB266044C7860221e8768",
  "0xE9113C7a65227CD5Dfd03B447d2fb4Fa5F9a34C9",
  "0x5fB8B67bB05d8145d48bf87e0678D54237b0480b",
  "0xD09c77FDdd86BA60bb26B7134B7Bdaa8D513499a",
  "0xfCD7BDd60009e37826A39b43d2705b49B3a35FB3",
  "0x8365939779F537D243BF0EC6b38d4A33b10C0E74",
  "0xE64c3BeAe4E8397267F4936EfCbb148EE7C1E78a",
  "0xDF467B87F1648F67f434BBe840BDA560af919379",
  "0x1d5F9e4890134d9Fcc6bfd7B544DE15703667EBd",
  "0xAAf540AEafbAC383869B5696Ae9EcD586beF1DbA",
  "0xB98fd8884b04D35d13477BC0Aefa140dd59cff74",
  "0x23156BC444d6E29a958D356611b00DebA5419B61",
  "0xE3b17DDCD93b24caaF9B905AD2D976f6445D5D8e",
  "0x0429ffDB018b90b2C707E5EA00bbed2D21199CCA",
  "0x11aaBCfa51C2665B51A91C150009ad43a54B29ac",
  "0x742E8223774c69eBB6C4789Aee7E3d0c4e4c708e",
  "0xC720481CABEb1BE6962e77707699F342825aacC6",
  "0xE2d81ed16fb748f415A0cf4d267bC12dc65B5760",
  "0x28342cc4BC5cCF5Bf62F214d0218B396d7c543D5",
  "0x480880b0C8d1663A64E5A36c4689DDcf13A2547f",
  "0x5f6a69e57Bf00A10EA0FFA6dfB49AB4519Fb9AA1",

  "0x8200aF3A8d479E93e579879295B33516F3653b2e",
  "0x1765D9e4465Ec85E2D5A533dEBfE760f6E58340b",
  "0x9CAD7d58cCD0f828d3Cf92fb2f681bCD7c4Ef57B",
  "0x8e9FB9930d1ebfF9271E6a9169ed1905B099473a",
  "0xA3215e622b32F1eB5BD4d253aEA42B9688DB5192",
  "0x6db461dE89Ac20a8742177B0Fb00F8733D292d1F",
  "0x8e05BfC6D17600098d139Fa2B15643bDe4451BFd",
  "0x2f936751CFe6a4A50cBD0A0Da8B3E35587358e6E",
  "0x7b36A44A4F86A77DB6979442675f1966087b3CB8",
  "0x981ee4CEC515008d9244690bA838602589FbDef3",
  "0x0C585d0C1839c36ec4d09F8c05EF1FfDccad84A6",
  "0x1B38402CF725F4795d1784F0635412a05Ed1553A",
  "0x21aeafCB0965793b9Fad7d74838D39c34ac7fB30",
  "0xFC6db0432A33fa9e1Fb4DDa223a3eaA67389585c",
  "0xb4Eb0c66a83c5C3C8A918175322cD11c2a0D3f92",
  "0x7CB2CD20990099d9278d2F971fA81c29867a385C",
  "0x4fd6824daA9Cc7d2E54Db24e5a07BFdC978ba317",
  "0x9e317aE1be95477DD16948a4C50444E43Cc237F0",
  "0x7C0E25b4cf103481bDe7749E1255C653B9Ed1C9B",
  "0x303C7f25FdD8B2d1eAD58D938eb609A4fab7659B",
  "0xeF4e22EDFc25608A01A0307f02EDb387675E6C81",
  "0xd801d0F997e2be7624DbD98d84a8e70E665Edb4D",
  "0x6f35166aBc8F2Fa29e9A9A1E7C78F3a40b9A1Ed3",
  "0xE9677bff7476C6f3be04857403a0528b07c86811",
  "0x9b1f2278dd797785B28A5D04b7324585f4ecA23b",
  "0xE42A1Ac904Bf3450181752aE3ddb7b1CafE3c33F",
  "0x5269c4aB40F1204d3b193ba8feA474E482c3F2dE",
  "0xE007016BFf5d0B214EB476Bee0cB709A7ce5A8E3",

  "0x0b332F410983E3D725b5463dd4e29fb66812597c",
  "0x85Bc709D79a812bc9920e71E5aAA3B1C8014e867",
  "0x056E15e0089a3316B12e2f402ff5A5f667E2Ffee"
];

let CHAIN_PROVIDERS = {};

try {
  CHAIN_PROVIDERS = require('@defillama/sdk/build/providers.json');
} catch (e) {
  console.error(
    '[hootdex adapter] could not load @defillama/sdk providers.json:',
    e.message
  );
}

const PECU_RPC_URL =
  process.env.PECU_RPC ||
  process.env.PECU_RPC_URL ||
  CHAIN_PROVIDERS['pecu']?.rpc?.[0] ||
  'https://mainnet.pecunovus.net';

let rpcId = 0;

async function rpcCall(method, params) {
  const { data } = await axios.post(
    PECU_RPC_URL,
    {
      jsonrpc: '2.0',
      id: ++rpcId,
      method,
      params,
    },
    {
      timeout: 15000,
    }
  );

  if (data?.error) {
    throw new Error(
      `${method} RPC error ${data.error.code}: ${data.error.message}`
    );
  }

  return data?.result;
}


/**
 * Get the PECU balance for a treasury.
 *
 * pecu_getBalance returns a hex-encoded uint256.
 * PECU uses 18 decimals.
 */
async function getPecuPriceUsd() {
  const result = await rpcCall('pecu_getPrice', []);

  if (!result || typeof result !== 'object') {
    throw new Error(
      `Invalid PECU price returned by pecu_getPrice: ${JSON.stringify(result)}`
    );
  }

  if (
    typeof result.price !== 'string' ||
    !result.price.startsWith('0x')
  ) {
    throw new Error(
      `Invalid PECU price value: ${JSON.stringify(result.price)}`
    );
  }

  const decimals = Number(result.decimals);

  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error(
      `Invalid PECU price decimals: ${JSON.stringify(result.decimals)}`
    );
  }

  const rawPrice = BigInt(result.price);
  const priceUsd = Number(rawPrice) / 10 ** decimals;

  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    throw new Error(
      `Invalid PECU/USD price: ${priceUsd}`
    );
  }

  return priceUsd;
}

async function getPecuBalance(treasuryAddress) {
  const result = await rpcCall('pecu_getBalance', [treasuryAddress]);

  if (typeof result !== 'string' || !result.startsWith('0x')) {
    throw new Error(
      `Invalid balance returned for ${treasuryAddress}: ${JSON.stringify(result)}`
    );
  }

  const rawBalance = BigInt(result);

  return Number(rawBalance) / 10 ** 18;
}

async function tvl() {
  const pecuPriceUsd = await getPecuPriceUsd();

  const balances = await Promise.all(
    treasuries.map(async (treasury) => {
      const amount = await getPecuBalance(treasury);

      return {
        address: treasury,
        amount,
      };
    })
  );

  const totalPecu = balances.reduce(
    (sum, treasury) => sum + treasury.amount,
    0
  );

  const totalUsd = totalPecu * pecuPriceUsd;

  return {
    'coingecko:tether': totalUsd,
  };
}

module.exports = {
  methodology:
    'TVL represents Hootdex HD Vault Liquidity (HDVL), calculated as the ' +
    'live sum of PECU held in the specific Digital Asset Treasury (DAT) ' +
    'escrow wallets that feed Hootdex\'s order book on the Pecu Novus L1 ' +
    '(chainId 27272727). Treasury balances are fetched directly from the ' +
    'Pecu Novus JSON-RPC using pecu_getBalance and converted from the raw ' +
    '18-decimal PECU denomination. The PECU/USD price is fetched directly ' +
    'from the Pecu Novus node using the pecu_getPrice JSON-RPC method, ' +
    'rather than relying on an external market or pricing API. The resulting ' +
    'PECU value is converted to USD and reported as coingecko:tether with ' +
    'misrepresentedTokens: true because PECU does not currently have a native ' +
    'CoinGecko price identifier. The adapter only reports the chain-verifiable ' +
    'PECU liquidity held in these treasury wallets; Hootdex operates a Central ' +
    'Limit Order Book rather than an AMM with pooled reserves.',

  misrepresentedTokens: true,

  timetravel: false,

  pecu: {
    tvl,
  },
};