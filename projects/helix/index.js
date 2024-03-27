const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getLogs } = require("../helper/cache/getLogs");
const { getChainTransform } = require("../helper/portedTokens");

const BLOCK_START = 19068863;
const HELIX_FACTORY_CONTRACT = '0x274515B23B9c4Dd616C88A6C5D715F5C88A4cc36';
const chain = 'ethereum'

let _deadAddresses

// get all deal address that has been created from Helix Factory contract through event `DealCreated`
const getDealAddresses = async (api) => {
    if (!_deadAddresses) _deadAddresses = _get()
    return _deadAddresses

    async function _get() {
        const logs = await getLogs({
            target: HELIX_FACTORY_CONTRACT,
            api,
            fromBlock: BLOCK_START,
            topic: "DealCreated(address,address,address,address,uint256)",
        });
        return logs.map((l) => "0x" + l.topics[1].substr(26));
    }
};

async function tvl(_, ethBlock, _2, { api }) {
    const dealAddresses = await getDealAddresses(api);

    const dealsTVL = (
        await sdk.api.abi.multiCall({
            calls: dealAddresses.map((dealAddress) => ({
                target: dealAddress,
                params: [],
            })),
            abi: abi.dealTVL,
            ethBlock,
        })
    ).output;

    const dealsCurrency = (
        await sdk.api.abi.multiCall({
            calls: dealAddresses.map((dealAddress) => ({
                target: dealAddress,
                params: [],
            })),
            abi: abi.dealCurrency,
            ethBlock,
        })
    ).output;

    const transform = await getChainTransform(chain);

    const balances = {};

    dealsTVL.map((dealTVL, index) => {
        const transformedDealCurrencyAddress = transform(dealsCurrency[index].output);
        sdk.util.sumSingleBalance(balances, transformedDealCurrencyAddress, dealTVL.output)
    })

    return balances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Calculate Helix Investment TVL Metrics',
    start: BLOCK_START,
    ethereum: {
        tvl,
    }
}; 