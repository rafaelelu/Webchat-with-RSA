$(function(){
    var socket = io.connect();
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $messageArea = $('#messageArea');
    var $userFormArea = $('#userFormArea');
    var $userForm = $('#userForm');
    var $users = $('#users');
    var $username = $('#username');
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
    let serverE = 0;
    let serverN = 0;

    
    $(document).ready(function(){
        socket.emit('send client keys', [e,n]);
    });
    

    socket.on('send server keys', function(data){
        serverE = new BigNumber(data[0]);
        serverN = new BigNumber(data[1]);
        console.log('serverE: ',serverE);
        console.log('serverN: ',serverN);
        console.log('e: ', e);
        console.log('n: ', n);
        console.log('d: ', d);
    });


    $messageForm.submit(function(event){
        event.preventDefault();
        let message = $message.val();
        let messageArray = [];
        for(let i = 0; i < message.length; i++){
            let character = message.charCodeAt(i);
            character = new BigNumber(character);
            character = encrypt(character, serverE, serverN);
            messageArray.push(character);
        }
        socket.emit('send message', messageArray);
        $message.val('');
    });

    socket.on('new message', function(data){
        let messageArray = data.msg;
        let message = '';
        for(let i = 0; i < messageArray.length; i++){
            let character = new BigNumber(messageArray[i]);
            character = decrypt(character,d,n);
            message += String.fromCharCode(character);
        }
        $chat.append('<div class="card card-body bg-light">'+data.user+': '+message+'</div>');
    });

    $userForm.submit(function(event){
        event.preventDefault();
        socket.emit('new user', $username.val(), function(data){
            if(data){
                $userFormArea.hide();
                $messageArea.show();
            }
        });
        $username.val('');
    });

    socket.on('get users', function(data){
        var html = '';
        for(let i = 0; i < data.length; i++){
            html += '<li class="list-group-item">'+data[i]+'</li>';
        }
        $users.html(html);
    });
});