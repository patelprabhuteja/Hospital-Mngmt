var express=require("express");
var app=express();

let server=require("./server")

let middleware=require("./middleware");

const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const MongoClient=require("mongodb").MongoClient;

const url="mongodb://127.0.0.1:27017";

MongoClient.connect(url,{useUnifiedTopology: true},(err,client)=>{
    if(err){
        console.log("Failed to connect to Database");
        return;
    }
    db=client.db("project1");
    console.log("Connection Successfull with the Database");
})

//Get Hospital Details
app.get("/hospitalDetails",middleware.checkToken,(req,res)=>{
    db.collection("hospitaldb").find({}).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        console.log("Fetching Details from Hospital Collection");
        res.json(result);
    });
});

//Get Ventilator Details
app.get("/ventilatorDetails",(req,res)=>{
    db.collection("ventilatordb").find({}).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        
        console.log("Fetching Details from Ventilator Collection");
        res.json(result);
    });
});

//Search Ventilators by status and hospital name
app.post("/ventilatorbystatus",(req,res)=>{
    const vstatus=req.body.status;
    const query={"status":vstatus};
    db.collection("ventilatordb").find(query).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        
        console.log(`Fetching Details from Ventilator Collection with status "${vstatus}"`);
        res.json(result);
    });
});

app.post("/ventilatorbyname",(req,res)=>{
    const vname=req.body.name;
    const query={"name":new RegExp(vname,'i')};
    db.collection("ventilatordb").find(query).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        console.log(`Fetching Details from Ventilator Collection with name "${vname}"`);
        res.json(result);
    });
});

//Search Hospital by name
app.post("/hospitalbyname",(req,res)=>{
    const hname=req.body.name;
    const query={name:new RegExp(hname,'i')};
    console.log("Database Connection Succeeded");
    db.collection("hospitaldb").find(query).toArray(function(err,result){
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        console.log(`Fetching Details from Hospital Collection with name "${hname}"`);
        res.json(result);
    });
});

//Update Ventilator Details
app.put("/updateventilator",(req,res)=>{
    const vid=req.body.vid;
    const newStatus=req.body.status;
    const query={vId:vid};
    const new_query={$set: {status:newStatus}};
    db.collection("ventilatordb").updateOne(query,new_query,(err,result)=>{
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        if(result.length==0){
            res.json("No Data Found.");
            return;
        }
        res.json("Updated successfully for VentId : "+vid);
    });
});

//Add Ventilator
app.post("/addventilator",(req,res)=>{
    const hid=req.body.hid;
    const vid=req.body.vid;
    const vstatus=req.body.status;
    const vname=req.body.name;
    const query={hId:hid,vId:vid,status:vstatus,name:vname};
    db.collection("ventilatordb").insertOne(query,(err,result)=>{
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        res.send(`Details has been added with VentId : ${vid}`);
    });
});

//Delete Ventilator by Vent ID
app.delete("/removeventilator",(req,res)=>{
    let ventId=req.body.vid;
    const query={vId:ventId};
    db.collection("ventilatordb").deleteOne(query,(err,result)=>{
        if(err){
            res.json("Error");
            console.log("Error");
            return;
        }
        res.json("All Entries with VentilatorId "+ventId+" are deleted.");
    });
});
app.listen(3000);