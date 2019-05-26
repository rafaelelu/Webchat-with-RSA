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
      console.log('encryptedMessage: ', encryptedMessage);
      return encryptedMessage;
  }

  function decrypt(encryptedMessage, d, n){
      let decryptedMessage = encryptedMessage.exponentiatedBy(d).mod(n);
      //console.log('encryptedMessage^d: ',encryptedMessage.exponentiatedBy(d).valueOf());
      console.log('decryptedMessage: ', decryptedMessage);
      return decryptedMessage;
  }