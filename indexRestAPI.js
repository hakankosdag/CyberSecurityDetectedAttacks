const express = require('express');
const app=express();
const bodyParser = require("body-parser");
var request = require('request');
const mongoose = require('mongoose');
const Excel = require('exceljs');
const fs = require('fs');
var http = require('http');
var dataController = require('./controllers/dataController.js');

app.set('view engine', 'ejs')  

var db
app.use(express.static('./public'));  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true , limit : '1mb'})); 

dataController(app);

var uri = "mongodb+srv://****************************************?retryWrites=true&w=majority";
mongoose.connect(uri);

var dangerrulez = new mongoose.Schema({
    ip:String,
    port:String,
    service:String,
    protocol:String,
    date:Date,
    referance:String
},{collection:'bruteforce'});
var malwarecore = new mongoose.Schema({
    ip:String,
    port:String,
    service:String,
    protocol:String,
    date:Date,
    referance:String
},{collection:'malware'});
var blackl = new mongoose.Schema({
    ip:String,
    port:String,
    service:String,
    protocol:String,
    date:Date,
    referance:String
},{collection:'sslBotnetBlacklist'});
var blockls = new mongoose.Schema({
    ip:String,
    port:String,
    service:String,
    protocol:String,
    date:Date,
    referance:String
},{collection:'c2botnetBlocklist'});
var sAttacks = new mongoose.Schema({
    ip:String,
    port:String,
    service:String,
    protocol:String,
    date:Date,
    referance:String
},{collection:'sshAttacks'});

var sshA = mongoose.model('sshA',sAttacks)
var botblist = mongoose.model('botblist',blockls)
var blist = mongoose.model('blist',blackl);
var malwcore = mongoose.model('malwcore',malwarecore);
var dangercol = mongoose.model('dangercol',dangerrulez);


// app.set('views', __dirname + '/views') 
 



