const crypto = require("crypto");
// const Algorithm = "aes-128-ecb";
const fs = require("fs");

function Encrypt_AES() {

    const ALGORITHM = 'aes-128-ecb';
    const ENCRYPTION_KEY = "7552383524831970";
    var IV = Buffer.alloc(0);

    var cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
    var input = fs.createReadStream('Aman_Raj.pdf');
    var output = fs.createWriteStream('encrypted.pdf.enc');

    input.pipe(cipher).pipe(output);

    output.on('finish', function () {
        console.log('Encrypted file written to disk!');
    });
    output.on('error', function (e) {
        console.log(e);
     });
}
Encrypt_AES()


// sample file used : https://ipfs.io/ipfs/Qmd6cVGCXBEJPwN2xx9VpNjtU4M12Z9LaQkPKCgyoRHPJT
// password : 7552383524831970