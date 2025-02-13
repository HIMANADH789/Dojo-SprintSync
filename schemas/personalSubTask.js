const mongoose = require('mongoose');
const PersonalTask= require('./personalTask');
const PersonalSprint= require('./personalSprint');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskManager');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

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