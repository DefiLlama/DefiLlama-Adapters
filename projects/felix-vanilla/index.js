const { request, gql } = require("graphql-request");

const MORPHO_API = "https://blue-api.morpho.org/graphql";

// Felix Vanilla market IDs extracted from https://www.usefelix.xyz/vanilla/stats
const FELIX_MARKETS = new Set([
  "0x1c6b87ae1b97071ef444eedcba9f5a92cfe974edbbcaa1946644fc7ab0e283af",
  "0x1df0d0ebcdc52069692452cb9a3e5cf6c017b237378141eaf08a05ce17205ed6",
  "0x1f79fe1822f6bfe7a70f8e7e5e768efd0c3f10db52af97c2f14e4b71e3130e70",
  "0x1f97b6313f322ddb58a7db22896fcd588dae009c5f67e8441a00613b990950eb",
  "0x292f0a3ddfb642fbaadf258ebcccf9e4b0048a9dc5af93036288502bde1a71b1",
  "0x33c935bb0699b737d9cbd4274b5936a9004eee03ccfa70e266ff7c1513fd4808",
  "0x41afe1000213f119a3d8a6cd2f9fc0b564a58f948514e4cc246f6293bbed3409",
  "0x45af9c72aa97978e143a646498c8922058b7c6f18b6f7b05d7316c8cf7ab942f",
  "0x4ec715887ec2b7470a7e33f7cb0035677db3e8882a680cc09053b8ad53f47154",
  "0x530d031b595d0ffe3770af0edf0442272a8c9858e50793db308d02b306ad9e2d",
  "0x583e3beb5d64b419c68083555bb7bbcc018ec392289742d5535c3916041c2f5e",
  "0x5fe3ac84f3a2c4e3102c3e6e9accb1ec90c30f6ee87ab1fcafc197b8addeb94c",
  "0x6243736b94609da57ca7cb399df512cfae8a112fa5a325d08fd5f4234f5ccd2c",
  "0x64e7db7f042812d4335947a7cdf6af1093d29478aff5f1ccd93cc67f8aadfddc",
  "0x6eb4ce92dc1d89abd40f9634249ec28e8ab4e3f9bef0ab47ea784773c140d4ef",
  "0x6fd721e118e40acf5fe81d132ef3a074f307680761af23f18f15e37f087fe9b3",
  "0x707dddc200e95dc984feb185abf1321cabec8486dca5a9a96fb5202184106e54",
  "0x71374f58bd6274845d5f686cee47dbf9f2fd31241f1850580fb3c06b5e905f24",
  "0x725d0f4c005c0a521ea5005bb4730845ff0d4cc76b40a618103b103cddd1f951",
  "0x78f6b57d825ef01a5dc496ad1f426a6375c685047d07a30cd07ac5107ffc7976",
  "0x85e7ea4f16f2299a2e50a650164c4ca3a01d4892c66950e4c9c7863dc79e9ea4",
  "0x86d7bc359391486de8cd1204da45c53d6ada60ab9764450dc691e1775b2e8d69",
  "0x87272614b7a2022c31ddd7bba8eb21d5ab40a6bcbea671264d59dc732053721d",
  "0x888679b2af61343a4c7c0da0639fc5ca5fc5727e246371c4425e4d634c09e1f6",
  "0x89fffba6e66db52690eed7aebe95d225388bd5c3c66950f759150e14d550cd86",
  "0x920244a8682a53b17fe15597b63abdaa3aecec44e070379c5e43897fb9f42a2b",
  "0x96c47d3797394dd25e33f814216793a89d2e6edcc54d1dac3ab4c2b2d82a73b9",
  "0x96c7abf76aed53d50b2cc84e2ed17846e0d1c4cc28236d95b6eb3b12dcc86909",
  "0x9e28003bb5c29c1df3552e99b04d656fadf1aedaf81256637dcc51d91cf6c639",
  "0xa1659a59340f097decd470d463a0f3657d38601ed5516bb70214c577c8dfa521",
  "0xa405d10deb61400d6caecf06f07f395759ad813b83e33c262c9eb48645526f5d",
  "0xa666cc1147beda1aa50fae4b40cb4c37a51230e84e80dcd31233487060913a8d",
  "0xa6ddbd0ec5f7919c6776e97cb3bb475388dda3ef88f4bf0b0d9c94687016c222",
  "0xace279b5c6eff0a1ce7287249369fa6f4d3d32225e1629b04ef308e0eb568fb0",
  "0xae019cf2bf3d650ab4037986405c80ebb83fec18fb120c71bf8889d327caef0f",
  "0xb39e45107152f02502c001a46e2d3513f429d2363323cdaffbc55a951a69b998",
  "0xb5b215bd2771f5ed73125bf6a02e7b743fadc423dfbb095ad59df047c50d3e81",
  "0xbb72791441e499bb05931b2629964114cc97f197897128efc276a76a10d73ac6",
  "0xbcae0d8e381f600b2919194434a0733899697a4c3b6715a5fa75acf8b84bd755",
  "0xc0a3063a0a7755b7d58642e9a6d3be1c05bc974665ef7d3b158784348d4e17c5",
  "0xcac72237bf1391fd999e993cb8824dc38d4ef941856fc9c2680b96b8961b133b",
  "0xcd9898604b9b658fc3295f86d4cd7f02fa3a6b0a573879f1db9b83369f4951fb",
  "0xd13b1bad542045a8dc729fa0ffcc4f538b9771592c2666e1f09667dcf85804fc",
  "0xd2e8f6fd195556222d7a0314d4fb93fdf84ae920faaebba6dbcf584ac865e1f5",
  "0xd4fd53f612eaf411a1acea053cfa28cbfeea683273c4133bf115b47a20130305",
  "0xd5a9fba2309a0b85972a96f2cc45f9784e786d712944d8fc0b31a6d9cb4f21d3",
  "0xd5c5b5db889eb5d4f4026b9704cddffbc1356732a37c2b543330c10756ae7a18",
  "0xd7d38220652d19c87099c3b23de9a70a1893620a050c635d1a94bd947c9c59a8",
  "0xe0a1de770a9a72a083087fe1745c998426aaea984ddf155ea3d5fbba5b759713",
  "0xe500760b79e397869927a5275d64987325faae43326daf6be5a560184e30a521",
  "0xe7aa046832007a975d4619260d221229e99cc27da2e6ef162881202b4cd2349b",
  "0xe9a9bb9ed3cc53f4ee9da4eea0370c2c566873d5de807e16559a99907c9ae227",
  "0xf9f0473b23ebeb82c83078f0f0f77f27ac534c9fb227cb4366e6057b6163ffbf",
  "0xfbe436e9aa361487f0c3e4ff94c88aea72887a4482c6b8bcfec60a8584cdb05e",
  "0xfdece686f16877984325c7a1c192e0f18862bae3829d000a1a62b5bc2b31d4ef",
  "0xfea758e88403739fee1113b26623f43d3c37b51dc1e1e8231b78b23d1404e439",
]);

