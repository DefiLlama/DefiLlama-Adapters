import axios from "axios"
import AsyncRetry = require("async-retry")

export default async function fetchURL(url: string) {
    return AsyncRetry(async () => await axios.get(url), {
        retries: 3
    } as AsyncRetry.Options)
}