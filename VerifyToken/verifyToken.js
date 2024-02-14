
const JWT = require('jsonwebtoken');

function verifyToken(req,res,next){

    if(req.headers.authorization !=undefined){

        let token= req.headers.authorization.split(" ")[1];
        JWT.verify(token,"nutrify",(err,data)=>{
            if(!err){
                next();
            }
            else{
                res.status(403).send({message:"Invalid token"})
            }
        })
    }
    else{
        res.send({message:"Please provide token"})
    }
}


module.exports = verifyToken;