const User= require('../schemas/user');
const GroupTask= require('../schemas/groupTask');
const PersonalTask= require('../schemas/personalTask');
const PersonalSprint= require("../schemas/personalSprint");
const GroupSprint= require('../schemas/groupSprint');
const GroupProject= require('../schemas/groupProject');
const GroupSubTask= require('../schemas/groupSubTask');
const PersonalSubTask= require('../schemas/personalSubTask');
const mongoose = require('mongoose');
const { name } = require('ejs');
const Queue = require('bull');


const updateTeamSubTaskQueue = new Queue('update-subTask', {
    redis: { host: 'localhost', port: 6379 } 
  });
  
  const scheduleUpdateTeamSubTask = async (subTaskId, dueDate, teamId, projectId) => {
    const now = Date.now();
    const dueTime = new Date(dueDate).getTime();
    const oneHourBefore = dueTime - 60 * 60 * 1000;
    if (oneHourBefore > now) {
        
        await updateTeamSubTaskQueue.add(
          { subTaskId, teamId, projectId,  type: 'reminder' }, 
          { delay: oneHourBefore - now } 
        );
        console.log(`Reminder scheduled for subTask ${subTaskId}`);
      }
      if (dueTime > now) {
    
        const jobDue=await updateTeamSubTaskQueue.add(
          { subTaskId, teamId, projectId, type: 'due' }, 
          { delay: dueTime - now } 
        );
      console.log(`Scheduled job for subTask ${subTaskId} with Job ID: ${jobDue.id}`);
    } else {
      console.error('Due date is in the past! No job scheduled.');
    }
  };

  updateTeamSubTaskQueue.process(async (job) => {
    try {
      const { subTaskId, teamId, projectId, type } = job.data;
      
      
      const subTask = await GroupSubTask.findById(subTaskId).populate('assignedTo');
      if (!subTask) return;
  
      const user = await User.findById(subTask.assignedTo);
      if (!user) return;
  
      if (type === 'reminder') {

        user.notificationTasks.push({
          note: '1hrLeft',
          team:teamId,
          project:projectId,
          subTask:subTaskId
        });
        console.log(`Reminder sent for subTask ${subTaskId}`);
      } 
      
      else if (type === 'due') {
        //  Due Date Passed - Mark Unaccomplished (if not completed)
        if (subTask.status !== 'accomplished' && subTask.status !== 'aborted') {
          subTask.status = 'unaccomplished';
          await subTask.save();
  
       
            user.notificationTasks.push({
                note: 'unaccomplished',
                team:teamId,
                project:projectId,
                subTask:subTaskId
              });
        
  
          console.log(`SubTask ${subTaskId} is overdue. User notified.`);
        }
      }
  
      await user.save();
    } catch (err) {
      console.error('Error processing job:', err);
    }
  });
  
  const updatePersonalSubTaskQueue = new Queue('update-subTask', {
    redis: { host: 'localhost', port: 6379 } 
  });
  
  const scheduleUpdatePersonalSubTask = async (subTaskId, dueDate, taskId) => {
    const now = Date.now();
    const dueTime = new Date(dueDate).getTime();
    const oneHourBefore = dueTime - 60 * 60 * 1000;
    if (oneHourBefore > now) {
        
        await updatePersonalSubTaskQueue.add(
          { subTaskId, taskId,   type: 'reminder' }, 
          { delay: oneHourBefore - now } 
        );
        console.log(`Reminder scheduled for subTask ${subTaskId}`);
      }
      if (dueTime > now) {
    
        const jobDue=await updatePersonalSubTaskQueue.add(
          { subTaskId, taskId, type: 'due' }, 
          { delay: dueTime - now } 
        );
      console.log(`Scheduled job for subTask ${subTaskId} with Job ID: ${jobDue.id}`);
    } else {
      console.error('Due date is in the past! No job scheduled.');
    }
  };

  updatePersonalSubTaskQueue.process(async (job) => {
    try {
      const { subTaskId, taskId, type } = job.data;
      
      // Find the subtask
      const subTask = await PersonalSubTask.findById(subTaskId).populate('assignedTo');
      if (!subTask) return;
  
      const user = await User.findById(subTask.assignedTo);
      if (!user) return;
  
      if (type === 'reminder') {
        user.notificationTasks.push({
          note: '1hrLeft',
          team:taskId,
          subTask:subTaskId
        });
        console.log(`Reminder sent for subTask ${subTaskId}`);
      } 
      
      else if (type === 'due') {

        if (subTask.status !== 'accomplished' && subTask.status !== 'aborted') {
          subTask.status = 'unaccomplished';
          await subTask.save();
  
       
            user.notificationTasks.push({
                note: 'unaccomplished',
                team:taskId,
                subTask:subTaskId
              });
        
  
          console.log(`SubTask ${subTaskId} is overdue. User notified.`);
        }
      }
  
      await user.save();
    } catch (err) {
      console.error('Error processing job:', err);
    }
  });
  


  function getFutureDate(weeks = 0, days = 0, hours = 0) {
    const futureDate = new Date();
    futureDate.setTime(
        futureDate.getTime() +
        (weeks * 7 * 24 * 60 * 60 * 1000) +  // Convert weeks to milliseconds
        (days * 24 * 60 * 60 * 1000) +      // Convert days to milliseconds
        (hours * 60 * 60 * 1000)            // Convert hours to milliseconds
    );
    return futureDate;
}


