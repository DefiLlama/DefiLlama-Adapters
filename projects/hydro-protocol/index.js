const { queryContract, endPoints, } = require("../helper/chain/cosmos");
const ADDRESSES = require("../helper/coreAssets.json");
const { getClient } = require("../helper/chain/injective");
const { IndexerGrpcSpotApi, IndexerGrpcMitoApi } = require('@injectivelabs/sdk-ts')
const BigNumber = require("bignumber.js");
const { get } = require("../helper/http");

// Contract
const autoCompound = "inj1mjcg8a73904rj4w7t5qkgn0apua98n059nufma"
const lrpManager = "inj1rv7ztpa8nkywc89a05eys52fzgezlnzjq3grkz"
const vaultMaster = "inj1vcqkkvqs7prqu70dpddfj7kqeqfdz5gg662qs3"

// Token
const hinj = "inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc"
const hdro = "factory/inj1etz0laas6h7vemg3qtd67jpr6lh8v7xz7gfzqw/hdro"
const xhdro = "inj1qc2tw477wwuvkad0h3g78xqgwx4k8knat6vz0h"

// Market
const hdroInjMarket = "0xc8fafa1fcab27e16da20e98b4dc9dda45320418c27db80663b21edac72f3b597"

const geckoId = "hydro-protocol"

const injectiveSpotApi = new IndexerGrpcSpotApi("https://sentry.exchange.grpc-web.injective.network:443")
const injectiveMitoApi = new IndexerGrpcMitoApi("https://k8s.mainnet.mito.grpc-web.injective.network")
const injectiveClient = getClient()

async function getHinj(api) {
  const { total_supply } = await queryContract({ chain: api.chain, contract: hinj, data: { token_info: {} } })
  return new BigNumber(total_supply)
}

async function getAutoCompound(api) {
  const { total_bonded } = await queryContract({ chain: api.chain, contract: autoCompound, data: { state: {} } })
  return new BigNumber(total_bonded)
}

async function getAllRegisteredVaults(api) {
  let startAfterSubaccount
  let results = []
  let loop = true

  while (loop) {
    const { registered_vaults } = await queryContract({
      chain: api.chain,
      contract: vaultMaster,
      data: {
        get_registered_vaults: {
          start_after_subaccount: startAfterSubaccount,
          limit: 30,
        }
      }
    })

    if (registered_vaults.length === 0) {
      loop = false
      return results
    }

    results.push(...registered_vaults)
    const lastOne = results[results.length - 1]
    startAfterSubaccount = lastOne.vault.master_subaccount_id
  }
}

async function getDojoLpPrice(api, lrp) {
  const { pair_contract, stake_token } = await queryContract({ chain: api.chain, contract: lrp.yield_proxy_address, data: { config: {} } })
  const { pair } = await get(`https://api.dexscreener.com/latest/dex/pairs/injective/${pair_contract}`)
  const pairUsdValue = new BigNumber(pair.liquidity.usd)
  const { total_supply: lpTotalSupply } = await queryContract({ chain: api.chain, contract: stake_token.cw20, data: { token_info: {} } })
  return pairUsdValue.div(lpTotalSupply)
}

async function getMitoLpPrice(api, lrp) {
  const vaults = await getAllRegisteredVaults(api)
  const { vault_subaccount_id } = await queryContract({ chain: api.chain, contract: lrp.yield_proxy_address, data: { config: {} } })
  const vault = vaults.find((vault) => vault.vault.master_subaccount_id === vault_subaccount_id)

  const {lpTokenPrice} = await injectiveMitoApi.fetchVault({
    contractAddress: vault.vault.address
  })

  return new BigNumber(lpTokenPrice)
}

async function getLrp(api) {
  let sumOfLrpUsdtValue = new BigNumber(0)
  const { lrps } = await queryContract({ chain: api.chain, contract: lrpManager, data: { lrps: { limit: 100 } } })

  for (const lrp of lrps) {
    const { contract_info } = await get(`${endPoints[api.chain]}/cosmwasm/wasm/v1/contract/${lrp.yield_proxy_address}`, undefined, api.chain)
    const { total_supply: lrpTotalSupply } = await queryContract({ chain: api.chain, contract: lrp.lrp_address, data: { token_info: {} } })

    let lpPrice;
    if (contract_info.label.includes("dojo")) {
      lpPrice = await getDojoLpPrice(api, lrp)
    } else if (contract_info.label.includes("mito")) {
      lpPrice = await getMitoLpPrice(api, lrp)
    } else {
      lpPrice = new BigNumber(0)
    }

    const lrpUsdValue = new BigNumber(lpPrice).multipliedBy(lrpTotalSupply)
    const lrpUsdtValue = lrpUsdValue.multipliedBy(10 ** 6)
    sumOfLrpUsdtValue = sumOfLrpUsdtValue.plus(lrpUsdtValue)
  }

  return sumOfLrpUsdtValue
}

async function staking(api) {
  const { total_supply } = await queryContract({ chain: api.chain, contract: xhdro, data: { token_info: {} } })

  return {
    'hydro-protocol-2': total_supply / 1e6
  }
}

async function tvl(api) {
  let injAmount = new BigNumber(0)
  let usdtAmount = new BigNumber(0)

  injAmount = injAmount.plus(await getHinj(api))
  injAmount = injAmount.plus(await getAutoCompound(api))
  usdtAmount = usdtAmount.plus(await getLrp(api))

  api.add(
    ADDRESSES.injective.INJ, injAmount.toFixed(0)
  )

  api.add(
    ADDRESSES.injective.USDT, usdtAmount.toFixed(0)
  )
}

module.exports = {
  methodology: "Liquidity on hydro-protocol",
  injective: {
    tvl,
    staking,
  },
};