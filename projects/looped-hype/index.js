const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require('../helper/unwrapLPs');

const sanitizeAndValidateEvmAddresses = (addresses) => {
  return addresses
    .map((address) => address.replace(/_$/, ""))
    .filter((address) => /^0x[a-fA-F0-9]{40}$/.test(address));
};

const LHYPE_VAULT_ADDRESS = ['0x5748ae796AE46A4F1348a1693de4b50560485562'];

const tvl = async (api) => {
  const strategies = await getConfig(
    'lhype-tokens',
    `https://backend.nucleusearn.io/v1/vaults/underlying_strategies?vault_address=${LHYPE_VAULT_ADDRESS}&chain_id=999`
  );
  const hyperevmStrategies = strategies["999"]
  const tokens = Object.values(hyperevmStrategies).map((strategy) => strategy.tokenAddress);
  const sanitizedTokens = sanitizeAndValidateEvmAddresses([...tokens, ...LHYPE_VAULT_ADDRESS]);

  return sumTokens2({
    owners: LHYPE_VAULT_ADDRESS,
    tokens: sanitizedTokens,
    api,
    resolveLP: true
  });
};

module.exports = {
  hyperliquid: { tvl }
};