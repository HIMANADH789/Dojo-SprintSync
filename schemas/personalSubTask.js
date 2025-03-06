const mongoose = require('mongoose');
const PersonalTask= require('./personalTask');
const PersonalSprint= require('./personalSprint');



const {Schema}= mongoose;

const PersonalSubTaskSchema= new Schema({
    name:String,
    status:{
        type:String,
        enum:['uninitialised','initialised','accomplished','aborted','unaccomplished'],
        default:'uninitialised'
      },
      createdAt: { type: Date, default: Date.now }, 
    dueDate: { type: Date },
    startedAt: { type: Date},
    completedAt:{type: Date},
    description:String,
    sprint:{
      type:Schema.Types.ObjectId,
      ref:'PersonalSprint'
    },
    project:{
      type:Schema.Types.ObjectId,
      ref:'PersonalTask'
    }
    
    })
const PersonalSubTask= new mongoose.model('PersonalSubTask',PersonalSubTaskSchema);

module.exports= PersonalSubTask;