function getTimeDifference(targetDate) {
    const now = new Date(); 
    const diffMs = targetDate - now; 

    if (diffMs < 0) {
        return "The date has already passed.";
    }

    const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)); 
    const days = (Math.floor((diffMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)))+1; 
    const hours = (Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))+1; 

    return { weeks, days, hours };

   
    
}
const checkAndUpdateSprintCompletion = async (sprintId) => {
    const remainingTasks = await GroupSubTask.countDocuments({
        sprint:sprintId,
        status: { $nin: ['accomplished', 'aborted'] }
    });
    
   const sprint= await GroupSprint.findById(sprintId).populate('subTasks');
 
   if(sprint.isPlanned){
    sprint.isCompleted= (remainingTasks===0);
    if(sprint.isCompleted){
        for(let subTask of sprint.subTasks){
            if(subTask.status=='aborted'){
                await GroupSubTask.findByIdAndDelete(subTask._id);
                sprint.subTasks=sprint.subTasks.filter(s => s._id.toString() !== subTask._id.toString());
            }
        }
    }
    await sprint.save();
   }else{
    sprint.isCompleted=false;
    await sprint.save();

   }
};

const checkAndUpdatePersonalSprint = async (sprintId) => {
    const remainingTasks = await PersonalSubTask.countDocuments({
        sprint:sprintId,
        status: { $nin: ['accomplished', 'aborted'] }
    });
    
   const sprint= await PersonalSprint.findById(sprintId).populate('subTasks');
 
   if(sprint.isPlanned){
    sprint.isCompleted= (remainingTasks===0);
    if(sprint.isCompleted){
        for(let subTask of sprint.subTasks){
            if(subTask.status=='aborted'){
                await PersonalSubTask.findByIdAndDelete(subTask._id);
                sprint.subTasks=sprint.subTasks.filter(s => s._id.toString() !== subTask._id.toString());
            }
        }
    }
    await sprint.save();
   }else{
    sprint.isCompleted=false;
    await sprint.save();

   }
};


const createChooseForm= async(req,res,next)=>{
    res.render('taskChooseCreateForm');
}

const createChooseType= async(req,res,next)=>{
    if(req.body.choice=='personal'){
        res.redirect('/task/createPersonal');
    }
    else if(req.body.choice=='group'){
        res.redirect('/task/createGroup');
    }
    else{
        res.send("error");
    }
}

const createPersonalTaskForm= async(req,res,next)=>{
    res.render('createPersonalTaskForm');
}

const createGroupTaskForm= async(req,res,next)=>{
    res.render('createGroupTaskForm');
}

