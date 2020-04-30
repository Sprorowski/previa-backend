const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const basename = "accounts.json";


let errMsg = "";

var app = express();

app.use(bodyParser.json());
app.get('/account', function (req, res) { 
  res.send('Hello World!');
});

app.post('/account', async (req, res)=>{ 
    const base = await readBase();
    if(!base){
      console.log(errMsg);
    }
    let lastId = 0;
    if(base.accounts.length){;
      lastId = base.accounts[base.accounts.length - 1].id;
    } 
    let account = {
      id: ++lastId,
      name: req.body.name,
      balance: req.body.balance
    }
    base.accounts.push(account);
    if(await updateBase(base)){        
      return res.status(201).send();;
    }else{
      return res.status(400).send();
    }
    
});

app.post('/deposit', (req, res) =>{
  let deposit = {
    accountId: req.body.accountId,
    balance: req.body.balance,
  }
  if(isNaN(deposit.accountId)){
    return res.status(400).send({msg: "Favor passar um id de conta valido, certifique que o paramentro é 'accountId'!"});
  }
  if(deposit.balance){
    const run = async () => {
      const base = await readBase();
      if(!base){
        console.log(errMsg);
      }
      let account;
      let found = false;
      base.accounts.forEach(element => {
        if(element.id == deposit.accountId) {
          element.balance += deposit.balance;
          element.balance.toFixed(2);
          found = true;
          account = element;

        }
      });
      if(!found){        
        return res.status(404).send({msg: `Conta de id: ${deposit.accountId} nao encontrado`});
      }
      console.log(base);
      if(await updateBase(base)){       
        return res.status(200).send(account);
      }else{
        return res.status(400).send();
      }
    }
    run();
  }
});

app.post('/withdraw', (req, res) =>{
  let deposit = {
    accountId: req.body.accountId,
    balance: req.body.balance,
  }
  if(isNaN(deposit.accountId)){
    return res.status(400).send({msg: "Favor passar um id de conta valido, certifique que o paramentro é 'accountId'!"});
  }
  if(deposit.balance){
    const run = async () => {
      const base = await readBase();
      if(!base){
        console.log(errMsg);
      }
      let account;
      let found = false;
      base.accounts.forEach(element => {
        if(element.id == deposit.accountId) {
          if(element.balance - deposit.balance > 0 ){
            element.balance -= deposit.balance;
          }else{
            throw res.status(400).send({msg: `Conta de id: ${deposit.accountId} não possui saldo suficiente`});
          }
          found = true;
          account = element;

        }
      });
      if(!found){        
        return res.status(404).send({msg: `Conta de id: ${deposit.accountId} nao encontrado`});
      }
      console.log(base);
      if(await updateBase(base)){       
        return res.status(200).send(account);
      }else{
        return res.status(400).send();
      }
    }
    run();
  }
});

app.get('/account/:id', (req, res) =>{
  const run = async () => {
    const base = await readBase();
    if(!base){
      console.log(errMsg);
    }
    account = false;
    base.accounts.forEach(element => {
      if(element.id == req.params.id) {    
        return account = element;
      }
    });       
    if(account){      
       return res.status(200).send(account);
    }
    return res.status(404).send({msg: `Conta de id: ${req.params.id} nao encontrado`});
 
  }
  run();
});


app.delete('/account/:id', (req, res) =>{
  const run = async () => {
    const base = await readBase();
    if(!base){
      console.log(errMsg);
    }
    found = false;
    base.accounts.forEach((element, index, object) => {
      if(element.id == req.params.id) {    
        object.splice(index, 1);
        return found = true;
      }
    });
    console.log(base);   
    if(found){      
      if(await updateBase(base)){            
        return res.status(200).send({msg: `Conta de id: ${req.params.id} removida com sucesso`});
      }else{
        return res.status(400).send();
      }
    }
    return res.status(404).send({msg: `Conta de id: ${req.params.id} nao encontrado`}); 

  }
  run();
});

app.listen(3000, function () {
  console.log('Ouvindo porta 3000...');
});

const readBase = () => new Promise((resolve, reject) => {
  fs.readFile(basename, 'utf8', (err, data) => {
    if (err){
      if(err.code === "ENOENT"){
        fs.writeFile(basename, "{\"accounts\": []}" ,'utf8', function(err){ 
          if(err)reject(err)
          else resolve(JSON.parse("{\"accounts\": []}"))
        });
      }else reject(err)        
    }        
    else resolve(JSON.parse(data))
  })
});

const updateBase = (base) => new Promise((resolve, reject) => {
  fs.writeFile(basename, JSON.stringify(base), 'utf8', function(err){
    if(err) reject (err)
    else resolve(true);
  });      
});  

