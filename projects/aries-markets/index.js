const sdk = require("@defillama/sdk");
const { getResources, getTableData, } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");
const toHex = (str) => Buffer.from(str, 'utf-8').toString('hex');

let resourcesCache

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources("0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3")
  return resourcesCache
}
const extractCoinAddress = (str) => str.slice(str.indexOf("<") + 1, str.lastIndexOf(">"));
const reserveContrainerFilter = (i) => i.type.includes("0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::ReserveCoinContainer");
const faWrapperFilter = (i) => i.type.includes("0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::fa_to_coin_wrapper::WrapperCoinInfo");

module.exports = {
  timetravel: false,
  methodology:
    "Counts the lamports in each coin container in the Aries contract account.",
  aptos: {
    tvl: async () => {
      const balances = {};
      const data = await _getResources()
      const coinContainers = data.filter(reserveContrainerFilter)
        .map((i) => ({
          lamports: i.data.underlying_coin.value,
          tokenAddress: extractCoinAddress(i.type),
        }));
      const faWrappers = data.filter(faWrapperFilter)
        .map((i) => ({
          lamports: i.data.fa_amount,
          faAddress: i.data.metadata.inner,
        }));

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        sdk.util.sumSingleBalance(balances, tokenAddress, lamports);
      });

      faWrappers.forEach(({ lamports, faAddress }) => {
        sdk.util.sumSingleBalance(balances, faAddress, lamports);
      });

      return transformBalances("aptos", balances);
    },
    borrowed: async () => {
      const balances = {};
      const data = await _getResources()
      const reserveTableHandle = data.filter(i => i.type === "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::Reserves")[0].data.stats.handle

      const coinContainers = await Promise.all(
        data.filter(reserveContrainerFilter)
        .map(async (i) => {
          const coin_type = extractCoinAddress(i.type)

          const [address, module, struct] = coin_type.split("::");

          const reserveStatus = await getTableData({ 
            table: reserveTableHandle, 
            data: { 
              key_type: "0x1::type_info::TypeInfo",
              value_type: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve_details::ReserveDetails",
              key: {
                account_address: address,
                module_name: toHex(module),
                struct_name: toHex(struct)
              }
            } 
          });

          const total_borrowed = BigInt(reserveStatus.total_borrowed.val) / BigInt(10 ** 18);

          const faInfo = data.filter(faWrapperFilter).filter((i) => i.type.includes(coin_type));
          const normalizedAddress = faInfo.length == 0 ? coin_type : faInfo[0].data.metadata.inner;
  
          return {
            lamports: total_borrowed.toString(),
            tokenAddress: normalizedAddress,
          };
        })
      );

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        sdk.util.sumSingleBalance(balances, tokenAddress, lamports);
      });

      return transformBalances("aptos", balances);
    },
  },
};
