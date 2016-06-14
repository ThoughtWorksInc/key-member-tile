var getTitle =function(profile){

};

var deleteUser = function(configData,id){
    return _.reject(configData,function(e){ return e.id == id ;});
};

var reorderUserList = function(configData,list){
    return _.map(list,function(e){return _.find(configData,function(f){return e==f.id;}) ; });
};

var changeText = function(configData,id,newTitle){
    return _.map(configData,function(e){ if (e.id==id) {e.title=newTitle;} return e;});
};

var validationError = function(data){
    if(data.users.length === 0){
        return "Please select at least one user";
    }
    if(data.tileTitle.trim().length === 0){
        return "Please set a title for the tile";
    }
};