const createPersonalTask= async(req,res,next)=>{
    const{taskName, taskId}= req.body;
    const taskOf=req.currentUserId;
    const newTask= new PersonalTask({taskName,taskId,taskOf,status:false});
    await newTask.save();
    const user= await User.findById(taskOf);
    user.personalTasks.push(newTask._id);
    await user.save();
    res.redirect(`/task/personal/${taskOf}/${newTask._id}`);
}

const createGroupTask= async(req,res,next)=>{
    const{teamName, teamId, teamMate1, teamMate2}= req.body;
    const currentUserId= req.currentUserId;
    const team=[teamMate1,teamMate2];
    const teamMates= await User.find({username:{$in:team}})
    const group= new GroupTask({teamName, teamId, status:false});
    group.admin.push(currentUserId);
    await group.save();
    group.membersUnderRequest.push(...teamMates.map(ind => ind._id));
        
        
        await group.save();

        
    teamMates.map(ind => {
            const notification = {
                notificationType: 'GroupTask',
                groupTask: group._id
            };
            ind.notifications.push(notification.groupTask);
            return ind.save(); 
        });
    
    const admin= await User.findById(currentUserId);
    admin.admin.push(group._id);
    await admin.save();
    res.redirect(`/task/team/${group._id}`);

}

const getTeamTaskTemplate= async(req,res,next)=>{
    const {tid}= req.params;
    let isAdmin;
    const teamTask= await GroupTask.findById(tid).populate('groupMembers').populate('admin')
    .populate('membersUnderRequest').populate('projects');
    const admins= teamTask.admin;
    const currentUserId = new mongoose.Types.ObjectId(req.currentUserId);
    const user = await User.findById(req.currentUserId);
    
    if (admins.some(admin => admin._id.equals(currentUserId))) {
        isAdmin = true;
    }
    res.render('teamTaskTemplate',{teamTask,isAdmin,user});
}


const addPersonalTaskSprint=async(req,res,next)=>{
    let { uid, tid } = req.params;
    const {name,dueDate}= req.body;
    if (!mongoose.Types.ObjectId.isValid(uid) || !mongoose.Types.ObjectId.isValid(tid)) {
        return res.status(400).send('Invalid uid or tid');
    }
    const task= await PersonalTask.findById(tid);
    const sprint=new PersonalSprint({name,dueDate});
    await sprint.save();
    task.sprints.push(sprint._id);
    await task.save();
    res.redirect(`/task/personal/${uid}/${tid}`);
}





const submitPersonalSprintSubTask= async(req,res,next)=>{
    const{tid,uid,sid,subid}= req.params;
    const subTask= await PersonalSubTask.findById(subid);
    if(subTask.status=='initialised'){
    subTask.status='accomplished';
    await subTask.save();
    if(mongoose.Types.ObjectId.isValid(sid)){
        const sprint= await PersonalSprint.findById(sid).populate('subTasks');
       await checkAndUpdatePersonalSprint(sid);
        await sprint.save();
    }
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
    }
    else{
        res.send('Error');
    }
}

const startPersonalSprintSubTask= async(req,res,next)=>{
    const{tid,uid,subid}= req.params;
    const subTask= await PersonalSubTask.findById(subid);
    if(subTask.status=='uninitialised'){
        subTask.status='initialised';
        await subTask.save();
        res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
    }else{
        res.send('Error');
    }
}

const personalTaskSprintChangeSubTask= async(req,res,next)=>{
     const {tid,uid,sid,subid}= req.params;
     const {dueDate,name}= req.body;
   
     const subTask= await PersonalSubTask.findById(subid);
     subTask.dueDate=new Date(dueDate);
     subTask.name=name;
     await subTask.save();
     res.redirect(`/task/personal/sprint/${uid}/${tid}/${sid}`);
}

