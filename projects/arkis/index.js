const { getLogs } = require("../helper/cache/getLogs");
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require("../helper/unwrapLPs");

const native = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

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

  const tokens = await getTokens(api, agreements);
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

module.exports = {
  methodology: "TVL is calculated by summing the balances of leverage assets, collaterals, and whitelisted tokens held in agreements and margin accounts deployed by factory contracts. Native tokens and LP tokens are also included.",
  ethereum : { tvl, borrowed }
}