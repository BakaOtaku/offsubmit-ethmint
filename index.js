const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
const fs = require("fs");
let multer = require('multer');
const crypto = require("crypto");
const ipfsAPI = require('ipfs-api');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { CourseCreatorAddress, CourseCreatorAbi, CourseAbi, CourseCreatorBytecode } = require('./config')

const app = express();
app.use(bodyParser.json());
app.use(cors());
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname)
    },
    filename: function (req, file, cb) {
        cb(null, "aman.pdf")
    }
})
var upload = multer({ storage: storage })

// Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })

const Web3 = require('web3');
let web3 = new Web3("")

let faucetPublicKey;

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
// Submit file hash on bc
async function submit(privateKey, courseAddress, filehash) {
    const provider = new HDWalletProvider(privateKey, "http://localhost:8545")
    web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()

    const courseContract = new web3.eth.Contract(CourseAbi, courseAddress)
    await courseContract.methods.submit(filehash).send({ from: accounts[0] }, (error, result) => { console.log(result) })
    return "true"
}
// Create a file Hash
function fileHash(path) {
    return new Promise(function (resolve, reject) {
        const hash = crypto.createHash('sha256');
        const input = fs.createReadStream(path);

        input.on('error', reject);

        input.on('data', function (chunk) {
            hash.update(chunk);
        });

        input.on('close', function () {
            resolve(hash.digest('hex'));
        });
    });
}


// Routes 

/* 
    /newStudentWallet
    /submit/:privateKey/:courseAddress/:fileHash
    /fileHashMatch
    /ipfsStore
    /encrypt
    /twillioTest
    /
*/
// Create new Wallet
app.use('/newStudentWallet', async (req, res) => {
    await web3.eth.accounts.create()
    console.log(JSON.stringify(newAccount))
    web3 = new Web3("http://localhost:8545")

    faucetPublicKey = await web3.eth.getAccounts(console.log)

    web3.eth.sendTransaction({
        from: await faucetPublicKey[0],
        to: newAccount.address,
        value: '100000000000000000'
    }, (error, hash) => {
        console.log("error")
    }).then((receipt) => {
        console.log(receipt)
    });
    console.log({ "publicKey": newAccount.address, "privateKey": newAccount.privateKey.substring(2) })

    res.send(`${newAccount.privateKey.substring(2)} ${newAccount.address}`);
})

app.use(`/submit/:privateKey/:courseAddress/:fileHash`, async (req, res) => {
    const { privateKey, courseAddress, fileHash } = req.params;
    // submit(privateKey, courseAddress, fileHash);
    console.log(privateKey, courseAddress, fileHash);
    res.send("true");
})


app.use('/fileHashMatch', upload.single('file'), (req, res) => {
    const file = req.file;
    const { comparisonHash } = req.body;
    console.log(comparisonHash)
    console.log(file);
    fileHash('aman.pdf')
        .then((result) => {
            console.log(result);
            result = result.substr(0, 45);
            console.log(result);
            if (result == comparisonHash)
                res.status(201).send(`verified`);
            else
                res.status(201).send(`notverified`);
        }).catch((err) => {
            console.log("Error");
        })
})


app.use('/ipfsStore', upload.single('file'), (req, res) => {
    const file = req.file;
    if (file === null) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    var temp = fs.readFileSync('aman.pdf');
    // Creating buffer for ipfs function to add file to the system
    let testBuffer = Buffer.from(temp);
    ipfs.files.add(testBuffer, function (err, result) {
        if (err) {
            console.log(err);
        }
        fileHashVal = result[0].hash
        console.log(fileHashVal)
        res.status(201).send(fileHashVal);
    })

})

// Encrypt
app.post('/encrypt', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (file === null) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    const ALGORITHM = 'aes-128-ecb';
    let ENCRYPTION_KEY = "";
    for (let i = 0; i < 16; i++) {
        ENCRYPTION_KEY += Math.floor(Math.random() * 10);
    }
    console.log(ENCRYPTION_KEY);
    // const ENCRYPTION_KEY = "7552383524831970";
    var IV = Buffer.alloc(0);
    console.log(file);
    var cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
    var input = fs.createReadStream('aman.pdf');
    var output = fs.createWriteStream('encrypted.enc');

    await input.pipe(cipher).pipe(output);

    await output.on('finish', function () {
        console.log('Encrypted file written to disk!');
        var temp = fs.readFileSync('encrypted.enc');
        // Creating buffer for ipfs function to add file to the system
        let testBuffer = Buffer.from(temp);
        let fileHashVal = "";
        ipfs.files.add(testBuffer, function (err, result) {
            if (err) {
                console.log(err);
            }
            fileHashVal = result[0].hash
            console.log(fileHashVal)
            console.log(`${ENCRYPTION_KEY} ${fileHashVal}`);
            res.status(201).send(`${ENCRYPTION_KEY} ${fileHashVal}`);
        })
    });
    output.on('error', function (e) {
        console.log(e);
    });
})


app.use('/twillioTest', (req, res) => {
    let accountSid = 'ACa7a06b4433795fe56454074098ff87e7';
    let authToken = '';
    let client = new twilio(accountSid, authToken);

    let respMessage = "";
    client.messages.list({
        limit: 1
    })
        .then(messages => {
            respMessage = messages[0];
        })

    // respMessage="97d8cb40d55f97fa4a9dcbb9d89b159128b95043edfd835467553f3b5c69d7af 0x5BA3Ad623fFcAF030760405a10eBF44fB04eD774 hi";
    respMessage.trim(' ');
    respMessage.split(':');
    const [privateKey, courseAddress, fileHash] = respMessage;
    submit(privateKey, courseAddress, fileHash);
    res.status(201).send("Printed all logs");
});

// Main Server
app.use('/', (req, res) => {
    console.log('Here');
    res.status(201).send("Main server");
});

// deployContract()
newAccount()
// submit("97d8cb40d55f97fa4a9dcbb9d89b159128b95043edfd835467553f3b5c69d7af","0x8FACefb6d5Ca1F2d7bCF88FbaAe1093bae733895","hi4")

// ethermintcli keys unsafe-export-eth-key mykey 


app.listen(4000, () => {
    console.log('Listening on 4000');
});
