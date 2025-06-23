const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body,validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchUser');

const JWT_SECRET = 'your_jwt_secret_key_here';
// Route 1: create a user using: post "/api/auth/createuser". No login required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('password','Password must be atleast 5 characters').isLength({min:5}),
    body('email','Enter a valid email').isEmail(),
], async (req,res)=>{
    let success = false;
    // If there are errors return bad errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors:errors.array()});
    }
    // Check whether the user with this email exists already
    try {
    let user = await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({success,error:"A user with this email already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt);

    // Create a new user
     user = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:secPass,
     });
     const data={
        user:{
            id:user.id
        }
     }
     const authtoken = jwt.sign(data,JWT_SECRET);
     success = true;
   res.json({success,authtoken})
   //catch errors
    }catch(error){
        console.error(error.message);
        res.status(500).send('Some error has been occured');
    }
})

// Route 2: authentication a user using: post "/api/auth/createuser". No login required

router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists(),
], async (req,res)=>{
    let success = false;
    // If there are errors return bad errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

const{email,password} = req.body;
try{
    let user = await User.findOne({email});
    if(!user){
        return res.status(400).json({error:"Please try to login with correct credentials"});
    }

    const passwordCompare = await bcrypt.compare(password,user.password);
    if(!passwordCompare){
        success = false;
        return res.status(400).json({success,error:"Please try to login with correct credentials"});
    }

    const data = {
        user:{
            id:user.id
        }
    }
    const authtoken = jwt.sign(data,JWT_SECRET);
    success = true;
    res.json({success,authtoken})

} catch(error){
    console.error(error.message);
    res.status(500).send('Internal server error');
}
})

// Route 3: get logged user detail using: post "/api/auth/getuser".login required

router.post('/getuser',fetchuser, async (req,res)=>{
    

try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
}
})
module.exports = router