const mongoose = require('mongoose');
const GroupTask= require('./groupTask');
const GroupSprint= require('./groupSprint');
const GroupSubTask= require('./groupSubTask');



main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskManager');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const {Schema}= mongoose;



const GroupProjectSchema= new Schema({
  name:String,
  task:{
    type:Schema.Types.ObjectId,
    ref:'GroupTask'
  },
  subTasks:[
    {
      type:Schema.Types.ObjectId,
      ref:'GroupSubTask'
    }
  ],
  sprints:[{
    type:Schema.Types.ObjectId,
    ref:'GroupSprint'
  }],
  status:{
    type:Number,
}
})

const GroupProject= new mongoose.model('GroupProject',GroupProjectSchema);
module.exports=GroupProject;
