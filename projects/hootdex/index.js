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

const treasuries  = [
  "cc52a620be1ebea3f29185530423dcf943f99b4019b255a7c6130c4a711dc22d",
  "1c35cd72f7c3ff4c5337fc8c50e16c5c52567169444483dd3a5eeb336354224f",
  "e583495688d6f1b4c761c679485ea2ed1f778e43b46a7773627c9ae03dd10646",
  "faffdf8e7fd43b059533a289c4011bfc3531667c76aa57323ec91c27019c4cfd",
  "4655c537c1f26a59bf15f0d32625e0264dd2d7d4b09f8537c3dba0a7a2027df4",
  "a769763c80297776c418f6254e40169c0a6c2a1d8e6f055d06a0e487dd893d12",
  "92ccbe97645090f6689fd4a2b93a8cca644ce16291f89f838179d73d5a66d088",
  "bb48d4f81c58b31a134871e8267d604499d4bcd78ceee6b3274017769e8b8aac",
  "5975d69eb46a24d3cba47413d75c96474f7bc7625864c6168401d67c0a8e3137",
  "bbe692240e3fab9765375cc3162376fee2be3f26dc07d8a69121849c5ed9a938",
  "ebb6390efb7fa39ba121ddf9abab6f26bc60d298801379b552a49c2705cbcd02",
  "cc0e59066d53bde3da0a7671f39b81b9fdd79086dcee346df025ed7c1f2cc249",
  "cf2a77a3f16fea8a25c4c008bf0a3d9eb6f6d447f313e9451aaa9fc81401111f",
  "0159437877c4c198eafd2a7411a706dce68ec72d45968f23e97d51dad5d69ce7",
  "708253ff646bc8dbf8da1d47bd96b42bdc85b7b40d9933cea30d1ad5dcd8de44",
  "1018a7592a4372533a43b43d54e538f22ad955cef594614c1e7ecc17a55fb3b1",
  "e8cb8b9284da182dbfc55655462eec95cb4acc620bd54aa18abb0ab6bbb9e2e1",
  "9342194ac126b8d70b84d6c246ffcb4120d6a4cef5a0e4f88cf884a65e9f38fa",
  "7430ea59a31767fe7520ead7631e92fd72d2bd1b6df8d25ce3eb63e60c943858",
  "58840dc998851bd6ef23e720526f0f0b1910a398e0906c3939df85abc94d772f",
  "ba7dea0b9a9e5d4fa2bddbffa5e51ccd33187d6488af0bc794379bb1b1ccad12",
  "099ec45e6df2e4d93fe860bb8dae7ad094be8a18f2557a763f20664a8de41e86",
  "95c31e0953f30820b8c249321f2a3ac7aa3371b66f034b849e67163d1c1729c3152279a97dd71eae2887065501ccb036e0180ee29f12ab6263291aa7a8182568",
  "0d50cec25ee9edb86866130fbcbd508af3309206a86d96bf1053ba9910adb716",
  "c4c23ee5fd114ddc9a5311fbc44c5ee64fa7a182363616b1c4096f684dfbe84c",
  "e768998c89a09aa2ca01bb90f11d1cd56a89f21657a75dfb61a31c06a562d9f8",
  "6e8b339955c46ced1659dad7a8fbd2445573a388dd2565f85971b98bd9091837",
  "7c866c6d07e577b7dafa086da8591ce10049e86d534a61001c6d81e7f19f6b6f",
  "82610bef0541941d58b4bf3e3d2990266ff86e7d1034e5597735a7ee32b16d99",
  "a9c73980621ac2e66db9de02177c3f4161e0af6c4a24d10859eefc064f0c6e14d993c15f86fc15c3e1a2dd09dacb95364ecc661deb4d627b1d55fca0503f5d49",
  "92bfb69edc67bbab0c0889290cc70e1a272d787e0797694710a8a9d7d6b4eba75f3e987b7692ba90d14e059d7fddc4033bae6b7173a82770ff6c63a4215b32e8",
  "d7abcbf9ef7e5125ecf6aaed9ab400b4e66c9b6b6c7805202a8dc2197ba5b085c044a6f7c88195318eb48549aed32594a925918ae6ab12feb97ffecd11701dfd",
  "08cedb1eac4e51ce85a8f401c62674e343960ec6cfa37e67a187a60691916a0ec21fda536cf687de0f9d2e29aedf1ec99ce641c6e3bea256ad91e116e3fde63d",
  "6d170f6e20c70bf564218fcd3830aac8b7d569fa2b6c0439d29fe4025769f5ffd6ca3e0e1e3c48e601e535b374813cfeb2f6de162ef99bca48a95681cea49d69",
  "344925a342053f1a6f90b46f3c054f14d94a6613e91f5bcb0b9ccfebe47845d20b50cd39e0b102a16d12c482839b5b130ea75623bfeda9d82c56488a3aa7a34e",
  "179714b5da66d1ce7224fe0721aae31387ef1e797a871ecd747e203b805a4406bf96fa7685d826515ee1f9bc6a9a5fea6968732e1ed8cf464accbbcec6b9726e",
  "36842d5b672d4bc1a5b15e65d5b559ebab1ea48746c9e387cddde800a9c072c1a2d028fada26a0ad3df0fde5c73abb1c632c58d77d234bf7556d5729b374f9c8",
  "b5b428fbed1f2a56d50fb434ac58b9fb6a724bdd572ca3bdd6b53ac1976c3df5e4a3be01460e8c1539f713e2a0762855dd450ac6059849b13c6ff57a0036c1bb",
  "34bdfea65201771e358303bd567a36b054b4fcaa217ab72bb724e826919880e3ebeb7f500893350fb449b9cebe16dea58038e82e004d51d9557c9349553fb0a3",
  "84ade4e040e4dd534ff1c2baf7b0e9f79215dcf0a49cb99bc983ad14ad8b8745d462ea0414eed7cf384b1300a760317650c0ea59848a772b3e8814b38f846dd4",
  "7240476d7a9c656dd93d6e68fc9922780bc4e7799c881108f8ae51e676029dddfd6b8befb9072e5ea3ef24c4ccd2d6ff490d53d59eeb42ccb403177679fb5215",
  "ede97b1aab9a30be15d010592a8fb05e66765edb7ce76950df8b5a00dbb12a1dbfba92f5d1dc5bd791f34b586db73a556717af92800e8ce02394ce9fe072863e",
  "4e65eeda867ab9c444d4c815a370049c38e2bdaebcc3e7ac37c14da53fabee3af5292d9e0a9b825f83e77e863f8ec52f01ff3df1707f21e46a680dc9cac6b6f1",
  "98e797c9e40efcde12659b082e33f573f421883583c5f9b631643cbc4cd35897a0c7eea7dbd102140325aea8e0b592e5e98606eeb3e90a7ba0170e16201ce2e4",
  "702f28c7f1338c44d9164a6f78a35172a3fcbe478e2f83d361a19c35cbf4c5cf1da27e9c2d66f8a715ded7003c9e4a6429329bafb051e72d5be3bc1b7f718258",
  "874a4717a0060929c51153114e41436bb8f47802d3cb9c40fb47454f9d40467022d186ba5efd41ed46e9f3f1769566f1579e9cdb62256251346ccd39988f3d79",
  "09abd438976d734b686cb2ed9cae554acefc0e014ea996d67bd6c4570b54705f0076191165d52a4297882f0d68b3a6c476269e249aa578c8b24b062dacfa9636",
  "66965875a331ffb8f30ab79a8cc328e15906eb62b6b598630f67e1be256b41a14100d1add8e1d2a228269ce95de8c3a59ace57b83b21ca2ec6aecdec9050b737",
  "7f921d241f6c9a9ee0db950fbc9b846bc2190d248c9a10e0ddd9e656b9623e91e5bdc4ef1bda4e4df8fa193eae4bdba64170c3d66246eed46336fd2a22f1ee90",
  "f9a86b090db602b6f4e244b9719789c042d1252c6db1076f12be9a5480bc2f329655ee2b154094d0d3a2eebd43d10960c6c22ffd34c229271a77e32b24a965f7",
  "3157ce6a4f08e07b6baf9bec028fc41055c78083e15345af0353266305c408f6f067cd71819b22752a27a894fc618ab3171ec2cd1674e460eec0970285ce67f7",
  "a33e2332d4c6486bdba4a89aff817b3e24de5cfbe21faceede9c232cf3fa35ece269e60cd11fc4bf66d7069c3757a51b40e58c05e835617b8f444038a0e2de6d",
  "5979f55e40dc0d3ad83ffe10501844129bb8efd4b5f45824b3319010a32e5b8da24e3e6ff6d5fdc57d072d42043f7c71287c1ab8b47fcd2b18ca9ee093a45c8a",
  "2861ea02280cfc4ac0f0d94dc4f9587a4994c0e68fbced9b9387d2b025d0443db960f17d690350fcb89316744429a074a01fb17e1ff22838ef7003cca97475c2",
  "e736c4f49ab9558fbc881b4afcd19356df60b25b129ea524780483f4d124a5bd7d1bd07743d8ed5e4ce4ae7e131ce54db555807a9a9340a6d620df47562a5cf4",
  "6c38560a5c061385e5328b09c473d4190e41f59ee4816f003fdb5ff2cf5301ba141bf45df2c80b2c4668e4a507ad24c78d882fbce78c05ca45e9392945d2d2c6",
  "76b2f8426dee8401b397e4b416b7f27445c4f7760129014b2b1867b2d2d07b87142ee7e72af97e881298e6e9e45587a9b36f1e26b79e209b15e519452d2dccab",
  "6c683ef20f17485c2824a02191fa8685f2cc5e2d8e2e56bff266fd4a29a01fb9a8f8612ab8561fe571181415df9487d9b14359d54ae430f4c5d5df76b3dc6e56",
  "ac2fda97edbb7c992dc0bc1c4bd170b7c228a151589e3a1509be937c47cfe51a27458f9e11aeb0795ac73d6ea7c16f1ac6d198055a3758110ba4b2767a47d97e",
  "6c56137a0eb0c8b66fda5ce72e95edcd9a6256846f210cc2abf2b2c44dd12b27c56a8c05f92d218df5cb1c1630b63bff4bd54b1fd63fd296ab2958912f57eb01",
  "807209d60d6645ce7e551a72c4022c5fe245cffb13620ec7e8acb60eadea448b530508c8586e29be899278f3c8aca07aaee1f87886b822699731a60155edce85",
  "a99947d5e249b09d6224423a8329716585a7fdae46fec15c1e53f3bef3ef78e3cdbec2e40746c42a9f009d90a6b198714676ad3cb1f6ac37ea5f07dde2fe0b56",
  "ca32186ea4c47102946996d369b22a4641847e169b86b43aa54eb6c9c2e3008869a77cf4688fce0a8a2aace4a790d59d43c84961ebaccfebb5a8e247203c49e6",
  "355b00c116433a048814604ee1575dbc0fb2f9ff5a6fa72e18e39b1698687b5dbc2f2b649f5385f9f4241ba628ee63d464174d255a27e4d9f7e99d6096a2d301",
  "9f257d6531264f25692f79f487546e3c27bad51c8ad2cd67c3c7c8cbffbe46e7210d358a898da6e51ad4fbd19ed10d65861a75c1f38e77e516231a62764edca8",
  "e7cd1b104e3f924b8cfb01f13a48f337da3604604879773fe82c8ade96eb62c4b14c9cdd2ef64036a70715c60311203eda9ba5d3c3dec55a892ac66772677fb3",
  "a01f9dfcd0f8e06e30f83a2fcb6b4229f61d8f8c3ab33301c7c9ff0773d3468f8f17fbef5e0a8663ecf8957f807bf7af8556882c8fd9c026275a50f7a7c7eed5",
  "d63e02f37db86577b4e7a0b779d124a7574ebbaaf09695e2dbc8bf6bec507e3279279d3621acd9b5a769fc499a91970ec416f8318429534b379678717074b646",
  "0f2893c8760d332bc2c700bd19e33705207ef74ce45aa120c04c85aacce70dec4df8587d73ef797737a3ac6434533f8360d6bc0573cfdb5c21bec19874ae3c6b",
  "a5d773fe635879b8ea50a7e389d310df1b823687171f840e07ad3759dcd9b673d5c7f72d2c1a726db2ec3f56a3af05d7e6a2f9f3b069ba4d6b09fe66f3595377",
  "bfd2fa91b3653f6db7459a0ec80eab92f0a729d3bad2215889a559c0e5a2cd042ecac574277401a83ff334d4582b072866ff708eb91ddd51c07a57d79bf99a42",
  "573e086e19606bde196bc68b4bdc73818ed82e25c55a61666c64ad850bd3c884bacc488f4e10cc22882c2c18fad7f49add54d3c71f872462a33cf66d0983903a",
  "e7f8019a72cad0a738a412665405f8239af12d7845ce196d411025e5916e76eee97876cb94abfb10dcb52a3da593a13f20f0f9c65c4d5a55c2f57be5458bed80",
  "52d3817d94d14bdb6617d130ce19e54627fd80fc7de0f16174fad6890bde2a65c7c40fc64e47138129f1bb09fbd3607a2cba6cd0fdd5f65fbfeb55a6df37b02a",
  "825d4f72f064fc0b92fd9e0c9bb3ee6d89725bd6d876022870d81d8fe767fcdcbfa86a931289b99219677b4712899cf2c4a1709f9b2b68cef51c5ff9e90b58b4",
  "0d3f2710c44822416a47496f0bd0dc95afe9dc3e816f8209a95719fdefcb6dd2921c93df3ed7137abf7658799e691cb53cbb20a67a4eccf1d05febf4ab302157",
  "b87566b860f35963ce65776a6fdccacd6af99405997acaacadcd5f3d4e60f61f174a7f4ed6881a008b958ab5eb03c97afc720b8ac16fa9543c661365a69f577b",
  "8bef2d11da45a401b2880b99fae64ef112948fed1848bbfaa21929a14ce30aae494252d2c02632d5005def09c2c1cd17db5fa3e8f0203a364bc25af8d54d0d4f",
  "1765da0890d8aeb205c88f06a65c52f79f857e7be2993534a71b856d397f65603ff5dfa9741c9c534e46ce8227f199aaf2087ec0dc08f600f4717f009af1863d",
  "19ce2d1f3bb58a33f3eeddccf59ab7308fc967f7ffdabd685140e630821ac3070e30f8597a499e74b896a929206e834293403855bbe489da9bd3ff834afee2f8",
  "0af74cbcb745834ef0aa8d2013c0178bc307651143c6f94773ed99482c5f02784222f116a3ac55a5b4fd7fa9f286d6eeded13cf77ca73774531901a77932143e",
  "e3304061afa4b44f6dd60968ea76c5c1bd94a24670c29800e286d93ec3f4871e302165f1f2f66626e7edd2f189484b143f1ad04db13024720ca27980feaddd04",
  "d8850a1b95b9db2b94480f114f7c25d97ea19c36a3f70d4aa896234ba1d635c0f4fe26ec399234c55f24aeaa217887a7e72e0c75395ec44e16a90f28cac36b6a",
  "2d70755f8bec7971f1d334b7d6866859a3afc75cce946f298d593a5161c32c2393e0e1230adb3cd4744efd6b8bcbf4bd7205f1da1fa20ebb7c0a3b4db470f1fd",
  "389c54feb3eeeffe79a016ba48d7ac65af3c8f7015819e91de4a092186043636949f7d5c79de54c610ba903620572a5d468e521e99c0aef87f105c8906da3891",
  "3533bda52bac2ccff0096bc2ead3f56146c50505fa22abd708fa5e4f9a1c372c1ca74f221b7a69f380f44d0fcfe9393a65e7907a77fc0bf0f0f915c816f0c617",
  "e061154c2d60e23e881089567d04580441c4bee18cc3ea4f23f29c9943d2d9fe8b8633a16ec2da48a14df79ccb2123d0c1fcf0004b5f9776416858f4e7fbde45",
  "2073c967a159f5792e635afd6cecf3ede9fa59c98300b7e98f2e39ddc98f2055732262bc5268964bf8d967ee76a76d8a51d6cbef4570b4[...]"
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