const personalTaskSprintSubTaskAbort= async(req,res,next)=>{
    const {tid,uid,sid,subid}= req.params;
    const subTask= await PersonalSubTask.findById(subid);
    await subTask.save();
    if (mongoose.Types.ObjectId.isValid(sid)) {
        const sprint = await PersonalSprint.findById(sid);
        if (sprint) {
            sprint.subTasks = sprint.subTasks.filter(n => !n.equals(subid));
            await sprint.save();
            
        }
    }
    await PersonalSubTask.deleteOne({_id:subid});
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
}



const personalTaskSprintBacklogSetPlan= async(req,res,next)=>{
    const{uid,tid,sid}= req.params;
    const sprint= await PersonalSprint.findById(sid);
    sprint.isPlanned=true;
    await sprint.save();
    await checkAndUpdatePersonalSprint(sid);
    await sprint.save();
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
}

const personalTaskSprintBacklogUnsetPlan= async(req,res,next)=>{
    const{uid,tid,sid}= req.params;
    const sprint= await PersonalSprint.findById(sid);
    sprint.isPlanned=false;
    await sprint.save();
    await checkAndUpdatePersonalSprint(sid);
    await sprint.save();
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
}


const getPersonalTaskBacklog= async(req,res,next)=>{
    const{uid,tid}= req.params;
    const task = await PersonalTask.findById(tid)
            .populate({
                path: 'sprints',
                populate: {
                    path: 'subTasks'
                }
            }).populate('subTasks');

    task.subTasks.forEach(subTask => {
        subTask._id= subTask._id;
                subTask.burnTime = getTimeDifference(subTask.dueDate); // Temporarily add burnTime
            });
    task.sprints.forEach(sprint => {
        sprint._id= sprint._id;
                sprint.burnTime= getTimeDifference(sprint.dueDate);
                sprint.subTasks.forEach(subTask => {
                    subTask.burnTime = getTimeDifference(subTask.dueDate); // Temporarily add burnTime
                });
            });
    
    const user= await User.findById(uid);
    res.render('personalTaskBacklog',{task,user});
    
}

const createTeamProject=async(req,res,next)=>{
    let { uid, tid} = req.params;
    const {name}= req.body;
    if (!mongoose.Types.ObjectId.isValid(uid) || !mongoose.Types.ObjectId.isValid(tid)) {
        return res.status(400).send('Invalid uid or tid');
    }
    const team= await GroupTask.findById(tid).populate('admin').populate('projects');
    const admins= team.admin;
    const currentUserId = new mongoose.Types.ObjectId(req.currentUserId);
    
    
    if (admins.some(admin => admin._id.equals(currentUserId))) {
        const project=new GroupProject({name,task:tid});
        await project.save();
        team.projects.push(project);
        await team.save();
        res.redirect(`/task/team/${tid}`);
    }else{
        return res.status(400).send('Not authenticated');
    }
}



const createTeamProjectSprint= async(req,res,next)=>{
    const {tid,pid}= req.params;
    const {name,duration}= req.body;
    if (!mongoose.Types.ObjectId.isValid(pid) || !mongoose.Types.ObjectId.isValid(tid)) {
        return res.status(400).send('Invalid uid or tid');
    }
    const dueDate= getFutureDate(duration);
    const team= await GroupTask.findById(tid);
    const project= await GroupProject.findById(pid);
    const admins= team.admin;
    const currentUserId = new mongoose.Types.ObjectId(req.currentUserId);
    if (admins.some(admin => admin._id.equals(currentUserId))){
        const sprint= new GroupSprint({name,dueDate,createdAt:new Date()});
        await sprint.save();
        project.sprints.push(sprint._id);
        await project.save();
        res.redirect(`/task/team/project/${tid}/${pid}`);
    }else{
        return res.status(400).send('Not authenticated');
    }
    
}

