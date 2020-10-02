const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const {CourseCreatorAddress,CourseCreatorAbi,CourseAbi,CourseCreatorBytecode} = require('./config')

var web3 = new Web3("")
var faucetPublicKey ;



async function newAccount() {
    var newAccount = web3.eth.accounts.create()
    console.log(JSON.stringify(newAccount))
    web3=new Web3("http://localhost:8545")

    faucetPublicKey = await web3.eth.getAccounts(console.log)

    web3.eth.sendTransaction({
        from: await faucetPublicKey[0],
        to: newAccount.address,
        value: '100000000000000000'
    },function(error, hash){
        console.log("error")
    }).then(function(receipt){
        console.log(receipt)
    });

    console.log({"publicKey": newAccount.address,"privateKey": newAccount.privateKey.substring(2)})
    return {"publicKey": newAccount.address,"privateKey": newAccount.privateKey.substring(2)}
}

async function submit (privateKey, courseAddress, filehash) {
    const provider = new HDWalletProvider(privateKey,"http://localhost:8545")
    web3=new Web3(provider)
    const accounts = await web3.eth.getAccounts()

    const courseContract = new web3.eth.Contract (CourseAbi,courseAddress)
    await courseContract.methods.submit(filehash).send ({from: accounts[0]},(error,result)=> {console.log(result)})    
    return "true"
}

async function deployContract () {

    web3=new Web3("http://localhost:8545")

    faucetPublicKey = await web3.eth.getAccounts(console.log)

    let deploy_contract = new web3.eth.Contract(CourseCreatorAbi);
    let payload = {
        data : CourseCreatorBytecode
    }
    let parameter = {
        from: await faucetPublicKey[0],
        gas: web3.utils.toHex(800000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('1', 'gwei'))
    }
    deploy_contract.deploy(payload).send(parameter, (err, transactionHash) => {
        console.log('Transaction Hash :', transactionHash);
    }).on('confirmation', () => {}).then((newContractInstance) => {
        console.log('Deployed Contract Address : ', newContractInstance.options.address);
    })
}

// deployContract()
// newAccount()
// submit("97d8cb40d55f97fa4a9dcbb9d89b159128b95043edfd835467553f3b5c69d7af","0x8FACefb6d5Ca1F2d7bCF88FbaAe1093bae733895","hi4")

// ethermintcli keys unsafe-export-eth-key mykey 

// 7552383524831970