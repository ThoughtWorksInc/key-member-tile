var React = require('react');
var ReactDOM = require('react-dom');
var sortable = require('./react-sortable-mixin');
var Title = React.createClass({
    onChangeTitle: function (e) {
        var changedTitle = e.target.value.slice(0,50);
        var newState = this.props.state;
        newState.tileTitle = changedTitle;
        this.props.updateState(newState);
    },

    render: function () {
        return (<div className="item-container bg-color-gray">
            <h2 className="title">Title
            </h2>
            <input type="text" placeholder="Max 50 Characters" value={this.props.state.tileTitle} onChange={this.onChangeTitle}></input>
        </div>)
    }
});

var Header = React.createClass({
    render: function () {
        return (<div className="row margin-bottom-sm  margin-top-lg">
            <div className="col-6">
                <h2 className="title">Member
                    <span className="required-mark"></span>
                </h2>
            </div>
            <div className="col-6">
                <h2 className="title">Title
                </h2>
            </div>
        </div>);
    }
});

var MembersValidation = React.createClass({
    render: function () {
        return (<div className="inline-error-message atleast-one-member">Add atleast one member.</div>)
    }
});

var RequiredValidation = React.createClass({
    render: function () {
        return (<div className="inline-error-message">Required</div>)
    }
});

var ValidUserValidation = React.createClass({
    render: function () {
        return (<div className="inline-error-message">Member is not valid</div>)
    }
});

var alreadyExistValidation = React.createClass({
    render: function () {
        return (<div className="inline-error-message">Selected member already exist</div>)
    }
});

var MemberConfig = React.createClass({
    mixins: [sortable.ItemMixin],
    itemOptions:{
        handle: "ItemHandle",
        placeholder: "dashed"
    },
    getTitle : function (profile) {
        return _.pluck(_.filter(profile,function(e){return e.jive_label=="Title" ; }),'value')[0] || '';
    },

    deleteMember: function (e) {
        var memberToDelete = this.props.member;
        var state = this.props.state;
        var remainingMember = state.users.filter(function (member) {
            return member.id != memberToDelete.id
        })
        state.users = remainingMember;
        this.props.updateState(state);
        gadgets.window.adjustHeight();
    },

    isMemberExist : function (member) {
        return _.find(this.props.state.users,{displayName:member.displayName,username:member.username});
    },

    selectMember: function (e) {
        var item = e.target;
        var member = this.props.member;
        member.displayName = e.target.value;
        this.setState(member);
        var that = this;
        $(e.target).autocomplete( {
            source: function (request, response) {
                var query = that.props.member.displayName;
                osapi.jive.core.get({
                    v: "v3",
                    href: '/search/people?filter=search(' + query + ')'
                }).execute(function (users) {
                    response(_.map(users.content.list, function (c) {
                        return {label:c.displayName,logo:c.thumbnailUrl, displayName:c.displayName, avatarUrl:c.thumbnailUrl,title: that.getTitle(c.jive.profile),userId:c.id,username:c.jive.username};
                    }));
                });
            },

            select: function (event, ui) {
                if(that.isMemberExist(ui.item)){
                    $(event.target).next().show();
                    setTimeout(function () {
                        $(event.target).next().hide();
                        $(event.target).val("");
                    },3000);
                }else {
                    this.value = ui.item.label;
                    member.displayName = ui.item.displayName;
                    member.avatarUrl = ui.item.avatarUrl;
                    member.title = ui.item.title;
                    member.userId = ui.item.userId;
                    member.username = ui.item.username;
                    member.validUser = true;
                    that.setState(member);
                    event.preventDefault();
                    var parent = this.parentNode;
                    $(parent).find('input').hide();
                    $(parent).find('.profile-data img').attr('src',member.avatarUrl);
                    $(parent).find('.profile-data label').text(member.displayName);
                    $(parent).find('.profile-data').show();
                }
                return false;
            },
        }).keyup(function (event) {
            if (event.keyCode === 8) {
                $(".ui-menu-item").hide();
                $('.ui-autocomplete.ui-front.ui-menu.ui-widget.ui-widget-content').hide();
            }
        }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
            return $( "<li>" )
                .data( "ui-autocomplete-item", item )
                .append( "<div><img class='avatar-img' src='"+item.avatarUrl+"'>&nbsp;<span class='name-label'>" + item.label +"</span></div>" )
                .appendTo( ul );
        };
    },

    changeTitle: function (e) {
        var newTitle = e.target.value.slice(0,50);
        var member = this.props.member;
        member.title = newTitle;
        this.setState(member);
    },

    checkEmptyValidation: function () {
        return (this.props.member.displayName.length == 0 && this.props.state.validation)
            ? <RequiredValidation /> : null;
    },

    validMemberValidation : function () {
        return (!this.props.member.validUser && this.props.state.validation) ? <ValidUserValidation /> : null;
    },

    render: function () {
        var inputStyle = this.props.member.validUser ? {display:"none"} : {display:"block"};
        var blockStyle = this.props.member.validUser ? {display:"block"} : {display:"none"};
        var validations = this.checkEmptyValidation() || this.validMemberValidation();
        return ( <div className="row margin-bottom-sm" data-docid={this.props.member.id}>
            <i className="fa fa-ellipsis-v dragable-icon" ref="ItemHandle"></i>
            <div>
                <div className="col-6">
                    <input type="text"  value={this.props.member.displayName} style={inputStyle} onChange={this.selectMember}/>
                    <div className="inline-error-message" id="member-exist-error" style={{display:'none'}}>Selected member already exist.</div>
                    {validations}
                    <div className="profile-data" style={blockStyle}>
                        <img className='avatar' src={this.props.member.avatarUrl}/>
                        <label className="member-name">{this.props.member.displayName}</label>
                    </div>
                </div>
                <div className="col-6">
                    <div className="margin-right-lg">
                        <input type="text" placeholder="Max 50 characters" value={this.props.member.title} onChange={this.changeTitle}/>
                    </div>
                    <i className="fa fa-trash fa-lg trash-icon" onClick={this.deleteMember}></i>
                </div>
            </div>
        </div>)
    }
});

