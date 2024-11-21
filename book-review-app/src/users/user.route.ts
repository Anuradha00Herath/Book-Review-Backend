import { Request, Response } from 'express';
import User from './user.model';
const generateToken = require('../middleware/generateToken');
const verifyToken = require('../middleware/verifyToken')
const express = require('express');
const router = express.Router();

// Register endpoint
router.post('/register', async(req: Request,res: Response)=>{
    try{
        const {username, email, password} = req.body;
        const user = new User({username, email, password});
        await user.save();
        res.status(201).send({message: "User Registered Successfully"});
    }catch(error){
        console.error("Error registering user", error);
        res.status(500).send({message:'Error Registering User'});
    }
})

// login user endpoint
router.post('/login', async(req: Request, res: Response) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
    if(!user){
        return res.status(404).send({message:'user not found'})
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        return res.status(401).send({message:'Invalid Password'})
    }
    const token = await generateToken(user._id);

    res.cookie('token',token,{
        httpOnly: true,
        secure:true,
        sameSite: 'none'
    });
    

    res.status(200).send({message: 'Logged in Successfully',token, user:{
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
    }})
    } catch (error) {
        console.error("Error Logged in user", error);
        res.status(500).send({message:'Error Logged in User'});
  
    }
})

// logout user endpoint
router.post('/logout',(req:Request, res:Response)=>{
    res.clearCookie('token');
    res.status(200).send({message:'Logged out successfully '})
})


module.exports = router;
