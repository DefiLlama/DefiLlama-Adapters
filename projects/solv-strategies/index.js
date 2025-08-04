const { default: BigNumber } = require("bignumber.js");
const { getConfig } = require("../helper/cache");
const { queryAllium } = require('../helper/allium');

const addressUrl = 'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/solv-strategies.json';

async function tvl(api) {
    const address = (await getConfig('solv-protocol/strategies', addressUrl));

    if (!address[api.chain]) return

    const strategies = address[api.chain]["strategies"];
    const solvbtcAddress = address[api.chain]["solvbtc"];
    const routerV2 = address[api.chain]["routerV2"]

    const balances = await Promise.all(strategies.map(async (strategy) => {
        const [totalSupply, nav] = await Promise.all([
            api.call({
                abi: 'uint256:totalSupply',
                target: strategy.erc20,
            }),
            api.call({
                abi: 'function getSubscribeNav(bytes32 poolId_, uint256 time_) view returns (uint256 nav_, uint256 navTime_)',
                target: strategy.navOracle,
                params: [strategy.poolId, api.timestamp],
            }),
        ]);

        let adjustedTotalSupply = totalSupply;
        if (routerV2) {
            const balance = await calculateFromAllium(
                routerV2.contractAddress,
                routerV2.tokenAddress,
                solvbtcAddress,
                routerV2.requester,
                routerV2.fromBlock
            );
            adjustedTotalSupply = BigNumber(totalSupply).minus(BigNumber(balance)).toString();
        }

        const balance = BigNumber(adjustedTotalSupply)
            .times(BigNumber(nav.nav_).div(1e18))
            .toNumber();
        return [solvbtcAddress, balance];
    }));

    for (const item of balances) {
        if (item) {
            const [token, amount] = item;
            api.add(token, amount);
        }
    }

    return api.getBalances()
}

