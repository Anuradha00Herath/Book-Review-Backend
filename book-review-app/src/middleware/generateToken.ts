import User from "../users/user.model";

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY

const generateToken = async (userId:String) =>{
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new Error('User not found')
        }
        const token = jwt.sign({ userId: user._id , role: user.role}, SECRET_KEY,{
            expiresIn: '24h'
        });
        return token;
    } catch (error) {
        
    }
};
module.exports = generateToken;