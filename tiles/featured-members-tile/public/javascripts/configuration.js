jive.tile.onOpen(function(config, options) {
    if(!config["data"])
        initReact({});
    else
        initReact(config["data"]);
});
