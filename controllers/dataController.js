var data =[{item:'getsda',da:'sdfsdf',d:'sdfsdf'}]

module.exports = function(app){
    app.get("/",async (req,res)=>{
        /*
        var cursor = await db.collection("bruteforce").find({"referance":"http://danger.rulez.sk"}).toArray(function(err, results) {
            if(err){
               res.status(204).send("err")
            }
            res.status(200).send(results)
         })*/
         
         res.render('ana',{todos:data});
    })
    
}