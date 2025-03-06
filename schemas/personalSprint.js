const mongoose = require('mongoose');


const {Schema}= mongoose;


    
    const PersonalSprintSchema= new Schema({
      name:String,
      priority:Number,
      subTasks:[{
        type:Schema.Types.ObjectId,
        ref:'PersonalSubTask'
      }],
      createdAt:{ type: Date },
      isCompleted:{
        type:Boolean,
        default:false
      },
      isPlanned:{
        type:Boolean,
        default:false
      },
      dueDate: { type: Date }
    }, { toJSON: { virtuals: true }, toObject: { virtuals: true } });  
    
      PersonalSprintSchema.virtual('isSuccessful').get(function() {
       
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
      

    const PersonalSprint= new mongoose.model('PersonalSprint',PersonalSprintSchema);

    module.exports=PersonalSprint;