const query = gql`
  query GetMarkets($skip: Int) {
    markets(where: { chainId_in: [999] }, first: 100, skip: $skip) {
      items {
        uniqueKey
        collateralAsset {
          address
          symbol
          decimals
        }
        loanAsset {
          address
          symbol
          decimals
        }
        state {
          collateralAssets
          supplyAssets
          borrowAssets
        }
      }
    }
  }
`;

const getMarketsData = async (api) => {
  let allMarkets = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const data = await request(MORPHO_API, query, { skip });
      const markets = data.markets.items;

      const felixMarkets = markets.filter((m) => FELIX_MARKETS.has(m.uniqueKey));
      allMarkets.push(...felixMarkets);

      if (markets.length < 100) hasMore = false;
      else skip += 100;
    } catch (e) {
      api.log("Error fetching Morpho API", e);
      hasMore = false;
    }
  }
  return allMarkets;
};

const tvl = async (api) => {
  const markets = await getMarketsData(api);

  markets.forEach((market) => {
    // Add collateral (borrower deposits)
    if (market.collateralAsset?.address && market.state?.collateralAssets) {
      api.add(market.collateralAsset.address, market.state.collateralAssets);
    }

    // Add available liquidity (supply - borrowed = what's still in contract)
    if (market.loanAsset?.address && market.state?.supplyAssets) {
      const supply = BigInt(market.state.supplyAssets || 0);
      const borrowed = BigInt(market.state.borrowAssets || 0);
      const availableLiquidity = supply - borrowed;

      if (availableLiquidity > 0) {
        api.add(market.loanAsset.address, availableLiquidity.toString());
      }
    }
  });

  return api.getBalances();
};

module.exports = {
  methodology:
    "Felix Vanilla TVL includes collateral deposited by borrowers plus available liquidity (supply minus borrowed) in Felix's Morpho Blue markets on Hyperliquid.",
  doublecounted: true,
  hyperliquid: {
    tvl,
  },
};