const getProjectSprintTemplate= async(req,res,next)=>{
    const {tid,pid,sid}= req.params;
    let isAdmin=false;
    let subTasks=[];
    const team= await GroupTask.findById(tid).populate('admin').populate('groupMembers');
    const project= await GroupProject.findById(pid);
    const sprint = await GroupSprint.findById(sid)
        .populate({
            path: 'subTasks',
            populate: {
                path: 'assignedTo', 
                select: 'name ' 
            }
        });
    for(let s of sprint.subTasks){
        s.burnTime= getTimeDifference(s.dueDate);
        subTasks.push(s);
    }
    
    const admins= team.admin;
    const currentUserId = new mongoose.Types.ObjectId(req.currentUserId);
    const formattedDueDate = new Date(sprint.dueDate).toISOString().slice(0, 16);
    const minDue = (new Date(Date.now() + 60 * 1000)).toISOString().slice(0, 16);

    console.log(sprint.isSuccessful);

    if(admins.some(admin=>admin._id.equals(currentUserId))){
        isAdmin=true;
       
        res.render('teamProjectSprintPlan',{sprint:{...sprint,isSuccessful:sprint.isSuccessful,_id:sprint._id,subTasks: [...sprint.subTasks],dueDate:formattedDueDate,minDue},project,team,isAdmin,subTasks});
    }else{
        res.redirect(`/task/team/project/sprint/subTask/${tid}/${pid}/${sid}`);
    }

}

const getTeamProjectSprintSubtask= async(req,res,next)=>{
    const {tid,pid}= req.params;
    let tasks=[];
    const team= await GroupTask.findById(tid).populate('admin');
    const project= await GroupProject.findById(pid).populate('subTasks').populate({
        path: 'subTasks',
        populate: {
            path: 'sprint', 
            
        }
    });
    
    const currentUserId = new mongoose.Types.ObjectId(req.currentUserId);
    for(let s of project.subTasks){
         if(s.assignedTo.equals(currentUserId)){
            s.burnTime= getTimeDifference(s.dueDate);
            s.createdAt=getTimeDifference(s.createdAt);
            tasks.push(s);
         }
    }
   
    const admins= team.admin;
    let isAdmin=false;
    if(admins.some(admin=>admin._id.equals(currentUserId))){
        isAdmin=true;
    }
    
    res.render('teamProjectYourSubTasks',{project,team,tasks,isAdmin});
}



const teamProjectSprintSubTaskSubmit= async(req,res,next)=>{
    const {tid, pid,sid,subid}= req.params;
    const user= await User.findById(req.currentUserId).populate('engagedGroupSubTasks');
    const subTask= await GroupSubTask.findById(subid).populate('assignedTo');
    
    if(subTask.status=='initialised'){
    subTask.status='accomplished';
    subTask.completedAt= new Date();
    user.engagedGroupSubTasks=user.engagedGroupSubTasks.filter(n => !n.subTask.equals(subTask._id));
    await subTask.save();
    if(mongoose.Types.ObjectId.isValid(sid)){
        const sprint= await GroupSprint.findById(sid).populate('subTasks');
    await checkAndUpdateSprintCompletion(sid);
    await sprint.save();
    }
    await user.save();

    res.redirect(`/task/team/project/your-subTasks/${tid}/${pid}`);
    }else{
        res.send('Error');
    }
}

const teamProjectSprintSubTaskCommit= async(req,res,next)=>{
    const {tid, pid,sid,subid}= req.params;
    const user= await User.findById(req.currentUserId);
    const subTask= await GroupSubTask.findById(subid).populate('assignedTo');
    if(subTask.status=='uninitialised'){
    subTask.status='initialised';
    subTask.startedAt=new Date();
    await subTask.save();
    user.notificationTasks=user.notificationTasks.filter(n => !n.subTask.equals(subTask._id));
    if(mongoose.Types.ObjectId.isValid(sid)){
    user.engagedGroupSubTasks.push({ team:tid,subTask: subTask._id, sprint: sid, project: pid });
    }else{
        user.engagedGroupSubTasks.push({ team:tid,subTask: subTask._id,  project: pid });
    }
    await user.save();
    res.redirect(`/task/team/project/your-subTasks/${tid}/${pid}`);
   
    }else{
        res.send('Error');
    }
}

