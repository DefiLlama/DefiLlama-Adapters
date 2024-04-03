export const tvl = async () => {
    return fetch("https://api-mainnet-dusa.up.railway.app/tvl").then((res) =>
        res.json()
    );
};
