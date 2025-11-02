const {getLogs2} = require("../helper/cache/getLogs");
const {sumTokens} = require("../helper/chain/bitcoin");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
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
