const { getLogs2 } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json');

const CONFIG = {
  ethereum: { factory: '0x51413048f3dfc4516e95bc8e249341b1d53b6cb2', fromBlock: 22469387 },
  // Base has additional active factories that include test/demo usage and are intentionally excluded.
  base:     { factory: '0x51413048f3dfc4516e95bc8e249341b1d53b6cb2', fromBlock: 30144156 },
  arbitrum: { factory: '0x51413048f3dfc4516e95bc8e249341b1d53b6cb2', fromBlock: 336006373 },
};

const corpDeployedAbi = 'event CyberCorpDeployed(address indexed cyberCorp, address indexed auth, address indexed issuanceManager, address dealManager, string cyberCORPName, string cyberCORPType, string cyberCORPContactDetails, string cyberCORPJurisdiction, string defaultDisputeResolution, address companyPayable)';
const roundManagerAbi = 'event RoundManagerDeployed(address indexed cyberCorp, address indexed roundManager)';
const dealProposedAbi = 'event DealProposed(bytes32 indexed agreementId, address[] certAddress, uint256[] certId, address paymentToken, uint256 paymentAmount, bytes32 templateId, address corp, address dealRegistry, address[] parties, address[] conditions, bool hasSecret)';
const eoiSubmittedAbi = 'event EOISubmitted(bytes32 agreementId, bytes32 indexed roundId, address investor, address indexed corp, uint256 minAmount, uint256 maxAmount, uint256 expiry)';
const getRoundAbi = 'function getRound(bytes32 roundId) view returns ((bytes32 id,uint8 seriesType,uint256 raiseCap,uint256 minTicket,uint256 maxTicket,uint8 roundType,uint256 startTime,uint256 endTime,bytes32 templateId,address[] certPrinter,address paymentToken,uint256 pricePerUnit,uint256 valuation,uint256 raised,address[] roundConditions,uint256 roundPricePerShare,uint8 roundPriceDecimals,uint8 primarySecurityClass,uint8 primarySecuritySeries,address authorityOfficer,string officerName,string officerTitle,string[] legalDetails,bytes[] extensionData,string[] roundPartyValues,bytes escrowedSignature,bool publicRound,bool allowTimedOffers))';

async function tvl(api) {
  const { factory, fromBlock } = CONFIG[api.chain];

  const [corps, rounds] = await Promise.all([
    getLogs2({ api, target: factory, fromBlock, eventAbi: corpDeployedAbi, onlyArgs: true, extraKey: 'corp' }),
    getLogs2({ api, target: factory, fromBlock, eventAbi: roundManagerAbi, onlyArgs: true, extraKey: 'round' }),
  ]);

  const isValid = a => a && a.toLowerCase() !== ADDRESSES.null;
  const dealManagers  = [...new Set(corps.map(c => c.dealManager).filter(isValid))];
  const roundManagers = [...new Set(rounds.map(r => r.roundManager).filter(isValid))];

  const tokensAndOwners = [];

  // DealManagers: payment token is in the DealProposed event
  for (const mgr of dealManagers) {
    const deals = await getLogs2({ api, target: mgr, fromBlock, eventAbi: dealProposedAbi, onlyArgs: true, extraKey: 'deal' }).catch(() => []);
    for (const { paymentToken } of deals)
      if (paymentToken) tokensAndOwners.push([paymentToken, mgr]);
  }

  // RoundManagers: EOISubmitted gives roundId, getRound() returns paymentToken
  for (const mgr of roundManagers) {
    const eois = await getLogs2({ api, target: mgr, fromBlock, eventAbi: eoiSubmittedAbi, onlyArgs: true, extraKey: 'eoi' }).catch(() => []);
    const roundIds = [...new Set(eois.map(e => e.roundId).filter(Boolean))];
    if (!roundIds.length) continue;
    const roundData = await api.multiCall({
      abi: getRoundAbi,
      calls: roundIds.map(id => ({ target: mgr, params: [id] })),
      permitFailure: true,
    });
    for (const r of roundData) {
      const paymentToken = r?.paymentToken ?? r?.[10];
      if (paymentToken) tokensAndOwners.push([paymentToken, mgr]);
    }
  }

  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  methodology: 'Tracks payment tokens escrowed in MetaLeX deal and round managers during in-flight fundraising deals and rounds across all deployed CyberCORP entities on Ethereum, Base, and Arbitrum. Escrowed value represents committed investor capital locked in trustless escrow awaiting deal close conditions, per the MetaLeX CyberCORPs protocol.',
  start: '2025-05-12',
  hallmarks: [['2025-05-12', 'CyberCorps mainnet launch']],
  ethereum: { tvl },
  base: { tvl },
  arbitrum: { tvl },
};
