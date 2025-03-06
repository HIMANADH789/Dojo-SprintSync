const mongoose = require('mongoose');
const User= require('./user');
const GroupProject= require('./groupProject');



const {Schema}= mongoose;

const GroupTaskSchema= new Schema({
    teamId:{
        type:String,
        required:true
    },
    teamName:{
        type:String,
        required:true
    },
    admin:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    groupMembers:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    membersUnderRequest:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    projects:[
        {
            type:Schema.Types.ObjectId,
            ref:'GroupProject'
        }
    ],
    status:Boolean
})

const GroupTask= new mongoose.model('GroupTask',GroupTaskSchema);

module.exports=GroupTask;