const deleteTeamProjectSprintSubTask= async(req,res,next)=>{
    const {tid,pid,sid,subid}=req.params;
    const subTask= await GroupSubTask.findById(subid).populate('assignedTo');
   
    
    await subTask.save();
    if (mongoose.Types.ObjectId.isValid(sid)) {
        const sprint = await GroupSprint.findById(sid);
        if (sprint) {
            sprint.subTasks = sprint.subTasks.filter(n => !n.equals(subid));
            await sprint.save();
            await checkAndUpdateSprintCompletion(sid);
        }
    }
    
    await GroupSubTask.deleteOne({ _id: subid });
   
    res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);
}

const updateTeamProjectSprintSubTask= async(req,res,next)=>{
    const {tid,pid,sid,subid}= req.params;
    const {dueDate,name,assignedTo}= req.body;
 
    const subTask= await GroupSubTask.findById(subid);
    subTask.dueDate=  new Date(dueDate);
    subTask.name= name;
    subTask.assignedTo= assignedTo;
    const user= await User.findById(subTask.assignedTo);
    if(subTask.status=='unaccomplished'){
        subTask.status='uninitialised';
      
            user.notificationTasks.push({ team:tid,subTask: subTask._id, project: pid, note:'update' });
       
        
    }else{
        
            user.notificationTasks.push({ team:tid,subTask: subTask._id, project: pid ,note:'update'});
       
    }
    await subTask.save();
    await user.save();
    res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);

}





const setPlanTeamProjectBacklogSprint= async(req,res,next)=>{
    const {tid,pid,sid}= req.params;
    const sprint= await GroupSprint.findById(sid);
    
    if(sprint.isPlanned==false){
      sprint.isPlanned=true;
      await sprint.save();
      await checkAndUpdateSprintCompletion(sid);
      await sprint.save();
      res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);
    }else{
      res.send("Error");
    }
  
  }
  
  const unsetPlanTeamProjectBacklogSprint= async(req,res,next)=>{
      const {tid,pid,sid}= req.params;
    const sprint= await GroupSprint.findById(sid);
    console.log(sprint);
    if(sprint.isPlanned==true){
      sprint.isPlanned=false;
      await sprint.save();
      await checkAndUpdateSprintCompletion(sid);
      await sprint.save();
      res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);
    }else{
      res.send("Error");
    }
  }

const deleteTeamProjectSprint= async(req,res,next)=>{
    const {tid,pid,sid}= req.params;
    const project= await GroupProject.findById(pid);
    project.sprints= project.sprints.filter(n=>!n.equals(sid));
    await GroupSprint.findByIdAndDelete(sid);
    res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);
};
const changeTeamProjectSprint= async(req,res,next)=>{
    const {tid,pid,sid}= req.params;
    const{name,weeks,days,hours}= req.body;
    const newDueDate=getFutureDate(weeks,days,hours);
    const sprint= await GroupSprint.findById(sid);
    sprint.dueDate= newDueDate;
    await sprint.save();
    res.redirect(`/task/team/project/sprint/${tid}/${pid}/${sid}`);
}

const addPersonalTaskSubTask= async(req,res,next)=>{
    const {uid,tid}= req.params;
    const {name,dueDate}= req.body;
    const task= await PersonalTask.findById(tid);
    console.log(name,dueDate);
    if (!mongoose.Types.ObjectId.isValid(uid) || !mongoose.Types.ObjectId.isValid(tid)) {
        return res.status(400).send('Invalid uid or tid');
    }
    
    const subTask=new PersonalSubTask({name,createdAt:new Date(),sprint:undefined,dueDate,project:tid});
    
    await subTask.save();
    task.subTasks.push(subTask._id);
    await task.save();
    scheduleUpdatePersonalSubTask(subTask._id, dueDate,tid);
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
}

