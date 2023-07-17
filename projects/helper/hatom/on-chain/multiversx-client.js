const {
   Address,
   ContractFunction,
   ResultsParser,
   SmartContract,
} = require("@multiversx/sdk-core");
const { ApiNetworkProvider } = require("@multiversx/sdk-network-providers");

const publicApiEndpoint = "https://api.multiversx.com";

const apiNetworkProvider = new ApiNetworkProvider(publicApiEndpoint);

const parser = new ResultsParser();

const query = async ({ address, method, args }) => {
   try {
      const contractAddress = new Address(address);
      const contract = new SmartContract({
         address: contractAddress,
      });

      const query = contract.createQuery({
         func: new ContractFunction(method),
         args: args || [],
      });

      const queryResponse = await apiNetworkProvider.queryContract(query);

      const bundle = parser.parseUntypedQueryResponse(queryResponse);
      return bundle;
   } catch (e) {
      console.error(e);
      if (e.message.includes('timeout of 5000ms exceeded')) return 0;
      return null;
   }
};

module.exports = query;