app.get("/setBruteForcerulez",async (req,res)=>{
    request('http://danger.rulez.sk/projects/bruteforceblocker/blist.php', function (error, response, body) {
    var status;   
    body.split("\n").forEach(element => {
        if(element.includes(".")){
           element.split('\r\n').forEach(el =>{
                var newip = el.split('\t\t#')[0] 
                var newdate = el.split('\t\t#')[1].split('\t\t')[0].split(' ')[1].split(' ')[0]
                dangercol.findOneAndUpdate({ip : newip},{$set : { date : newdate, referance : "http://danger.rulez.sk"}},function(err,resp){
                    if(resp){
                        //console.log(resp)
                    }else{
                        var veri = new dangercol({
                            ip : newip,
                            date : newdate,
                            referance : "http://danger.rulez.sk"
                        })
                        veri.save(function(error,doc) {
                            if (error) status ="err"
                            else status = "ok"
                        }) 
                    }
                })
           })
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})
app.get("/getBruteForce",async(req,res) =>{
    dangercol.find(function(err,obj){
        if(obj)  res.render('ana',{todos:obj});
        else res.send(err);
    })
})
app.get("/getmalware",async(req,res) =>{
    malwcore.find(function(err,obj){
        if(obj)  res.render('ana',{todos:obj});
        else res.send(err);
    })
})
app.get("/getssh",async(req,res) =>{
    sshA.find(function(err,obj){
        if(obj)  res.render('ana',{todos:obj});
        else res.send(err);
    })
})
app.get("/getbotnet",async(req,res) =>{
    botblist.find(function(err,obj){
        if(obj)  res.render('ana',{todos:obj});
        else res.send(err);
    })
})
app.get("/getsslblack",async(req,res) =>{
    blist.find(function(err,obj){
        if(obj)  res.render('ana',{todos:obj});
        else res.send(err);
    })
})
app.get("/setMalwarecure",async (req,res)=>{
    request('http://api.cybercure.ai/feed/get_ips', function (error, response, body){
       var status;
       (JSON.parse(body).data.ip).forEach(element=>{
            malwcore.find({ip : element},function(err,resp){
                if(resp.length >= 1){
                    //console.log(resp)
                }else{
                    var veri = new malwcore({
                        ip : element,
                        date : Date.now(),
                        referance : "https://cybercure.ai/"
                    })
                    veri.save(function(error,doc) {
                        if (error) status ="err"
                        else status = "ok"
                    }) 
                }
            })
        })
        if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    })
})

app.get("/setMalwareUrlhausedu",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/edu/', function (error, response, body) {
    var status;
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g   
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newprotocol
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
                  
                    malwcore.find({ip : newip},function(err,resp){
                    if(resp.length>=1){
                        //console.log(resp)
                    }else{
                        var veri = new malwcore({
                            ip : newip,
                            port :newport,
                            service :newservice,
                            protocol :newprotocol,
                            date : newdate,
                            referance : "https://urlhaus.abuse.ch"
                        })
                        veri.save(function(error,doc) {
                            if (error) status ="err"
                            else status = "ok"
                        }) 
                    }
                })

                })              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setMalwareUrlhauscom",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/com/', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newprotocol
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
             
                    malwcore.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new malwcore({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://urlhaus.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })
              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setMalwareUrlhausnet",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/net/', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
              
                    malwcore.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new malwcore({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://urlhaus.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })
              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setMalwareUrlhausco",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/co/', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
          
                    malwcore.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new malwcore({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://urlhaus.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })
              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setMalwareUrlhausinfo",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/info/', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
          
                    malwcore.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new malwcore({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://urlhaus.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })
              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setMalwareUrlhausorg",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/org/', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
         
                    var veri = new malwcore({
                        ip : newip,
                        port :newport,
                        service :newservice,
                        protocol :newprotocol,
                        date : newdate,
                        referance : "https://urlhaus.abuse.ch"
                    })
                    veri.save(function(error,doc) {
                        if (error) status ="err"
                        else status = "ok"
                    }) 
                    /*
                    malwcore.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new malwcore({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://urlhaus.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })*/
                    
                })
              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setMalwareUrlhausbiz",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/biz/', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
             
                    malwcore.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new malwcore({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://urlhaus.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })
              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setMalwareUrlhauspro",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/pro/', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
       
                    malwcore.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new malwcore({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://urlhaus.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })
              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setMalwareUrlhauscat",async (req,res)=>{
    request('https://urlhaus.abuse.ch/feeds/tld/cat/', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split('"')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice = el.split('","')[1].split(':/')[0]
                    var newport = el.split(newip)[1].split('","')[1]
           
                    malwcore.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new malwcore({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://urlhaus.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })
              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setsslBlackList",async (req,res)=>{
    request('https://sslbl.abuse.ch/blacklist/sslipblacklist_aggressive.csv', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice 
                    var newport = el.split(newip)[1].split(',')[1]
            
                    blist.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            //console.log(resp)
                        }else{
                            var veri = new blist({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://sslbl.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setBotnetBlockList",async (req,res)=>{
    request('https://feodotracker.abuse.ch/downloads/ipblocklist_aggressive.csv', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes(",")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split(' ')[0]
                    var newip = el.match(r)[0]
                    var newprotocol
                    var newservice 
                    var newport = el.split(newip)[1].split(',')[1]
         
                    var veri = new botblist({
                        ip : newip,
                        port :newport,
                        service :newservice,
                        protocol :newprotocol,
                        date : newdate,
                        referance : "https://feodotracker.abuse.ch"
                    })
                    veri.save(function(error,doc) {
                        if (error) status ="err"
                        else status = "ok"
                    }) 
                    /*
                    botblist.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            console.log(resp)
                        }else{
                            var veri = new botblist({
                                ip : newip,
                                port :newport,
                                service :newservice,
                                protocol :newprotocol,
                                date : newdate,
                                referance : "https://feodotracker.abuse.ch"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })*/
                    
                })              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.get("/setsshAttacks",async (req,res)=>{
    request('http://charles.the-haleys.org/ssh_dico_attack_with_timestamps.php?days=30', function (error, response, body) {
    var status;  
    var r =  /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
    body.split("\n").forEach(element => {
        if(element.includes("(")& element.includes(".")){
                element.split("\n").forEach (el =>{
                    var newdate = el.split('(')[1].split(' ')[0]
                    var newip = el.match(r)[0]
                    sshA.find({ip : newip},function(err,resp){
                        if(resp.length>=1){
                            console.log(resp)
                        }else{
                            var veri = new sshA({
                                ip : newip,
                                date : newdate,
                                referance : "http://charles.the-haleys.org"
                            })
                            veri.save(function(error,doc) {
                                if (error) status ="err"
                                else status = "ok"
                            }) 
                        }
                    })
                    
                })              
            }
       });
       if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
    });
})

app.listen(process.env.PORT || 5000, () => {
    console.log('listening on 5000')
})



var xlsx = require("xlsx");

var workbook = new Excel.Workbook();
var sheet = workbook.addWorksheet('My Sheet');

app.get("/indirbruteforceexcell",(req,res)=>{    
    var status
        dangercol.find({},function(err,resp){
             var data =resp;

            for(var i = 0; i < data.length;i++){        
                if(data.length>=1){
                    try {
                        sheet.addRow([data[i].ip,data[i].port,data[i].service,data[i].protocol, JSON.stringify(data[i].date),data[i].referance]);      

                    } catch (error) {
                        console.log(error)
                    }                   
                }else{   
                    console.log(err)              
                }
            }
            workbook.xlsx.writeFile("BruteforceList.xlsx").then(function() { });
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})

app.get("/indirmalwareexcell",(req,res)=>{    
    var status
        malwcore.find({},function(err,resp){
             var data =resp;
            //console.log(data)

            for(var i = 0; i < data.length;i++){        
                if(data.length>=1){
                    try {
                        sheet.addRow([data[i].ip,data[i].port,data[i].service,data[i].protocol, JSON.stringify(data[i].date),data[i].referance]);      

                        
                    } catch (error) {
                        console.log(error)
                    }                   
                }else{   
                    console.log(err)              
                }
            }

            
            workbook.xlsx.writeFile("malwareAttacks.xlsx").then(function() { });
         
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})

app.get("/indirsslexcell",(req,res)=>{    
    var status
        blist.find({},function(err,resp){
             var data =resp;
            //console.log(data)

            for(var i = 0; i < data.length;i++){        
                if(data.length>=1){
                    try {
                        sheet.addRow([data[i].ip, data[i].port,data[i].service,data[i].protocol,JSON.stringify(data[i].date),data[i].referance]);      

                        
                    } catch (error) {
                        console.log(error)
                    }                   
                }else{   
                    console.log(err)              
                }
            }

            
            workbook.xlsx.writeFile("SslBlockedIPs.xlsx").then(function() { });
         
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})

app.get("/indirsshexcell",(req,res)=>{    
    var status
        sAttacks.find({},function(err,resp){
             var data =resp;
            //console.log(data)

            for(var i = 0; i < data.length;i++){        
                if(data.length>=1){
                    try {
                        sheet.addRow([data[i].ip, data[i].port,data[i].service,data[i].protocol,JSON.stringify(data[i].date),data[i].referance]);      

                        
                    } catch (error) {
                        console.log(error)
                    }                   
                }else{   
                    console.log(err)              
                }
            }

            
            workbook.xlsx.writeFile("SshAttacks.xlsx").then(function() { });
         
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})
app.get("/indirbotexcell",(req,res)=>{    
    var status
        botblist.find({},function(err,resp){
             var data =resp;
            //console.log(data)

            for(var i = 0; i < data.length;i++){        
                if(data.length>=1){
                    try {
                        sheet.addRow([data[i].ip, data[i].port,data[i].service,data[i].protocol,JSON.stringify(data[i].date),data[i].referance]);      

                        
                    } catch (error) {
                        console.log(error)
                    }                   
                }else{   
                    console.log(err)              
                }
            }

            
            workbook.xlsx.writeFile("BotNetBlockedIPs.xlsx").then(function() { });
         
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})

app.get("/indirbruteforcetxt",(req,res)=>{  
    var status
        dangercol.find({},function(err,resp){
            var data =resp;
            
            fs.writeFile("Bruteforce.txt", data, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });             
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})
app.get("/indirmalwaretxt",(req,res)=>{  
    var status
        malwcore.find({},function(err,resp){
            var data =resp;
            
            fs.writeFile("malwareAttacks.txt", data, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });             
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})
app.get("/indirsshtxt",(req,res)=>{  
    var status
        sshA.find({},function(err,resp){
            var data =resp;
            
            fs.writeFile("sshAttacks.txt", data, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });             
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})
app.get("/indirbotnettxt",(req,res)=>{  
    var status
        botblist.find({},function(err,resp){
            var data =resp;
            
            fs.writeFile("BotNetBlockedIps.txt", data, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });             
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})
app.get("/indirssltxt",(req,res)=>{  
    var status
        blist.find({},function(err,resp){
            var data =resp;
            
            fs.writeFile("SSLblockedIPs.txt", data, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });             
        })        
    if (status=="err") res.send("bir hata meydana geldi : \n\r ");
        else res.status(200).send("OK");
})
