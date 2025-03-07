const mongoose = require('mongoose');
const passportLocalMongoose= require('passport-local-mongoose');
const PersonalTask= require('./personalTask');
const GroupTask= require('./groupTask');
const GroupSubTask= require('./groupSubTask');
const GroupProject= require('./groupProject');


const {Schema}= mongoose;

const TaskSchema= new Schema({
    team:{
        type:Schema.Types.ObjectId,
        ref:'GroupTask',
    },
    subTask:{
        type:Schema.Types.ObjectId,
        ref:'GroupSubTask'
    },
    project:{
        type:Schema.Types.ObjectId,
        ref:'GroupProject'
    },
    note:String
})

const UserSchema= new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    admin:[{
        type:Schema.Types.ObjectId,
        ref:'GroupTask'
    }],
    personalTasks:[{
        type:Schema.Types.ObjectId,
        ref:'PersonalTask'
    }],
    engagedTasks:[{
        type:Schema.Types.ObjectId,
        ref:'GroupTask'
    }],
    followers:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    following:[{
         type:Schema.Types.ObjectId,
        ref:'User'
    }],
    friendsRequestedFor:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    notifications:[{
        type:Schema.Types.ObjectId,
        refPath:'notificationType'

    }
],
notificationType:{
    type:String,
    enum:['User','GroupTask'],
    
},
notificationTasks:{
    type:[TaskSchema]
},
engagedGroupSubTasks:{
    type:[TaskSchema]
}
});

UserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',UserSchema);
