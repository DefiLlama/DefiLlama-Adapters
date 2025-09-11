const ALKIMI_TOKEN = "0x1a8f4bc33f8ef7fbc851f156857aa65d397a6a6fd27a7ac2ca717b51f2fd9489";
const STAKING_VAULT = "0xc92fe84368fc3ff40713792c750709501fcfc4869f120755fd0bea5cac1ead94";

module.exports = {
  timetravel: false,
  methodology: "TVL counts all ALKIMI tokens locked in the StakingVault (both user and admin stakes)",
  sui: {
    tvl: async (api) => {
      try {
        const axios = require('axios');

        const response = await axios.post('https://fullnode.mainnet.sui.io:443', {
          jsonrpc: "2.0",
          id: 1,
          method: "sui_getObject",
          params: [
            STAKING_VAULT,
            {
              showType: true,
              showOwner: true,
              showContent: true,
            }
          ]
        });

        const vaultData = response.data.result;

        if (vaultData?.data?.content?.fields) {
          const fields = vaultData.data.content.fields;
          const totalBalance = fields.balance || "0";
          const userLocked = fields.user_locked || "0";
          const adminLocked = fields.admin_locked || "0";

          // The balance field contains the total TVL (user + admin)
          api.add(ALKIMI_TOKEN, totalBalance);

          console.log("=== ALKIMI Staking TVL ===");
          console.log("Total Balance:", totalBalance);
          console.log("User Locked:", userLocked);
          console.log("Admin Locked:", adminLocked);
          console.log("========================");
        }
      } catch (error) {
        console.error("Error fetching staking data:", error.message);
      }

      return api.getBalances();
    }
  }
};