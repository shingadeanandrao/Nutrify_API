

const express = require('express');

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const JWT = require('jsonwebtoken');

//import modules
const userModel = require('./models/userModel');
const foodModel = require('./models/foodModel');
const trackingModel= require('./models/trackingModel')

//import token
const verifyToken = require('./VerifyToken/verifyToken')

//import cors

const cors = require('cors');



const app =express()

app.use(express.json())

app.use(cors())


mongoose.connect("mongodb://0.0.0.0:27017/nutrify")
.then(()=>{
console.log("Database connection successful")
})
.catch((err)=>{
    console.log((err))
})

//endpoint for registering user

app.post("/register",(req,res)=>{
    let user=req.body
    bcrypt.genSalt(10,(err,salt)=>{
        if(!err){

            bcrypt.hash(user.password,salt,async(err,hpass)=>{
                if(!err){
                    user.password=hpass
                    try{
                    let doc=await userModel.create(user)
                    res.send({message:"Registration successful"})
                    }
                    catch(err){
                        console.log(err)
                        res.status(500).send({message:"Some problem"})
                    }
                }
            })
        }
    })
})


// endpoint for user login

app.post("/login",async(req,res)=>{
    const userCred=req.body
    try{
    let user= await userModel.findOne({email:userCred.email})
    if(user!==null){
        bcrypt.compare(userCred.password,user.password,(err,result)=>{
            if(result==true){

                JWT.sign({email:userCred.email},"nutrify",(err,token)=>{

                    if(!err){
                        res.send({message:"Login Successful"  , token:token, userId:user._id,name:user.name})
                    }
                })
                
            }
            else{
                res.status(500).send({message:"some problem"})
            }
        })
    }
    else{
        res.status(401).send({message:"User not Found"})
    }
    }
    catch(err){
        console.log(err)
    }

})


//endpoint for fetching all foods
app.get("/foods",verifyToken,async(req,res)=>{

    try{
    let foods=await foodModel.find()
        res.send(foods)
    }
    catch(err){
        res.status(500).send({message:"Some problem"})
    }
})

//endpoint for fetching foods by name

app.get("/foods/:name",async(req,res)=>{

    try{
        let foods= await foodModel.find({name:{$regex:req.params.name,$options:'i'}})
        if(foods){
        res.send(foods)
        }
        else{
            res.status(404).send({message:"food item not found"})
        }
    }
    catch(err){
        res.status(500).send({message:"Some problem in getting food"})
    }
})

//endpoint to track a food

app.post("/track",verifyToken,async(req,res)=>{
    let trackData=req.body
    try{
        let data= await trackingModel.create(trackData)
        console.log(data)
        res.status(201).send({message:"Food Added"})
    }
    catch(err){
        res.status(500).send({message:"Some problem in getting food"})
    }
})

// endpoint to fetch all food eaten by person
app.get("/track/:userId/:date",verifyToken,async (req,res)=>{

    let userId = req.params.userId;
    let date = new Date(req.params.date);
    let strDate = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
    console.log(strDate)

    try
    {
        let foods = await trackingModel.find({userId:userId,eatenDate:strDate}).populate('userId').populate('foodId')
        res.send(foods);

    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:"Some Problem in getting the food"})
    }


})




app.listen(8000,()=>{
    console.log("Server is running and up")
})
