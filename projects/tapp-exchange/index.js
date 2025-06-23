const {GraphQLClient} = require("graphql-request");
const {function_view} = require("../helper/chain/aptos");

const graphQLClient = new GraphQLClient("https://api.mainnet.aptoslabs.com/v1/graphql");

const ACCOUNT_ADDRESS = "0x57edaae7ac6e3813b057a675c05f155c0296f6757050e213dda7d8941b79609d"


const APT_COIN_ADDRESS = '0x1::aptos_coin::AptosCoin';

const getFungibleAssetQuery = `query GetFungibleAssetBalances($address: String, $offset: Int, $limit: Int) {
  current_fungible_asset_balances(
    where: {owner_address: {_eq: $address}}
    offset: $offset
    limit: $limit
    order_by: {amount: desc}
  ) {
    asset_type
    amount
    __typename
  }
}`;

async function getAssets(skip, limit) {
    return await graphQLClient.request(getFungibleAssetQuery, {
        address: ACCOUNT_ADDRESS,
        offset: skip,
        limit: limit,
    }).then(r => r.current_fungible_asset_balances);
}

async function getPairedCoin(address) {
    const result = await function_view({
        functionStr: "0x1::coin::paired_coin",
        args: [address],
        type_arguments: [],
    });

    const [coinInfo] = result.vec || [];

    if (!coinInfo) return null;

    const { account_address, module_name, struct_name } = coinInfo;

    const module = Buffer.from(module_name.replace(/^0x/, ""), "hex").toString("utf-8");
    const struct = Buffer.from(struct_name.replace(/^0x/, ""), "hex").toString("utf-8");

    return `${account_address}::${module}::${struct}`;
}


module.exports = {
    methodology: "Measures the total liquidity across all pools on TAPP Exchange.",
    timetravel: false,
    aptos: {
        tvl: async (api) => {
            let offset = 0;
            let limit = 100;
            const assets = await getAssets(offset, limit);


            for (const asset of assets) {
                let coin = asset.asset_type;
                if (coin !== APT_COIN_ADDRESS) {
                 coin = await getPairedCoin(asset.asset_type) || asset.asset_type;
                }

                api.add(coin, asset.amount);
            }
        },
    },
};

