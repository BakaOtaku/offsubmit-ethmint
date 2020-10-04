const crypto = require("crypto");
// const Algorithm = "aes-128-ecb";
const fs = require("fs");

function Decrypt_AES() {

    const ALGORITHM = 'aes-128-ecb';
    const key = "7552383524831970";
    const ENCRYPTION_KEY = key;

    var IV = Buffer.alloc(0);
    var decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
    decipher.setAutoPadding(false);
    var input = fs.createReadStream('Encrypted.enc');
    var output = fs.createWriteStream('Decrypted.pdf');

    input.pipe(decipher).pipe(output);

    output.on('finish', function () {
        console.log('Decrypted file written to disk!');
    });
    output.on('error', function (e) {
        console.log(e);
     });
}

function Encrypt_AES() {

    const ALGORITHM = 'aes-128-ecb';
    const key = "7552383524831970";
    const ENCRYPTION_KEY = key;

    var IV = Buffer.alloc(0);
    var cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
    // cipher.setAutoPadding(false);
    var input = fs.createReadStream('60178910.pdf');
    var output = fs.createWriteStream('Encrypted.enc');

    input.pipe(cipher).pipe(output);

    output.on('finish', function () {
        console.log('Enrypted file written to disk!');
     Decrypt_AES()

    });
    output.on('error', function (e) {
        console.log(e);
     });
    

}
Encrypt_AES()


// sample file used : https://ipfs.io/ipfs/Qmd6cVGCXBEJPwN2xx9VpNjtU4M12Z9LaQkPKCgyoRHPJT
// password : 7552383524831970