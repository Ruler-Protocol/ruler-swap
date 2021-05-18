const getExplorerURL = (chainId) => {
    let baseURL;

    if (chainId === 1) {
        baseURL = 'https://etherscan.io'
    } else if (chainId === 56) {
        baseURL = 'https://bscscan.com'
    }
}

export {
  bnToFixed,
  multiplyBnToFixed,
  multiplyArray,
  sumArray,
  sumArrayBn,
  floatToFixed,
}

