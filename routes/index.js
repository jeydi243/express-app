var express = require('express');
var router = express.Router();
const bnUtil = require('../services/logic');
var BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
let User = require('../services/db');
var crypto = require('crypto-random-string');

/**RETIENT UNE REQUETE GET:  req.query */


router.post('/Connexion',(req, res) => {
    var response = ""
    console.log(req.body.login);
    console.log(req.body.pass);
    if (req.body.login == "admin" && req.body.pass == "adminpw") {
        response = {cardToUse: "admin@pharmatrack",typeEtablissement:"admin"}
        res.send(response);
    } else {
        User.findOne({
            login: req.body.login,
            pass: req.body.pass
        },function (err, user) {
            if(!err){
                response = {
                    cardToUse: user.cardToUse,
                    typeEtablissement: user.typeEtablissement,
                    numAutorisation: user.numAutorisation,
                    login: user.login,
                    pass: user.pass
                }
                console.log(user);
                res.send(user);
            }else{
                console.log(err);
            }
        });
    }
    
})

router.post('/addPharmacien', async function (req, res, next) {
    //console.log("le corps d'une requete post est: " + req.body.numeroOrdre);
    let result = "resultat de l'operation"
    try {
        result = await bnUtil.AddPharmacien(req.body);
    } catch (error) {
        console.log(error);
    }
    console.log(result);

    res.send(result);
});

router.post('/addEtablissement', async function (req, res, next) {
    let result = ""
    try {
        result = await bnUtil.AddEtablissement(req.body);
    } catch (error) {
        console.log(error);
    }
    res.send(result);
});

router.post('/getEtablissements', async function (req, res, next) {
    let all = [];

    try {
        all = await bnUtil.getEtablissements(req.body.typeEtablissement);
        console.log(req.body.typeEtablissement);
        res.send(all);
    } catch (error) {
        console.log(error.stack);
    }
    
})
router.post("/addMedicament", async function(req,res, next){

    console.log("addMedicament: ",req.body);

    try{
        var reponse = await bnUtil.AddMedicament(req.body);
        res.send("je sui");
    }catch(err){
        console.log(err.stack);
    };
});
router.post('/getAssets', async function (req, res, next) {
    console.log("------Query----\n ",req.body);
    var Assets =[]

    try {
        Assets = await bnUtil.getAssets(req.body);
        res.send(Assets);
    } catch (error) {
        console.log(error.stack);
    }
    
})

router.post('/AddBonLivraison', (req, res) => {
    let result;
    try {
        result = bnUtil.AddBonLivraison(Object.assign(req.body,req.query));
    } catch (error) {
        
    } 
    res.send(1);
});

router.post('/AddBonCommande', async(req, res) => {
    let result = "vide";
    try {
        result = await bnUtil.AddBonCommande(req.body);
        res.send(result);
    } catch (error) {
        console.log(error.stack);
    }

    
});

router.get('/ListeDesIdentites', async function (req, res) {
    let list = null
    try {
        list = await bnUtil.ListDesIdentites();
    } catch (error) {
        console.log(error);
    }
    res.send(list);
});

router.get('/test', async function (req, res) {
    let fd, epa = null
    let transaction  = "H";
    try {
        fd = await bnUtil.testConnection();
        //epa = await bnUtil.ListDesIdentites();
        //fd = await bnUtil.bitsecret2();
        //transaction = await bnUtil.testTransaction();
    } catch (error) {
        console.log(error);
    }
    console.log("Resultat transaction: ", fd)
    res.send(transaction);
});

router.post('/IsEtablissement', async function (req, res) {
    let result = false;

    try {
        result = await bnUtil.IsEtablissement(req.body);
    } catch (error) {
        console.log(error.stack);   
    }
    res.send(result);
});

router.post('/IsPharmacien', async function (req, res) {
    let result = false;
    try {
        result = await bnUtil.IsPharmacien(req.body.valeur);
    } catch (error) {
        console.log(error);
    }
    res.send(result);
});

router.get('/IsMedicament', async function(req, res) {
    let bv = ""
    try {
        bv = await bnUtil.IsMedicament(obj);
    } catch (error) {
        console.log(error);
    }
    res.send("Operation d'enregistrement");
});

router.get('/getTrace', async function(req, res) {

    let result;
    bnUtil.getTrace(req.query.code).then((result) => {
        console.log(result);
        res.send(result);
    }).catch((err) => {
        console.log(err.stack); 
    });

   
});

router.post('/confirmerLivraison', async function(req, res) {
    let result;
    bnUtil.ConfirmerLivraison(req.body.code).then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err.stack); 
    });

   
});
router.post('/IsBonLivraison', (req, res) => {
    try {
        var result = await bnUtil.IsBonLivraison(req.body);
        res.send(result)
    } catch (error) {
        console.log(error.stack);
    }
});
router.post('/IsBonCommande', (req, res) => {
    try {
        var result = await bnUtil.IsBonCommande(req.body);
        res.send(result)
    } catch (error) {
        console.log(error.stack);
    }
});

router.get('/find', (req, res) => {
    let resultat =""
    User.find({},"login pass numAutorisation cardToUse typeEtablissement",{lean:true}).exec((err,docs)=>{
        console.log(docs);
        resultat = docs
    });

    res.send(resultat);
});

router.get('/getCrypto', (req, res) => {
    res.send(crypto({length:7,type: 'base64'}));
});

module.exports = router;