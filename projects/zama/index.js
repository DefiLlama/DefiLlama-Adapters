const { sumTokens2 } = require("../helper/unwrapLPs");

const REGISTRY = '0xeb5015fF021DB115aCe010f23F55C2591059bBA0';
const KMS_PROTOCOL_STAKING = '0xe9b176CCaA8840DC3b3567bb83e2cD2a6c36F4Ab';
const COPROCESSOR_PROTOCOL_STAKING = '0x7147485b892158f2B875f7aC5Ea48A9937C66AE8';
const ZAMA_TOKEN = '0xA12CC123ba206d4031D1c7f6223D1C2Ec249f4f3';
const registryGetPairsAbi =
  'function getTokenConfidentialTokenPairs() view returns (tuple(address tokenAddress, address confidentialTokenAddress, bool isValid)[])';

async function getPairs(api) {
  return api.call({ target: REGISTRY, abi: registryGetPairsAbi });
}

async function tvl(api) {
  const pairs = await getPairs(api);
  const tokensAndOwners = pairs.map(d => [d.tokenAddress, d.confidentialTokenAddress]);
  await sumTokens2({ api, tokensAndOwners, blacklistedTokens: [ZAMA_TOKEN] });
}

async function staking(api) {
  const pairs = await getPairs(api);
  const zama = pairs.find(d => d.tokenAddress.toLowerCase() === ZAMA_TOKEN.toLowerCase());
  const owners = [KMS_PROTOCOL_STAKING, COPROCESSOR_PROTOCOL_STAKING];
  if (zama) owners.push(zama.confidentialTokenAddress);
  await sumTokens2({ api, tokens: [ZAMA_TOKEN], owners });
}

module.exports = {
  methodology: "TVL: total public ERC-20 reserves backing confidential wrappers from the on-chain registry, matching aggregate TVS (excluding ZAMA). Staking: ZAMA held in the cZAMA wrapper, plus the KMS and Coprocessor ProtocolStaking pool contracts.",
  ethereum: { tvl, staking },
};
