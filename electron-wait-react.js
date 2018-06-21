const net = require('net');
const port = process.env.PORT ? (process.env.PORT - 100) : 3000;

console.log(process.env.PORT) //5100
console.log(port) // 5000

// process.env.ELECTRON_START_URL = `http://localhost:${port}`;
const exec = require('child_process').exec;
const client = new net.Socket();
exec('npm start');
let startedElectron = false;
const tryConnection = () => client.connect({port: port}, () => {
        client.end();
        if(!startedElectron) {
            console.log('starting electron');
            startedElectron = true;
           
            exec('npm run electron-dev');
        }
    }
);

tryConnection();

client.on('error', (error) => {
    setTimeout(tryConnection, 1000);
});