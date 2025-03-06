const mongoose = require('mongoose');
const GroupTask= require('./groupTask');
const GroupSprint= require('./groupSprint');
const GroupSubTask= require('./groupSubTask');





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
