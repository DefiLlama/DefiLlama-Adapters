const { JsonRpcProvider } = require('ethers');
const { get } = require('../helper/http');
const { totalSupply } = require('@defillama/sdk/build/erc20');




async function getDEXTvl() {
    let total = 0;
    const rest = "https://rest.kopi.money";
    const fromDenom = 'ukusd';
    const dexLiquidity = await get(`${rest}/cosmos/bank/v1beta1/balances/kopi14t4jnhmjejj08x5w8f4t0r3lv820gvh85xw8np`);
    const denoms = dexLiquidity.balances;
    const promises = [];
    async function getPrices(endp, fromDen, toDen, amount) {
        const price = await get(`${endp}/kopi/dex/price?denom_giving=${fromDen}&denom_receiving=${toDen}`);
        // inj token
        if (toDen == 'ibc/DE63D8AC34B752FB7D4CAA7594145EDE1C9FC256AC6D4043D0F12310EB8FC255') {
            console.log(((amount / (10 ** 18)) * parseFloat(price.price)))
            return ((amount / (10 ** 18)) * parseFloat(price.price));
        } else {
            console.log(((amount / (10 ** 6)) * parseFloat(price.price)))
            return ((amount / (10 ** 6)) * parseFloat(price.price));

        }
    };
    for (let i = 0; i < denoms.length; i++) {
        console.log(denoms[i])
        promises.push(getPrices(rest, fromDenom, denoms[i].denom, denoms[i].amount));
    }
    async function getAll() {
        let price = 0;
        await Promise.all(promises)
            .then((result) => {

                for (let i = 0; i < promises.length; i++) {
                    price = price + result[i];
                }
                console.log("priceLTV: " + price);
                total = price;
            });
    }
    await getAll();
    console.log("total: "+total);
    return total;
}


module.exports = {
    timetravel: false,
    kopi: {
        tvl: async () => await getDEXTvl()
    }
};

