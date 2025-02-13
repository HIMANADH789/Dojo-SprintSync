const mongoose = require('mongoose');
const GroupSubTask= require('./groupSubTask');
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskManager');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const {Schema}= mongoose;


  
const GroupSprintSchema = new mongoose.Schema({
  name: String,
  priority: Number,
  subTasks: [
      {
          type: Schema.Types.ObjectId,
          ref: 'GroupSubTask'
      }
  ],
  isCompleted: {
      type: Boolean,
      default: false
  },
  isPlanned: {
      type: Boolean,
      default: false
  },
  dueDate: { type: Date },
  createdAt:{type:Date}
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });  

  GroupSprintSchema.virtual('isSuccessful').get(function() {
   
    if (this.dueDate < Date.now()) {
      if(!this.isCompleted ){
      return 0;
      }else{
        return 2;
      }
    }
    else{
      return 1;
    }
 
    
  });
  

  const GroupSprint= new mongoose.model('GroupSprint',GroupSprintSchema);

  module.exports=GroupSprint;