async function calculateFromAllium(contractAddress, tokenAddress, solvbtcAddress, requester, fromBlock) {
    const alliumQuery = `
WITH deposit_events AS (
    SELECT 
        block_time,
        block_number,
        tx_hash,
        contract_address,
        '0x' || substring(topics[1]::text, 27) as target_token,
        '0x' || substring(topics[2]::text, 27) as currency,
        '0x' || substring(topics[3]::text, 27) as depositor
    FROM berachain.logs
    WHERE contract_address = '${contractAddress.toLowerCase()}'
        AND topics[1] = '0x6937da7733b7e101e4ab6e3a3ec12fe857d7a7ca921348ef12feff7abfcee01a'
        AND topics[2] = '0x000000000000000000000000${tokenAddress.toLowerCase().slice(2)}'
        AND topics[3] = '0x000000000000000000000000${solvbtcAddress.toLowerCase().slice(2)}'
        AND topics[4] = '0x000000000000000000000000${requester.toLowerCase().slice(2)}'
        AND block_number >= ${fromBlock}
),
withdraw_events AS (
    SELECT 
        block_time,
        block_number,
        tx_hash,
        contract_address,
        bytea2numeric(substring(data, 1, 32)) as withdraw_amount,
        bytea2numeric(substring(data, 33, 32)) as redemption_id,
        '0x' || substring(topics[1]::text, 27) as target_token,
        '0x' || substring(topics[2]::text, 27) as currency,
        '0x' || substring(topics[3]::text, 27) as requester
    FROM berachain.logs
    WHERE contract_address = '${contractAddress.toLowerCase()}'
        AND topics[1] = '0x50aa488fffd286866bc78078718365f7c3880cf5f95179a61e37cf84c5fd76c5'
        AND topics[2] = '0x000000000000000000000000${solvbtcAddress.toLowerCase().slice(2)}'
        AND topics[3] = '0x000000000000000000000000${tokenAddress.toLowerCase().slice(2)}'
        AND topics[4] = '0x000000000000000000000000${requester.toLowerCase().slice(2)}'
        AND block_number >= ${fromBlock}
),
cancel_withdraw_events AS (
    SELECT 
        block_time,
        block_number,
        tx_hash,
        contract_address,
        bytea2numeric(substring(data, 1, 32)) as redemption_id,
        bytea2numeric(substring(data, 33, 32)) as target_token_amount,
        '0x' || substring(topics[1]::text, 27) as target_token,
        '0x' || substring(topics[2]::text, 27) as redemption,
        '0x' || substring(topics[3]::text, 27) as requester
    FROM berachain.logs
    WHERE contract_address = '${contractAddress.toLowerCase()}'
        AND topics[1] = '0xbcab14a9990bc1fc30373acf248d280252f63653e6ccdcbd1f7929552a84c738'
        AND topics[2] = '0x000000000000000000000000${tokenAddress.toLowerCase().slice(2)}'
        AND topics[4] = '0x000000000000000000000000${requester.toLowerCase().slice(2)}'
        AND block_number >= ${fromBlock}
),
filtered_deposits AS (
    SELECT 
        *,
        CASE 
            WHEN currency = '${solvbtcAddress.toLowerCase()}' 
                AND target_token = '${tokenAddress.toLowerCase()}'
                AND depositor = '${requester.toLowerCase()}'
            THEN true 
            ELSE false 
        END as is_valid_deposit
    FROM deposit_events
),
filtered_withdraws AS (
    SELECT 
        *,
        CASE 
            WHEN currency = '${tokenAddress.toLowerCase()}' 
                AND target_token = '${solvbtcAddress.toLowerCase()}'
                AND requester = '${requester.toLowerCase()}'
            THEN true 
            ELSE false 
        END as is_valid_withdraw
    FROM withdraw_events
),
filtered_cancel_withdraws AS (
    SELECT 
        *,
        CASE 
            WHEN target_token = '${tokenAddress.toLowerCase()}' 
                AND requester = '${requester.toLowerCase()}'
            THEN true 
            ELSE false 
        END as is_valid_cancel_withdraw
    FROM cancel_withdraw_events
)
SELECT 
    (SELECT COUNT(*) FROM filtered_deposits) as total_deposits,
    (SELECT COUNT(*) FROM filtered_deposits WHERE is_valid_deposit) as valid_deposits,
    (SELECT SUM(target_token_amount) FROM filtered_deposits WHERE is_valid_deposit) as total_deposit_amount,
    (SELECT COUNT(*) FROM filtered_withdraws) as total_withdraws,
    (SELECT COUNT(*) FROM filtered_withdraws WHERE is_valid_withdraw) as valid_withdraws,
    (SELECT SUM(withdraw_amount) FROM filtered_withdraws WHERE is_valid_withdraw) as total_withdraw_amount,
    (SELECT COUNT(*) FROM filtered_cancel_withdraws) as total_cancel_withdraws,
    (SELECT COUNT(*) FROM filtered_cancel_withdraws WHERE is_valid_cancel_withdraw) as valid_cancel_withdraws,
    (SELECT SUM(target_token_amount) FROM filtered_cancel_withdraws WHERE is_valid_cancel_withdraw) as total_cancel_withdraw_amount;
`;

    const results = await queryAllium(alliumQuery);

    const result = results[0];

    const totalDepositAmount = BigNumber(result.total_deposit_amount || 0);
    const totalWithdrawAmount = BigNumber(result.total_withdraw_amount || 0);
    const totalCancelWithdrawAmount = BigNumber(result.total_cancel_withdraw_amount || 0);

    const netBalance = totalDepositAmount.plus(totalCancelWithdrawAmount).minus(totalWithdrawAmount);

    return netBalance.toNumber() > 0 ? netBalance.toString() : 0;
}

['bsc', 'ethereum', 'avax', 'bob', 'berachain'].forEach(chain => {
    module.exports[chain] = {
        tvl
    }
})