const sdk = require('@defillama/sdk');
const axios = require('axios');
// const BigNumber = require('bignumber.js');

// Inicializamos un array vacío para los contratos
// let CONTRACTS = [];

async function fetchPegs() {
    // Hacemos una solicitud POST al endpoint
    const response = await axios.post('https://sailingprotocol.org/api/sailingprotocol/public_analytics/get_onchain_instruments');

    // Extraemos los contratos del objeto 'pegs'
    const pegs = response.data.pegs;

    // let pegsDict = new Map()
    // // Iteramos sobre cada objeto en 'pegs' y extraemos las direcciones de los contratos
    // pegs.forEach((peg) => {
    //     // pegsDict.push(peg.address);
    //     pegsDict.set(peg.symbol, peg.address);
    // });

    // console.log(`pegsDict fetched: ${pegsDict.length}`);
    // console.log(pegsDict);
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

    // const pegTestAddress = pegs[0].address;
    // const pegTvl = await getPegTVL(networkName, networkBlockNumber, pegTestAddress);
    // console.log(pegTvl);
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
    // const totalSupply = pegsTotalSupplies.reduce((acc, currentValue) => acc.plus(currentValue), new BigNumber(0));
    // console.log(totalSupply.toString());

    // const tvlBigNumber = totalSupply.dividedBy(new BigNumber(10).pow(18));
    // // this number needs to account for the market price of each peg
    // console.log(tvlBigNumber);
    // console.log('here2');
    // const tvlStr = tvlBigNumber.toString();
    // console.log(tvlStr);
    const totalTvl = pegs.reduce((acc, peg) => acc + peg.tvl, 0);
    // console.log(totalTvl);
    // const totalTvl = 1234500000000000;
    // return totalTvl;
    return {
        [`kava:${pegs[0].address}`]: totalTvl,
    };
}


module.exports = {
    kava: {
        tvl: async (_timestamp, _ethBlock, chainBlocks) => {
            return await tvl("kava", chainBlocks.kava);
        },
    },
}
