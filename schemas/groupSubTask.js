const mongoose = require('mongoose');
const GroupSprint= require('./groupSprint');
const GroupProject= require('./groupProject');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskManager');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const {Schema}= mongoose;

const GroupSubTaskSchema= new Schema({
  name:String,
    status:{
      type:String,
      enum:['uninitialised','initialised','accomplished','aborted','unaccomplished'],
      default:'uninitialised'
    },
    assignedTo:{
      type:Schema.Types.ObjectId,
      ref:'User'
    },
    createdAt: { type: Date, default: Date.now }, 
  dueDate: { type: Date },
  startedAt: { type: Date},
  completedAt:{type: Date},
  description:String,
  sprint:{
    type:Schema.Types.ObjectId,
    ref:'GroupSprint'
  },
  project:{
    type:Schema.Types.ObjectId,
    ref:'GroupProject'
  }
  })

  
const GroupSubTask= new mongoose.model('GroupSubTask',GroupSubTaskSchema);

module.exports=GroupSubTask;