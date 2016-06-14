var React = require('react');
var ReactDOM = require('react-dom');
var MainView = React.createClass({
    getInitialState: function () {
        return this.props.configData;
    },

    componentDidMount: function () {
        gadgets.window.adjustHeight();
    },

    render: function () {
        var jiveBaseUrl = opensocial.getEnvironment().jiveUrl;
        return (<div >
            <h1 id="tile-title" className="title">{this.state.tileTitle}</h1>
            <ul className="gravatars">
                {
                    this.state.users.map(function (member,idx) {
                        var personUrl = jiveBaseUrl+"/people/"+member.username;
                        var avatarUrl = member.avatarUrl;
                        var altText = member.displayName+"\n"+member.title;
                        return (
                            <li key={idx}>
                                <a href={personUrl} target="_blank" title={altText}><img src={avatarUrl} /></a>
                            </li>)
                    })
                }
            </ul>
        </div>)
    }
})

var initView = function (configData) {
    ReactDOM.render(React.createElement(MainView,{configData:configData}),document.getElementById('tile-view'));
};
window.initView = initView;
