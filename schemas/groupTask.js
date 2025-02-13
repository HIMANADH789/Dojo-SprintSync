const mongoose = require('mongoose');
const User= require('./user');
const GroupProject= require('./groupProject');



main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskManager');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

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