const addPersonalTaskSubTaskToSprint= async(req,res,next)=>{
    const {uid,tid,sid, subid}= req.params;
    
    const sprint= await PersonalSprint.findById(sid);
    const subTask= await PersonalSubTask.findById(subid);
    subTask.sprint= sid;
    await subTask.save();
    sprint.subTasks.push(subid);
    if(sprint.DueDate<subTask.dueDate){
        sprint.dueDate= subTask.dueDate;
    }
    await sprint.save();
    console.log(sprint.subTasks);
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
}

const removePersonalTaskSubTaskFromSprint= async(req,res,next)=>{
    const {uid,tid,sid,subid}= req.params;
    const sprint= await PersonalSprint.findById(sid);
    const subTask= await PersonalSubTask.findById(subid);
    sprint.subTasks= sprint.subTasks.filter(n=>n!=subid);
    subTask.sprint= undefined;
    await sprint.save();
    await subTask.save();
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
}



const personalTaskSubTaskChangeOfSprints = async (req, res, next) => {
    const { uid, tid, sid, prevsid, subid } = req.params;

    try {
        // Retrieve the relevant sprint and subtask documents
        const sprint = await PersonalSprint.findById(sid);
        const subTask = await PersonalSubTask.findById(subid);
        const prevSprint = await PersonalSprint.findById(prevsid);
        
        if (!sprint || !subTask || !prevSprint) {
            return res.status(404).send('Sprint or Subtask not found');
        }

        // Log the initial sprint details
       
        // Remove the subtask from the previous sprint's subtask array
        prevSprint.subTasks = prevSprint.subTasks.filter(sub => !sub.equals(subid));
     
        // Add the subtask to the new sprint's subtask array
        sprint.subTasks.push(subTask._id);
    
        if(sprint.DueDate<subTask.dueDate){
            sprint.dueDate= subTask.dueDate;
        }
        // Update the subtask's sprint field to the new sprint
        subTask.sprint = sid;

        // Save all changes to the database
        await prevSprint.save();
        await sprint.save();
        await subTask.save();

        // Log the updated sprint details
      
        // Redirect to the backlogs page
        res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
    } catch (err) {
        console.error(err);
        next(err);  // Pass the error to the next middleware
    }
};

const getTeamProjectBacklog= async(req,res,next)=>{
    const {tid,pid}= req.params;
    const team= await GroupTask.findById(tid).populate('groupMembers').populate('admin');
    const user= await User.findById(req.currentUserId);
    const project= await GroupProject.findById(pid)
    .populate({
        path: 'sprints',
        populate: {
            path: 'subTasks',
            populate: {
                path: 'assignedTo'  
            }
        }
    }).populate({
        path:'subTasks',
        populate:{path:'assignedTo'}});

        project.subTasks.forEach(subTask => {
            subTask._id=subTask._id;
            subTask.burnTime = getTimeDifference(subTask.dueDate); // Temporarily add burnTime
        });
project.sprints.forEach(sprint => {
            sprint.burnTime= getTimeDifference(sprint.dueDate);
            sprint._id= sprint._id;
            sprint.subTasks.forEach(subTask => {
                subTask.burnTime = getTimeDifference(subTask.dueDate); // Temporarily add burnTime
            });
        });
    const isAdmin = team.admin.some(admin => admin._id.toString() === user._id.toString());
    res.render('teamProjectBacklog',{team,project,isAdmin});
}

const teamProjectAddSubTask= async(req,res,next)=>{
    const {tid,pid}= req.params;
    const {name,assignedTo,dueDate}= req.body;
    console.log(name,assignedTo,dueDate);
    const project= await GroupProject.findById(pid);
    const subTask= new GroupSubTask({name,assignedTo,dueDate,sprint:undefined,createdAt:new Date(),project:project._id});
    await subTask.save();
    scheduleUpdateTeamSubTask(subTask._id, dueDate,tid,pid,subTask._id);
    project.subTasks.push(subTask._id);
    await project.save();
    res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);
}

