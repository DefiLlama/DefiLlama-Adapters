const sdk = require('@defillama/sdk');
const axios = require('axios');

async function fetchPegs() {
    // Hacemos una solicitud POST al endpoint
    const response = await axios.post('https://sailingprotocol.org/api/sailingprotocol/public_analytics/get_onchain_instruments');

    // Extraemos los contratos del objeto 'pegs'
    const pegs = response.data.pegs;

    return pegs;
}

async function getPegTVL(networkName, networkBlockNumber, pegAddress) {
    const response = await sdk.api.abi.call({
        target: pegAddress,
        abi: "erc20:totalSupply",
        chain: networkName,
        block: networkBlockNumber
    });

    // Comprueba si el resultado es un número válido
    if (isNaN(response.output)) {
        console.error(`Invalid total supply for contract ${pegAddress}: ${response.output}`);
        // return new BigNumber(0);
        return new 0;
    }

    // return new BigNumber(response.output);
    return response.output;
}

async function tvl(networkName, networkBlockNumber) {
    console.log("getting tvl");
    const pegs = await fetchPegs();
    console.log(pegs);

    const pegsTotalSupplies = await Promise.all(
        pegs.map((peg) => getPegTVL(networkName, networkBlockNumber, peg.address))
    );
    console.log(pegsTotalSupplies);
    pegsTotalSupplies.forEach((pegSupply, index) => {
        console.log('todo: account for peg price');
        // TODO: multiply by peg prices
        // TODO: julio arregla esto despues gracias :)
        pegs[index].tvl = Number(pegSupply) / 1e18;
    });
    console.log(pegs);

    const totalTvl = pegs.reduce((acc, peg) => acc + peg.tvl, 0);

    // Agrega esta línea para registrar el valor de totalTvl antes de devolverlo
    console.log(`totalTvl: ${totalTvl}`);

    return { 'token1': totalTvl };

}

function getChainTvl(chain) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const tvlValue = await tvl(chain, chainBlocks[chain]);
        console.log(`Returned TVL value: ${tvlValue['token1']}`);
        return { ["kava"]: 2 };
    };
}

module.exports = {
    kava: {
        tvl: getChainTvl('kava'),
    },
}