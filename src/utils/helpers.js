const getExplorerURL = (chainId) => {
    let baseURL;

    if (chainId === 1) {
        baseURL = 'https://etherscan.io'
    } else if (chainId === 56) {
        baseURL = 'https://bscscan.com'
    }
    
    return baseURL;
}

export {
    getExplorerURL
}

