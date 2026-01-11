const { getLogs } = require("../helper/cache/getLogs");
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require("../helper/unwrapLPs");

const native = ADDRESSES.GAS_TOKEN_2;

const factories = {
  agreement: "0xEA623eebd9c5bFd56067e36C89Db0C13e6c70ba8",
  marginAccount: "0xbbC9c04348E093473C5b176Cb4b103fF706528bf"
}

const topics = {
  agreementCreated: "AgreementCreated(address)",
  accountDeployed: "AccountDeployed(address)"
}

const eventAbis = {
  agreementCreated: "event AgreementCreated(address agreement)",
  accountDeployed: "event AccountDeployed(address indexed account)"
}

const abis = {
  info: "function info() view returns (tuple(address leverage, uint32 apy, uint256 totalDepositThreshold, address[] collaterals, address[] lenders, address[] borrowers) metadata, tuple(address[] tokens, address[] operators) whitelist)",
  totalBorrowed: "function totalBorrowed() returns (uint256)",
}

// Arkis Wrapped HYPE Vault addresses
const arkis_wrapped_hype_vaults = [
  "0x454F936D5877Daf9366Ef1Fca1bDF888201Bb127", // Primary HYPE Vault address
  "0xA1C0ae02D6B40F6D71bfAee9Aa27f3dCc75a63D8"  // X Upshift HYPE Vault address
];

// ERC-20 tokens to track in Hyperliquid vaults
const tokens_to_track = [
  ADDRESSES.hyperliquid.WHYPE,
  ADDRESSES.hyperliquid.wstHYPE 
];

const blacklist = [
  '0x8fccfd6404da2026eee7e4f529b45f3caaf0594e',
  '0x4956b52ae2ff65d74ca2d61207523288e4528f96'
]

const fetchFactoryLogs = async (api, type) => {
  const fromBlock = 21069508;
  const topic = type === "agreement" ? topics.agreementCreated : topics.accountDeployed;
  const eventAbi = type === "agreement" ? eventAbis.agreementCreated : eventAbis.accountDeployed;
  const logs = await getLogs({ api, extraKey: type, target: factories[type], topic, eventAbi, onlyArgs: true, fromBlock });
  return logs.map((log) => log[0]);
}

const getTokens = async (api, agreementAddresses) => {
  const tokenSet = new Set();
  const rawInfos = await api.multiCall({ calls: agreementAddresses, abi: abis.info });
  const infos = rawInfos.filter(({ metadata }) => metadata.leverage !== ADDRESSES.null);

  infos.forEach(({ metadata, whitelist }, i) => {
    tokenSet.add(metadata.leverage);
    metadata.collaterals.forEach(token => tokenSet.add(token));
    whitelist.tokens.forEach(token => tokenSet.add(token));
  });

  if (tokenSet.has(native)) {
    tokenSet.delete(native);
    tokenSet.add(ADDRESSES.null);
  }

  return Array.from(tokenSet);
}

const tvl = async (api) => {
  const [agreements, marginAccounts] = await Promise.all([
    fetchFactoryLogs(api, "agreement"),
    fetchFactoryLogs(api, "marginAccount")
  ])

  const tokens = (await getTokens(api, agreements)).filter(t => !blacklist.includes(t.toLowerCase()))
  const owners = [...agreements, ...marginAccounts]
  return sumTokens2({ api, owners, tokens, resolveLP: true, unwrapAll: true });
}

const borrowed = async (api) => {
  const agreements = await fetchFactoryLogs(api, "agreement");
  const [infos, totalBorrowed] = await Promise.all([
    api.multiCall({ calls: agreements, abi: abis.info }),
    api.multiCall({ calls: agreements, abi: abis.totalBorrowed })
  ])

  infos.forEach(({ metadata }, i) => {
    if (metadata.leverage === ADDRESSES.null) return;
    api.add(metadata.leverage, totalBorrowed[i]) 
  })
}

async function tvlHyperliquid(api) {
  const tokens = [ADDRESSES.null, ...tokens_to_track];
  return sumTokens2({ api, owners: arkis_wrapped_hype_vaults, tokens: tokens });
}

module.exports = {
  methodology: "On Ethereum, TVL includes leverage assets, collaterals, whitelisted tokens, ETH, and LP tokens held in agreements and margin accounts created by factory contracts. " +
               "On Hyperliquid, TVL reflects the native HYPE, WHYPE and stHYPE held at the Arkis Wrapped HYPE Vaults, which back the tokens issued on Ethereum.",
  ethereum: { tvl, borrowed },
  hyperliquid: { tvl: tvlHyperliquid },
}