const addGroupProjectSubTaskToSprint= async(req,res,next)=>{
    const {tid,pid,sid,subid}= req.params;
    const sprint= await GroupSprint.findById(sid);
    const subTask= await GroupSubTask.findById(subid);
    if(sprint.dueDate<subTask.dueDate){
        sprint.dueDate= subTask.dueDate;
    }
    sprint.subTasks.push(subid);
    subTask.sprint= sid;
    await subTask.save();
    await sprint.save();
    res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);
}

const removeGroupProjectSubTaskFromSprint= async(req,res,next)=>{
    const {tid,pid,sid,subid}= req.params;
    const sprint= await GroupSprint.findById(sid);
    const subTask= await GroupSubTask.findById(subid);
    sprint.subTasks= sprint.subTasks.filter(n=>!n.equals(subid));
    subTask.sprint=undefined;
    await subTask.save();
    await sprint.save();
    res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);
}

const changeGroupProjectSubTaskSprint= async(req,res,next)=>{
    const {tid,pid,sid,subid,prevsid}= req.params;
    const prevSprint = await GroupSprint.findById(prevsid);
    const sprint= await GroupSprint.findById(sid);
    const subTask= await GroupSubTask.findById(subid);
    if (!sprint || !subTask || !prevSprint) {
        return res.status(404).send('Sprint or Subtask not found');
    }

    // Log the initial sprint details
   
    // Remove the subtask from the previous sprint's subtask array
    prevSprint.subTasks = prevSprint.subTasks.filter(sub => !sub.equals(subid));
 
    // Add the subtask to the new sprint's subtask array
    sprint.subTasks.push(subTask._id);

    if(sprint.dueDate<subTask.dueDate){
        sprint.dueDate= subTask.dueDate;
    }
    // Update the subtask's sprint field to the new sprint
    subTask.sprint = sid;

    // Save all changes to the database
    await prevSprint.save();
    await sprint.save();
    await subTask.save();

    // Log the updated sprint details
  
    // Redirect to the backlogs page
    res.redirect(`/task/team/project/backlogs/${tid}/${pid}`);
    
}

const deletePersonalSprint= async(req,res,next)=>{
    const {uid,tid,sid}= req.params;
    const task= await PersonalTask.findById(tid);
    task.sprints= task.sprints.filter(n=>!n.equals(sid));
    await task.save();
    await PersonalSprint.findByIdAndDelete(sid);
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
}

const editPersonalSprint= async(req,res,next)=>{
    const {uid,tid,sid}= req.params;
    const {dueDate,name}= req.body;
  
    const sprint= await PersonalSprint.findById(sid);
    sprint.dueDate= new Date(dueDate);
    sprint.name= name;
    await sprint.save();
    res.redirect(`/task/personal/backlogs/${uid}/${tid}`);
}



module.exports={createChooseForm,createChooseType,createPersonalTaskForm, createGroupTaskForm,
    createPersonalTask,createGroupTask,getTeamTaskTemplate,
    addPersonalTaskSprint,
    createTeamProject,createTeamProjectSprint,getProjectSprintTemplate,
    getTeamProjectSprintSubtask, teamProjectSprintSubTaskCommit,
    teamProjectSprintSubTaskSubmit,deleteTeamProjectSprintSubTask,
    updateTeamProjectSprintSubTask,
    deleteTeamProjectSprint,changeTeamProjectSprint,
    submitPersonalSprintSubTask,startPersonalSprintSubTask,personalTaskSprintChangeSubTask,
    personalTaskSprintSubTaskAbort,
    getPersonalTaskBacklog,addPersonalTaskSubTask,addPersonalTaskSubTaskToSprint,removePersonalTaskSubTaskFromSprint,
    personalTaskSubTaskChangeOfSprints,getTeamProjectBacklog,teamProjectAddSubTask,
    addGroupProjectSubTaskToSprint,removeGroupProjectSubTaskFromSprint,changeGroupProjectSubTaskSprint,
    personalTaskSprintBacklogSetPlan,personalTaskSprintBacklogUnsetPlan,setPlanTeamProjectBacklogSprint,
    unsetPlanTeamProjectBacklogSprint,deletePersonalSprint,editPersonalSprint
};