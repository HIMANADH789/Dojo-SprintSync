const express= require('express');
const mongoose= require('mongoose');
const passport= require('passport');
const localStrategy= require('passport-local');
const path= require('path');
const session= require('express-session');
const User= require('../schemas/user');
const task= require('../controllers/task');
const {isLoggedIn}= require('../utils/middlewares');





main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskManager');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const app= express();
const router= express.Router({mergeParams: true});

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true,
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

router.get('/createChooseType',isLoggedIn,task.createChooseForm);

router.post('/createChooseType',isLoggedIn,task.createChooseType);

router.get('/createPersonal',isLoggedIn,task.createPersonalTaskForm);

router.get('/createGroup',isLoggedIn,task.createGroupTaskForm);

router.post('/createPersonal',isLoggedIn,task.createPersonalTask);

router.post('/createGroup',isLoggedIn,task.createGroupTask);

router.get('/team/:tid',isLoggedIn,task.getTeamTaskTemplate);

router.get('/personal/:uid/:tid',isLoggedIn,task.getPersonalTaskBacklog);

router.post('/personal/add-sprint/:uid/:tid',isLoggedIn,task.addPersonalTaskSprint);



//router.post('/personal/add-subtask/:uid/:tid/:sid',isLoggedIn,task.addPersonalTaskSprintSubtask);

router.post('/team/create-project/:uid/:tid',isLoggedIn,task.createTeamProject);

router.get('/team/project/:tid/:pid',isLoggedIn,task.getTeamProjectBacklog);

router.post('/team/project/create-sprint/:tid/:pid',isLoggedIn,task.createTeamProjectSprint);



//router.post('/team/project/sprint/create-subTask/:tid/:pid/:sid',isLoggedIn,task.createTeamProjectSprintSubTask);



router.post('/team/project/sprint/submit-subTask/:tid/:pid/:sid/:subid',isLoggedIn,task.teamProjectSprintSubTaskSubmit);

router.post('/team/project/sprint/commit-subTask/:tid/:pid/:sid/:subid',isLoggedIn,task.teamProjectSprintSubTaskCommit);

router.get('/team/project/sprint/delete-subTask/:tid/:pid/:sid/:subid',isLoggedIn,task.deleteTeamProjectSprintSubTask);

router.post('/team/project/sprint/changeSubtask/:tid/:pid/:sid/:subid',isLoggedIn,task.updateTeamProjectSprintSubTask);

//router.put('/team/project/sprint/set-plan/:tid/:pid/:sid',isLoggedIn,task.setPlanTeamProjectSprint);

//router.put('/team/project/sprint/unset-plan/:tid/:pid/:sid',isLoggedIn,task.unsetPlanTeamProjectSprint);

router.get('/team/project/sprint/delete-sprint/:tid/:pid/:sid',isLoggedIn,task.deleteTeamProjectSprint);

router.post('/team/project/sprint/edit/:tid/:pid/:sid',isLoggedIn,task.changeTeamProjectSprint);

//router.get('/personal/sprint/subTasks/:uid/:tid/:sid',isLoggedIn,task.getPersonalTaskSprintSubTasks);

router.post('/personal/sprint/subTask-submit/:uid/:tid/:sid/:subid',isLoggedIn,task.submitPersonalSprintSubTask);

router.post('/personal/sprint/subTask-start/:uid/:tid/:sid/:subid',isLoggedIn,task.startPersonalSprintSubTask);

router.post('/personal/sprint/subTask-delete/:uid/:tid/:sid/:subid',isLoggedIn,task.personalTaskSprintSubTaskAbort);

router.post('/personal/sprint/subTask-change/:uid/:tid/:sid/:subid',isLoggedIn,task.personalTaskSprintChangeSubTask)

//router.put('/personal/sprint/unset-plan/:uid/:tid/:sid',isLoggedIn,task.personalTaskSprintUnsetPlan);

//router.put('/personal/sprint/set-plan/:uid/:tid/:sid',isLoggedIn,task.personalTaskSprintSetPlan);

router.get('/personal/backlogs/:uid/:tid',isLoggedIn,task.getPersonalTaskBacklog);

router.post('/personal/add-subtask/:uid/:tid',isLoggedIn,task.addPersonalTaskSubTask);

router.get('/personal/add-subTask-to-sprint/:uid/:tid/:sid/:subid',isLoggedIn,task.addPersonalTaskSubTaskToSprint);

router.get('/personal/remove-subTask-from-sprint/:uid/:tid/:sid/:subid',isLoggedIn,task.removePersonalTaskSubTaskFromSprint);

router.get('/personal/change-subTask-sprint/:uid/:tid/:prevsid/:sid/:subid',isLoggedIn,task.personalTaskSubTaskChangeOfSprints);

router.get('/team/project/backlogs/:tid/:pid',isLoggedIn,task.getTeamProjectBacklog);

router.post('/team/project/add-subTask/:tid/:pid',isLoggedIn,task.teamProjectAddSubTask);

router.get('/team/project/add-subTask-to-sprint/:tid/:pid/:sid/:subid',isLoggedIn,task.addGroupProjectSubTaskToSprint);

router.get('/team/project/remove-subTask-from-sprint/:tid/:pid/:sid/:subid',isLoggedIn,task.removeGroupProjectSubTaskFromSprint);

router.get('/team/project/change-subTask-sprint/:tid/:pid/:prevsid/:sid/:subid',isLoggedIn,task.changeGroupProjectSubTaskSprint)

router.put('/personal/sprint/unset-plan-backlog/:uid/:tid/:sid',isLoggedIn,task.personalTaskSprintBacklogUnsetPlan);

router.put('/personal/sprint/set-plan-backlog/:uid/:tid/:sid', isLoggedIn, task.personalTaskSprintBacklogSetPlan);

router.put('/team/project/sprint/unset-plan-backlog/:tid/:pid/:sid',isLoggedIn,task.unsetPlanTeamProjectBacklogSprint);

router.put('/team/project/sprint/set-plan-backlog/:tid/:pid/:sid',isLoggedIn,task.setPlanTeamProjectBacklogSprint);

router.post('/personal/delete-sprint/:uid/:tid/:sid',isLoggedIn,task.deletePersonalSprint);

router.post('/personal/edit-sprint/:uid/:tid/:sid',isLoggedIn,task.editPersonalSprint);

router.get('/team/project/your-subTasks/:tid/:pid',isLoggedIn,task.getTeamProjectSprintSubtask);

module.exports=router;

