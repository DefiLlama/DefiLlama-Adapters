const { queryContract, endPoints, } = require("../helper/chain/cosmos");
const { get } = require("../helper/http");
const { injective: { mitoVaultQuery } } = require("../helper/chain/rpcProxy")

// Contract
const lrpManager = "inj1rv7ztpa8nkywc89a05eys52fzgezlnzjq3grkz"
const vaultMaster = "inj1vcqkkvqs7prqu70dpddfj7kqeqfdz5gg662qs3"

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

async function getMitoLpPrice(api, lrp, vaults) {
  const { vault_subaccount_id } = await queryContract({ chain: api.chain, contract: lrp.yield_proxy_address, data: { config: {} } })
  const { vault: { address } } = vaults.find((vault) => vault.vault.master_subaccount_id === vault_subaccount_id)
  const res = await mitoVaultQuery({ address })
  return res.lpTokenPrice
}

async function tvl(api) {
  const { lrps } = await queryContract({ chain: api.chain, contract: lrpManager, data: { lrps: { limit: 100 } } })
  const vaults = await getAllRegisteredVaults(api)

  for (const lrp of lrps) {
    const { total_supply: lrpTotalSupply } = await queryContract({ chain: api.chain, contract: lrp.lrp_address, data: { token_info: {} } })
    if (+lrpTotalSupply === 0) continue;

    const { contract_info } = await get(`${endPoints[api.chain]}/cosmwasm/wasm/v1/contract/${lrp.yield_proxy_address}`, undefined, api.chain)
    const isDojo = contract_info.label.includes("dojo")
    const isMito = contract_info.label.includes("mito")

    if (isDojo) {
      const asset_infos = lrp.bond_tokens.map((i) => {
        if (i.native) return { native_token: { denom: i.native } }
        console.error({ lrp, i, contract_info, lrpTotalSupply })
        throw new Error("Unknown asset_infos")
      })

      // get LP contract address
      const { contract_addr } = await queryContract({
        chain: api.chain, contract: 'inj1pc2vxcmnyzawnwkf03n2ggvt997avtuwagqngk', data: {
          pair: { asset_infos }
        }
      })
      const { assets, total_share } = await queryContract({ chain: api.chain, contract: contract_addr, data: { pool: {} } })
      const ratio = lrpTotalSupply / total_share
      assets.forEach((asset) => {
        api.add(getToken(asset), asset.amount * ratio)
      })

    } else if (isMito) {
      const lpPrice = await getMitoLpPrice(api, lrp, vaults)
      api.addUSDValue(lpPrice * lrpTotalSupply)
    } else {
      console.error("Unknown lrp type", { lrp, contract_info })
    }
  }
}

module.exports = {
  methodology: "Liquidity on hydro-protocol",
  misrepresentedTokens: true,
  injective: {
    tvl,
  },
};

function getToken(asset) {
  return asset.info.native_token?.denom ?? asset.info.token?.contract_addr
}