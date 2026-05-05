const { getLogs } = require('../helper/cache/getLogs');

// CyberCorpFactory addresses
// Origin point for CyberCORP deployment
const CONFIG = {
    ethereum: {
        factory: '0x51413048f3dfc4516e95bc8e249341b1d53b6cb2',
        fromBlock: 22469387,
    },
    /**
     * Base has additional active factories, some of which are mixed production and testing usage
     * They are intentionally excluded pending confirmation from MetaLeX on which corps are non-production
     * 0xe73ea052c2891ce1668742142a6634df09c88512
     * 0xd426752b63bcb990c70c1b1662fabdba8d65487f
     * 0xba0077b7045b12d62d5f13feeefc957bc169bb7c
     * 0x8ee1695cbc727379a8a0c8c9aefb910c26d35880
     */
    base: {
        factory: '0x51413048f3dfc4516e95bc8e249341b1d53b6cb2',
        fromBlock: 30144156,
    },
    arbitrum: {
        factory: '0x51413048f3dfc4516e95bc8e249341b1d53b6cb2',
        fromBlock: 336006373,
    },
};

// ABI fragments
const ABI = {
    corpDeployed: 'event CyberCorpDeployed(address indexed cyberCorp, address indexed auth, address indexed issuanceManager, address dealManager, string cyberCORPName, string cyberCORPType, string cyberCORPContactDetails, string cyberCORPJurisdiction, string defaultDisputeResolution, address companyPayable)',
    roundManagerDeployed: 'event RoundManagerDeployed(address indexed cyberCorp, address indexed roundManager)',
    dealProposed: 'event DealProposed(bytes32 indexed agreementId, address[] certAddress, uint256[] certId, address paymentToken, uint256 paymentAmount, bytes32 templateId, address corp, address dealRegistry, address[] parties, address[] conditions, bool hasSecret)',
    eoiSubmitted: 'event EOISubmitted(bytes32 agreementId, bytes32 indexed roundId, address investor, address indexed corp, uint256 minAmount, uint256 maxAmount, uint256 expiry)',
    getRound: 'function getRound(bytes32 roundId) view returns ((bytes32 id,uint8 seriesType,uint256 raiseCap,uint256 minTicket,uint256 maxTicket,uint8 roundType,uint256 startTime,uint256 endTime,bytes32 templateId,address[] certPrinter,address paymentToken,uint256 pricePerUnit,uint256 valuation,uint256 raised,address[] roundConditions,uint256 roundPricePerShare,uint8 roundPriceDecimals,uint8 primarySecurityClass,uint8 primarySecuritySeries,address authorityOfficer,string officerName,string officerTitle,string[] legalDetails,bytes[] extensionData,string[] roundPartyValues,bytes escrowedSignature,bool publicRound,bool allowTimedOffers))',
};

const NULL_ADDRESSES = {
    zero: '0x0000000000000000000000000000000000000000',
    nativePlaceholder: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
};

async function tvl(api) {
    const chain = api.chain;
    const { factory, fromBlock } = CONFIG[chain];
    const toBlock = await api.getBlock();

    // Discover all deployed cyberCORP contracts from factory events
    const corpLogs = await getLogs({
        api,
        target: factory,
        eventAbi: ABI.corpDeployed,
        extraKey: 'corp-deployed',
        onlyArgs: true,
        fromBlock,
        toBlock,
    });

    // Collect all escrow instances (deal managers and round managers) from corp deployments and round manager events
    const dealManagers = new Set();
    corpLogs.forEach(({ dealManager }) => {
        if (dealManager && dealManager !== NULL_ADDRESSES.zero) dealManagers.add(dealManager);
    });

    const roundManagerLogs = await getLogs({
        api,
        target: factory,
        eventAbi: ABI.roundManagerDeployed,
        extraKey: 'round-manager-deployed',
        onlyArgs: true,
        fromBlock,
        toBlock,
    });

    const roundManagers = new Set();
    roundManagerLogs.forEach(({ roundManager }) => {
        if (roundManager && roundManager !== NULL_ADDRESSES.zero) roundManagers.add(roundManager);
    });

    // CyberCorp does not emit manager-change events.
    // If MetaLeX later migrates corp manager assignments, we can use block-bounded getter checks.

    const paymentTokensByEscrowAddress = new Map();

    // Collect payment token addresses from all known deal managers by parsing DealProposed events.
    await Promise.all([...dealManagers].map(async (dealManager) => {
        const deals = await getLogs({
            api,
            target: dealManager,
            eventAbi: ABI.dealProposed,
            extraKey: 'deal-proposed',
            onlyArgs: true,
            permitFailure: true,
            fromBlock,
            toBlock,
        });

        const paymentTokens = [...new Set(deals.map(({ paymentToken }) => paymentToken).filter(Boolean))];
        if (!paymentTokens.length) return;

        if (!paymentTokensByEscrowAddress.has(dealManager)) paymentTokensByEscrowAddress.set(dealManager, new Set());
        paymentTokens.forEach(token => paymentTokensByEscrowAddress.get(dealManager).add(token));
    }));

    // Collect round payment tokens by finding rounds with EOIs, then reading each round's paymentToken.
    await Promise.all([...roundManagers].map(async (roundManager) => {
        const eois = await getLogs({
            api,
            target: roundManager,
            eventAbi: ABI.eoiSubmitted,
            extraKey: 'eoi-submitted',
            onlyArgs: true,
            permitFailure: true,
            fromBlock,
            toBlock,
        });

        const roundIds = [...new Set(eois.map(({ roundId }) => roundId).filter(Boolean))];
        if (!roundIds.length) return;

        const rounds = await api.multiCall({
            abi: ABI.getRound,
            calls: roundIds.map(roundId => ({ target: roundManager, params: [roundId] })),
            permitFailure: true,
        });

        rounds.forEach((round) => {
            const paymentToken = round?.paymentToken ?? round?.[10];
            if (!paymentToken) return;

            if (!paymentTokensByEscrowAddress.has(roundManager)) paymentTokensByEscrowAddress.set(roundManager, new Set());
            paymentTokensByEscrowAddress.get(roundManager).add(paymentToken);
        });
    }));

    // Sum escrowed payment token balances only for observed token/escrow-manager pairs.
    for (const [escrowAddress, tokens] of paymentTokensByEscrowAddress.entries()) {
        const filteredTokens = [...tokens].filter(token => {
            const normalized = token.toLowerCase();
            return normalized !== NULL_ADDRESSES.zero && normalized !== NULL_ADDRESSES.nativePlaceholder;
        });
        if (!filteredTokens.length) continue;

        const balances = await api.multiCall({
            abi: 'erc20:balanceOf',
            calls: filteredTokens.map(token => ({ target: token, params: escrowAddress })),
            permitFailure: true,
        });

        filteredTokens.forEach((token, i) => {
            const balance = balances[i];
            if (balance) api.add(token, balance);
        });
    }
}

module.exports = {
    methodology: [
        'Tracks payment tokens escrowed in MetaLeX deal and round managers ',
        'during in-flight fundraising deals and rounds across all deployed CyberCORP entities ',
        'on Ethereum, Base, and Arbitrum. ',
        'Escrowed value represents committed investor capital locked in trustless escrow ',
        'awaiting deal close conditions, per the MetaLeX CyberCORPs protocol.',
    ].join(''),
    misrepresentedTokens: false,
    timetravel: true,
    start: 1747079543,
    hallmarks: [
        ['2025-05-12', 'CyberCorps mainnet launch'],
    ],
    ethereum: { tvl },
    base: { tvl },
    arbitrum: { tvl },
};
