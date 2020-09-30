const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const {CourseCreatorAddress,CourseCreatorAbi,CourseAbi} = require('./config')

var web3 = new Web3("")

async function newAccount() {
    console.log(JSON.stringify(web3.eth.accounts.create()))
}

async function submit (privateKey, courseAddress, filehash) {
    // try {
    const provider = new HDWalletProvider(privateKey,"https://rpc-mumbai.matic.today/")
    web3=new Web3(provider)
    const accounts = await web3.eth.getAccounts()

    const courseContract = new web3.eth.Contract (CourseAbi,courseAddress)
    await courseContract.methods.submit(filehash).send ({from: accounts[0]},(error,result)=> {console.log(result)})
    // }
    // catch(e) {}
    console.log('hi there')
    return "true"
}


submit("97d8cb40d55f97fa4a9dcbb9d89b159128b95043edfd835467553f3b5c69d7af","0x8FACefb6d5Ca1F2d7bCF88FbaAe1093bae733895","hi4")