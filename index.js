const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");
require('dotenv').config()
const app = express()
const port = 4000

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));




const serviceAccount = require("./genarateKey/volunteer-service-7e2cc-firebase-adminsdk-lnkv9-2cd8f57c94.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.picct.mongodb.net/volunteer?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const optionsCollection = client.db("volunteer").collection("options");
  const adminCollection = client.db("volunteer").collection("admin");
 

  app.get('/eventTask', (req, res)=>{
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith('Bearer ')){
          const idToken = bearer.split(' ')[1];
          
          // idToken comes from the client app
                    admin
                    .auth()
                    .verifyIdToken(idToken)
                    .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    if(tokenEmail === req.query.email){

                        adminCollection.find({email:req.query.email})
                        .toArray((err, documents)=>{
                            res.status(200).send(documents)
                        })

                    }
                    else{
                        res.status(401).send('un authorized access')
                    }
                    
                    // ...
                    })
                    .catch((error) => {
                        res.status(401).send('un authorized access')
                    // Handle error
                    });


      }
      else{
          res.status(401).send('un authorized access')
      }
   

})


  app.get('/allAdmin', (req, res)=>{
      adminCollection.find({})
      .toArray((err, documents)=>{
         
          res.send(documents)
      })
  })


  app.delete('/delete/:id', (req, res)=>{
      adminCollection.deleteOne({_id:ObjectId(req.params.id)})
      .then(result => {
          res.send(result.deletedCount > 0)
      })
  })
  
  app.post('/addEvent', (req, res)=>{
      const event = req.body;
      adminCollection.insertOne(event)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
  })
  app.get('/addOption/:id', (req, res)=>{
      optionsCollection.find({_id:ObjectId(req.params.id)})
      .toArray((err, documents)=>{
          res.send(documents[0])
      })
  })
  app.get('/options', (req, res)=>{
      optionsCollection.find({})
      .toArray((err, documents)=>{
          res.send(documents)
      })
  })
  app.post('/addOptions', (req, res)=>{
      const options = req.body
    
      optionsCollection.insertOne(options)
      .then(result=>{
          res.send(result.insertedCount > 0)
        
      })
     
      
  })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port);