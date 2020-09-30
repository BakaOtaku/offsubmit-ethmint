const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const {CourseCreatorAddress,CourseCreatorAbi,CourseAbi} = require('./config')

var web3 = new Web3("")
var faucetPrivateKey = "97d8cb40d55f97fa4a9dcbb9d89b159128b95043edfd835467553f3b5c69d7af"
var faucetPublicKey = "0x57Ac4E60a3fDaDec7e6b51b28488B392447801F4"

async function newAccount() {
    var newAccount = web3.eth.accounts.create()
    console.log(JSON.stringify(newAccount) +" Public key = "+ newAccount.address)
    const provider = new HDWalletProvider(faucetPrivateKey,"https://rpc-mumbai.matic.today/")
    web3=new Web3(provider)

    // web3.eth.sendTransaction({to:newAccount.address, from:faucetPublicKey, value:web3.utils.toWei("0.1", "ether")}).then(function(receipt){
    //     console.log(receipt)
    // })
    web3.eth.sendTransaction({
        from: faucetPublicKey,
        to: newAccount.address,
        value: '100000000000000000'
    },function(error, hash){
        console.log("error")
    }).then(function(receipt){
        console.log(receipt)
    });
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

newAccount()
// submit("97d8cb40d55f97fa4a9dcbb9d89b159128b95043edfd835467553f3b5c69d7af","0x8FACefb6d5Ca1F2d7bCF88FbaAe1093bae733895","hi4")