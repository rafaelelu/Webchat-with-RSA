var express = require('express');
var app = express();
app.use(express.static('node_modules/bignumber.js'));
app.use(express.static('js'));
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var BigNumber = require('bignumber.js');
let users = [];
let connections = [];
let clients = [];
let keys = [];

server.listen(process.env.PORT || 3000);
console.log('Server running...');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    clients.push(socket.id);
    console.log('Connected: %s sockets connected.', connections.length);
    
    
    // Send client keys
    socket.on('send client keys', function(data){
        let primes = [17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
        let p = primes[Math.floor(Math.random()*(primes.length))];
        primes.splice(primes.indexOf(p), 1);
        let q = primes[Math.floor(Math.random()*(primes.length))];
        p = new BigNumber(p);
        q = new BigNumber(q);
        let n = p.multipliedBy(q);
        let phi = (p-1)*(q-1);
        phi = new BigNumber(phi);
        let e = chooseE(phi);
        let d = calculateD(e,phi);
        
        let clientKeys = data;
        clientKeys.push(d);
        clientKeys.push(n);
        clientKeys = clientKeys.map(function(value){
            return new BigNumber(value);
        });
        keys.push(clientKeys);
        console.log(keys);
        io.sockets.connected[clients[clients.length-1]].emit('send server keys', [e,n]);
    });

    // Disconnect
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        clients.splice(clients.indexOf(socket.id), 1);
        keys.splice(clients.indexOf(socket.id),1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected:  %s sockets connected.', connections.length);
    });

    // Send Message
    socket.on('send message', function(data){
        let messageArray = data;
        console.log(data);
        let clientNo = clients.indexOf(socket.id);
        messageArray = messageArray.map(function(value){
            return decrypt(new BigNumber(value), new BigNumber(keys[clientNo][2]), new BigNumber(keys[clientNo][3]));
        });
        for(let i = 0; i < clients.length; i++){
            let newMessageArray = [];
            for(let j = 0; j < messageArray.length; j++){
                let element = messageArray[j];
                let clientE = new BigNumber(keys[i][0]);
                let clientN = new BigNumber(keys[i][1]);
                element = encrypt(element, clientE, clientN);
                newMessageArray.push(element);
            }
            io.sockets.connected[clients[i]].emit("new message", {msg: newMessageArray, user: socket.username});
        }
        
    });

    // New User
    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }

    function gcd(a, b) {
        var r;
        while ((a % b) > 0)  {
          r = a % b;
          a = b;
          b = r;
        }
        return b;
      }
    
      function chooseE(phi){
          for(let i = 2; i < phi.valueOf(); i++){
              if(gcd(i,phi.valueOf()) === 1){
                return new BigNumber(i);
              }
          }
          return 0;
      }
    
      function calculateD(e,phi){
          let result = 0;
          for(let i = 1; i <= phi; i++){
              let x = e.multipliedBy(i);
              x = x.modulo(phi);
              if(x.isEqualTo(1)){
                  return new BigNumber(i);
              }
          }
      }
    
      function encrypt(message, e, n){
          let encryptedMessage = message.exponentiatedBy(e).mod(n);
          //console.log('message^e: ',message.exponentiatedBy(e).valueOf());
          return encryptedMessage;
      }
    
      function decrypt(encryptedMessage, d, n){
          let decryptedMessage = encryptedMessage.exponentiatedBy(d).mod(n);
          //console.log('encryptedMessage^d: ',encryptedMessage.exponentiatedBy(d).valueOf());
          return decryptedMessage;
      }
});