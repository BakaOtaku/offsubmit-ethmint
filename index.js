const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var twilio = require('twilio');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { CourseCreatorAddress, CourseCreatorAbi, CourseAbi, CourseCreatorBytecode } = require('./config')


const app = express();
app.use(bodyParser.json());
app.use(cors());

const Web3 = require('web3');
let web3 = new Web3("")

let faucetPublicKey;

// Create new account
async function newAccount() {
    let newAccount = web3.eth.accounts.create()
    console.log(JSON.stringify(newAccount))
    web3 = new Web3("http://localhost:8545")

    faucetPublicKey = await web3.eth.getAccounts(console.log)

    web3.eth.sendTransaction({
        from: await faucetPublicKey[0],
        to: newAccount.address,
        value: '100000000000000000'
    }, function (error, hash) {
        console.log("error")
    }).then(function (receipt) {
        console.log(receipt)
    });

    console.log({ "publicKey": newAccount.address, "privateKey": newAccount.privateKey.substring(2) })
    return { "publicKey": newAccount.address, "privateKey": newAccount.privateKey.substring(2) }
}

// Submit file hash on bc
async function submit(privateKey, courseAddress, filehash) {
    const provider = new HDWalletProvider(privateKey, "http://localhost:8545")
    web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()

    const courseContract = new web3.eth.Contract(CourseAbi, courseAddress)
    await courseContract.methods.submit(filehash).send({ from: accounts[0] }, (error, result) => { console.log(result) })
    return "true"
}

// 
async function deployContract() {
    web3 = new Web3("http://localhost:8545")
    faucetPublicKey = await web3.eth.getAccounts(console.log)

    let deploy_contract = new web3.eth.Contract(CourseCreatorAbi);
    let payload = {
        data: CourseCreatorBytecode
    }
    let parameter = {
        from: await faucetPublicKey[0],
        gas: web3.utils.toHex(800000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('1', 'gwei'))
    }
    deploy_contract.deploy(payload).send(parameter, (err, transactionHash) => {
        console.log('Transaction Hash :', transactionHash);
    }).on('confirmation', () => { }).then((newContractInstance) => {
        console.log('Deployed Contract Address : ', newContractInstance.options.address);
    })
}


// Routes 

/* 
    /getMessages
    /sendMessages
    /encrypt
*/
app.use('/getMessages', (req, res) => {
    var accountSid = 'ACa7a06b4433795fe56454074098ff87e7';
    var authToken = '';
    var client = new twilio(accountSid, authToken);

    client.messages.list({
        limit: 20
    })
        .then(messages => messages.forEach(m => console.log(m.body)));

    res.status(201).send("Printed all logs");
});
app.use('/sendMessages', (req, res) => {
    let { str } = req.body;
    console.log(str);
    var accountSid = 'ACa7a06b4433795fe56454074098ff87e7';
    var authToken = '';
    var client = new twilio(accountSid, authToken);

    client.messages.create({
        body: "Testing from 12059534747 to 919971466867 Aman",
        to: '+919971466867',
        from: '+12059534747'
    })
        .then((message) => console.log(message.sid));
    res.status(201).send("Sent the message");
});
app.use('/', (req, res) => {
    console.log('Here');
    res.status(201).send("Ok");
});



// deployContract()
// newAccount()
// submit("97d8cb40d55f97fa4a9dcbb9d89b159128b95043edfd835467553f3b5c69d7af","0x8FACefb6d5Ca1F2d7bCF88FbaAe1093bae733895","hi4")

// ethermintcli keys unsafe-export-eth-key mykey 




app.listen(4000, () => {
    console.log('Listening on 4000');
});