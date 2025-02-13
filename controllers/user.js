const User= require('../schemas/user');
const GroupTask= require('../schemas/groupTask');
const PersonalTask= require('../schemas/personalTask');

const registerForm= async(req,res,next)=>{
    res.render('registerForm');
}

const register= async(req,res,next)=>{
    const {email,name,username,password}= req.body;
    const user= new User({email,name,username});
    const registeredUser= await User.register(user,password);
    req.login(registeredUser,(err) => {
      if (err) return next(err);
      return res.redirect('/');
    });

}

const loginForm= async(req,res,next)=>{
    res.render('loginForm');
}

const login= async(req,res,next)=>{

    res.redirect('/'); 
}

const logout= async(req,res,next)=>{
    req.logout(err=>{
        if (err) return next(err);
        
      res.redirect('/');
      })

}

const getNotifications= async(req,res,next)=>{
    const currentUserId= req.currentUserId;
    const user= await User.findById(currentUserId).populate('personalTasks').populate({
        path: 'notificationTasks.subTask',  
        select: 'name assignedTo dueDate status'  
    })
    .populate({path:'notificationTasks.project',select: 'name '})
    .populate({path:'notificationTasks.team',select: 'name '}).populate('notificationTasks');;
    const {notificationTasks}= user;
    const notifications = [];
    console.log(notificationTasks);
   
    for (let notificationId of user.notifications) {
        let populatedNotification = null;

        
        const notificationDoc = await User.findById(notificationId); 
        if (notificationDoc) {
            
            populatedNotification = {
                type: 'User',
                user: notificationDoc  
            };
        } else {
           
            const groupTaskDoc = await GroupTask.findById(notificationId); 
                populatedNotification = {
                    type: 'GroupTask',
                    group: groupTaskDoc 
                };
            }
            if (populatedNotification) {
                notifications.push(populatedNotification);
            }
        }
        
        
        res.render('notificationPage',{notifications,notificationTasks});
        
       
    }
    
       
       



const acceptFriendRequest= async(req,res,next)=>{
    const{fid}= req.params;
    const currentUserId= req.currentUserId;
    const requested= await User.findById(fid);
    const acceptor= await User.findById(currentUserId);
    requested.friendsRequestedFor.remove(acceptor._id);
    requested.following.push(acceptor._id);
    await requested.save();
    acceptor.followers.push(requested._id);
    acceptor.notifications.pull(requested._id);
    await acceptor.save();
    res.redirect('/user/notifications');
}

const acceptTeamTask= async(req,res,next)=>{
    const {tid}= req.params;
    const currentUserId= req.currentUserId;
    const team= await GroupTask.findById(tid);
    team.membersUnderRequest.remove(currentUserId);
    team.groupMembers.push(currentUserId);
    await team.save();
    const user= await User.findById(currentUserId);
    user.engagedTasks.push(team._id);
    user.notifications.pull(team._id);
    await user.save();
    res.redirect('/user/notifications');
}

const searchFriend= async(req,res,next)=>{
    const{searchFriendId}= req.body;
    const currentUserId= req.currentUserId;
    const friend= await User.findOne({username:searchFriendId}).populate('followers')
    .populate('following');
    if(friend){
        const user= await User.findById(currentUserId);
    
    const isFriend= user.followers.includes(friend._id) || user.following.includes(friend._id) || friend._id.equals(user._id);
    res.render('userDetails',{friend,isFriend});
    }
    else{
        req.flash('error','Cannot find User');
        res.redirect('/');
    }
}

const requestFriend= async(req,res,next)=>{
    const{fid}= req.params;
    const currentUserId= req.currentUserId;
    const requesting = await User.findById(currentUserId);
    const requested= await User.findById(fid);
    const isFriend= requesting.followers.includes(requested._id) || requesting.following.includes(requested._id);
    if(!isFriend && requested._id!=requesting._id){
    requesting.friendsRequestedFor.push(requested._id);
    await requesting.save();
    const notification = {
        notificationType: 'User',  
        user: requesting._id  
    };
    requested.notifications.push(notification.user);
    await requested.save();
    }
    const friend= requested;
    res.render('userDetails',{friend,isFriend});
}

const showFriends= async(req,res,next)=>{
    const user= await User.findById(req.user._id).populate('followers').populate('following');
    const followers= user.followers;
    const following= user.following;
    res.render('showFriends',{followers,following});
}

const showCommittedTasks= async(req,res,next)=>{
    const user= await User.findById(req.currentUserId).populate('admin').populate('engagedTasks')
    .populate('personalTasks').populate({
        path: 'engagedGroupSubTasks.subTask',  
        select: 'name assignedTo dueDate'  
    }).populate({path:'engagedGroupSubTasks.sprint',select: 'name '})
    .populate({path:'engagedGroupSubTasks.project',select: 'name '})
    .populate({path:'engagedGroupSubTasks.team'});
    const {engagedGroupSubTasks}= user;
    res.render('committedTasks',{user,engagedGroupSubTasks});

}

const showPersonalTasks= async(req,res,next)=>{
    const user= await User.findById(req.currentUserId).populate('personalTasks');
    res.render('personalTasks',{user});
}

const showGroupTasks= async(req,res,next)=>{
    const user= await User.findById(req.currentUserId).populate('engagedTasks').populate('admin');
    res.render('groupTasks',{user});
}

module.exports={registerForm,register,loginForm,login,logout,getNotifications,
    acceptFriendRequest,acceptTeamTask,searchFriend,requestFriend,showFriends,showCommittedTasks,
    showPersonalTasks,showGroupTasks};