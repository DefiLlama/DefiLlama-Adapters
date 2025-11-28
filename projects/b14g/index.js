const {getLogs2} = require("../helper/cache/getLogs");
const {sumTokens} = require("../helper/chain/bitcoin");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const {queryContractWithRetries, queryV1Beta1} = require("../helper/chain/cosmos");
const {PromisePool} = require("@supercharge/promise-pool");
const CORE_ASSETS = require("../helper/coreAssets.json");

module.exports = {
    babylon: {
        tvl: async function tvl(api) {
            const marketplace_contract = "bbn1ts0rxh55zha7gwh6a8q0yd224g0lfjlqsm53zrc85knx602k8fvs0y3mlg"
            const orderCount = await queryContractWithRetries({
                contract: marketplace_contract,
                chain: api.chain,
                data: {get_order_count: {}},
            });
            let data = [];
            if (orderCount) {
                let params = [];
                let batch = 30;
                for (let i = 0; i < orderCount; i += batch) {
                    params.push({list_order: {start: i, limit: batch}});
                }

                const {results, errors} = await PromisePool
                    .withConcurrency(25)
                    .for(new Array(params.length).fill(marketplace_contract))
                    .process(
                        async (contract, index) => queryContractWithRetries(
                            {
                                contract,
                                chain: api.chain,
                                data: params[index]
                            }
                        )
                    )
                data = [...new Set(results.flat().map(el => el.order))]
            }
            let totalStakedAmount = 0
            if (data.length) {
                const {results, errors} = await PromisePool
                    .withConcurrency(25)
                    .for(data)
                    .process(
                        async (contract, index) => queryV1Beta1({
                            chain: api.chain,
                            url: `staking/v1beta1/delegations/${contract}`
                        }))

                let delegationAmounts = results.map(el => el.delegation_responses.filter(el => el.balance.denom === "ubbn")).flat().map(el => parseInt(el.balance.amount))
                totalStakedAmount = delegationAmounts.reduce((acc, el) => acc + el)
            }
            const token = CORE_ASSETS.babylon.BABY;
            api.add(token, totalStakedAmount);

        }
    },
    core: {
        tvl: async function tvl(api) {
            const logs = await getLogs2({
                api,
                target: "0x04EA61C431F7934d51fEd2aCb2c5F942213f8967",
                eventAbi: 'event CreateRewardReceiver(address indexed from, address indexed rewardReceiver, uint256 portion, uint256 time)',
                fromBlock: 19942300,
            })
            const receiverRewards = logs.map(i => i.rewardReceiver)
            const coreStakeAmounts = await api.multiCall({abi: 'uint256:totalCoreStake', calls: receiverRewards})
            const totalCoreStakedVault = await api.call({
                target: "0xee21ab613d30330823D35Cf91A84cE964808B83F",
                abi: 'uint256:totalStaked',
            });


            const totalWBTCStakedWBTCVault = await api.call({
                target: "0x2e3ea6cf100632a4a4b34f26681a6f50347775c9",
                params: "0xa3CD4D4A568b76CFF01048E134096D2Ba0171C27",// wbtc vault address

                abi: "erc20:balanceOf",
            });

            const totalWBTCStakedWBTCVaultV2 = await api.call({
                target: "0x2e3ea6cf100632a4a4b34f26681a6f50347775c9",
                params: "0xdf0335ADe9fc8eaac71953F290eC1B45b8D72481",// wbtc vault v2 address

                abi: "erc20:balanceOf",
            });

            api.addGasToken([...coreStakeAmounts, totalCoreStakedVault]);
            api.addToken("0x5832f53d147b3d6cd4578b9cbd62425c7ea9d0bd",parseInt(totalWBTCStakedWBTCVault)+parseInt(totalWBTCStakedWBTCVaultV2))
        }
    },
    bitcoin: {
        tvl: async () => {
            let owners = await bitcoinAddressBook.b14g()
            return sumTokens({owners})
        }
    }
}
