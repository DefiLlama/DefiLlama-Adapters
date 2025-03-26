const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require('../helper/unwrapLPs');

const sanitizeAndValidateEvmAddresses = (addresses) => {
  return addresses
    .map((address) => address.replace(/_$/, ""))
    .filter((address) => /^0x[a-fA-F0-9]{40}$/.test(address));
};

const LHYPE_VAULT_ADDRESS = ['0x5748ae796AE46A4F1348a1693de4b50560485562'];

const tvl = async () => {
  const tokens = await getConfig(
    'lhype-tokens',
    `https://backend.nucleusearn.io/v1/vaults/positions?vault_address=${LHYPE_VAULT_ADDRESS}&chain_id=999`
  );
  const sanitizedTokens = sanitizeAndValidateEvmAddresses(tokens);
  console.log(sanitizedTokens);

  return sumTokens2({
    owners: LHYPE_VAULT_ADDRESS,
    tokens: sanitizedTokens,
    chain: 'hyperliquid',
    resolveLP: true
  });
};

module.exports = {
  hyperliquid: {tvl}
};