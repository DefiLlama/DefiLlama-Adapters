const { get } = require('../http')
const { transformBalances } = require('../portedTokens')
const { nativeToScVal, rpc, Account, TransactionBuilder, Contract, scValToNative, Networks } = require('@stellar/stellar-sdk')

async function getAssetSupply(asset) {
  const [assetCode, assetIssuer] = asset.split('-')
  const { _embedded: { records } } = await get(`https://horizon.stellar.org/assets?asset_code=${assetCode}&asset_issuer=${assetIssuer}`)
  let supply = 0
  for (const { balances } of records) {
    supply += +balances.authorized
    supply += +balances.authorized_to_maintain_liabilities
  }
  return supply
}

async function addUSDCBalance(api, account) {
  const { trustlines } = await get(`https://api.stellar.expert/explorer/public/contract/${account}/value`)
  const usdc = trustlines.find(({ asset }) => asset === 'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN-1')
  if (usdc) {
    api.addCGToken('usd-coin', usdc.value / 1e7)
  }
}


async function sumTokens(config) {
  const { api, owners = [], owner, ...rest } = config
  if (owners?.length) {
    for (const owner of owners)
      await sumTokens({ ...rest, owner, api, skiTransform: true })
    return transformBalances(api.chain, api.getBalances())
  } else {
    const { trustlines } = await get(`https://api.stellar.expert/explorer/public/account/${owner}/value`)
    trustlines.forEach(({ asset, value }) => {
      api.add(asset, value)
    })
  }
  if (config.skiTransform) return api.getBalances()
  return transformBalances(api.chain, api.getBalances())

}

/**
 * Read the "balance" function of a token for a given address
 * @param {string} token
 * @param {string} address 
 * @returns {Promise<bigint>}
 */
async function getTokenBalance(token, address) {
    const account = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGO6V', '123');
    const tx_builder = new TransactionBuilder(account, {
      fee: '1000',
      timebounds: { minTime: 0, maxTime: 0 },
      networkPassphrase: Networks.PUBLIC,
    });
    tx_builder.addOperation(new Contract(token).call('balance', nativeToScVal(address, {type: 'address'})));
    const stellarRpc = new rpc.Server("https://soroban-rpc.creit.tech/");
    const scval_result = await stellarRpc.simulateTransaction(
      tx_builder.build()
    );
    if (rpc.Api.isSimulationSuccess(scval_result)) {
      const val = scValToNative(scval_result.result.retval);
      return val;
    } else {
      throw Error(`unable to fetch balance for token: ${token_id}`);
    }
}

module.exports = {
  getAssetSupply,
  addUSDCBalance,
  sumTokens,
  getTokenBalance
}