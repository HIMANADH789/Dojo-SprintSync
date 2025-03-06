const mongoose = require('mongoose');
const User= require('./user');
const PersonalSprint= require('./personalSprint');
const PersonalSubTask= require('./personalSubTask');



const {Schema}= mongoose;

  

const PersonalTaskSchema= new Schema({
    taskId:{
        type:String,
        required:true
    },
    taskName:{
        type:String,
        required:true
    },
    taskOf:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    sprints:[{
        type:Schema.Types.ObjectId,
        ref:'PersonalSprint'
      }],
    subTasks:[
      {
        type:Schema.Types.ObjectId,
        ref:'PersonalSubTask'
      }
    ],
    status:{
      type:Boolean,
      default:false
    }
})

const PersonalTask= new mongoose.model('PersonalTask',PersonalTaskSchema);

module.exports=PersonalTask;