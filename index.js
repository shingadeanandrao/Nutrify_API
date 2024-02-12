

const express = require('express');

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const JWT = require('jsonwebtoken');

const userModel = require('./models/userModel');

const app =express()

app.use(express.json())


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
                res.send({message:"Login Successful"})
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
app.listen(8000,()=>{
    console.log("Server is running and up")
})