var AddMember = React.createClass({
    addMember: function () {
        var newMember = {avatarUrl:"",displayName:"",title:"", id:this.getNextId(),validUser:false};
        var state = this.props.state;
        state.validation = false;
        state.users.push(newMember);
        this.props.updateState(state);
        gadgets.window.adjustHeight();
    },

    getNextId: function(){
        if(this.props.state.users.length == 0)
            return 1;
        else{
            var maxId = _.reduce(this.props.state.users, function(max, n){
                if (max.id > n.id)
                    return max;
                else
                    return n;
            });
        }
        return maxId.id + 1;
    },


    render: function () {
        var note = this.props.state.users.length < 15 ? "(You can add a maximum of 15 users)" : "(You have the added maximum number of users)";
        return (<div className="margin-top-md">
            <a className={this.props.state.users.length < 15 ? "add-button" : "add-button disabled"} href="#" onClick={this.addMember}>+ Add</a><span className="hint">{note}</span>
        </div>)
    }
});


var SaveConfig = React.createClass({
    validUser: function () {
        var state = this.props.state;
        var invalidMembers = state.users.filter(function (member) {
            return member.displayName.length == 0 || member.username.length == 0;
        });
        return invalidMembers.length > 0 ? false : true;
    },

    applyChanges: function () {
        var state = this.props.state;
        state.validation = true;
        this.props.updateState(state);
        if(state.users.length > 0 && this.validUser()){
            state.validation = true;
            this.props.updateState(state);
            jive.tile.close({data:this.props.state});
        }
    },

    cancelChanges: function () {
        jive.tile.close();
    },
    render: function () {
        return (<div className="margin-top-lg">
            <a href="#" className="btn btn-primary" onClick={this.applyChanges}>Apply</a>
            <a href="#" className="btn btn-secondary margin-left-md" onClick={this.cancelChanges}>Cancel</a>
        </div>);
    }
});

var MainConfig = React.createClass({
    mixins: [sortable.ListMixin],
    listOptions:{
        resortFuncName: "reorderItems",
        left : 0,
        side : "y",
        restrict : "parent",
        model: "item"
    },
    getInitialState: function () {
        if(this.props.configData.users && this.props.configData.users.length > 0){
            this.props.configData.users = this.props.configData.users.map(function (user) {
                user.validUser = true;
                return user;
            });
            this.props.configData.validation = false;
            return this.props.configData;
        }
        return {tileTitle:"",users:[{avatarUrl:"",displayName:"",title:"", id:1, order:1,validUser:false}], validation:false}
    },

    updateMainState: function (state) {
        this.setState(state);
    },

    componentDidMount: function () {
        gadgets.window.adjustHeight();
    },
    setDraggedId: function(id){
        this.setState({dragged_id: id});
    },
    setDroppedId: function(id){
        this.setState({dropped_id: id});
    },

    getItem: function(id){
        return _.find(this.state.users, function(member){
            return member.id == id;
        });
    },

    reorderItems: function(sourceIdx,targetIdx){
        var tmp = this.state.users[sourceIdx];
        this.state.users.splice(sourceIdx, 1);
        this.state.users.splice(targetIdx, 0, tmp);
        this.state.users.map(function(item, idx){
            this.state.users[idx].order = idx + 1;
        }.bind(this));
        this.setState({"users": this.state.users});
    },

    render: function () {
        var users = [];
        var memberValidation = (this.state.users.length == 0 && this.state.validation) ? <MembersValidation /> : null;
        if(this.state.users){
                users = this.state.users.map(function (member,idx) {
                    return <MemberConfig updateState={this.updateMainState}
                                         reorderItems={this.reorderItems}
                                         setDraggedId={this.setDraggedId}
                                         setDroppedId={this.setDroppedId}
                                         key={idx}
                                         index = {idx}
                                         state={this.state}
                                         member={member}
                                         {...this.movableProps}/>
                }.bind(this));
        }
        return (<div className="j-wrapper">
            <div>
                <h1 className="margin-bottom-sm">
                    TW-Featured Team Members
                </h1>
                <p className="description">
                    Display key contacts for your group along with their roles and photos.
                </p>
            </div>
            <br />
            {memberValidation}
            <Title updateState={this.updateMainState} state={this.state}/>
            <div className="item-container bg-color-gray">
                <Header />
                <div>
                    {users}
                </div>
                <AddMember updateState={this.updateMainState} state={this.state}/>
            </div>
            <SaveConfig updateState={this.updateMainState} state={this.state} />
        </div>);
    }
});


var initReact = function (config) {
    ReactDOM.render(React.createElement(MainConfig,{configData:config}),document.getElementById('index'));
};
window.initReact = initReact;



