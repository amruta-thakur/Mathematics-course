

$(function () {




    var activityModel = new activityMenuModel(activitiesConfig);
    var activities = new Backbone.Collection(practiceConfig);
    var activityView = new activityMenuView({model: activityModel, collection: activities, el: $("#activitiesMenuContainer")});


    Backbone.history.start({silent: true });

    console.log(Backbone.history.fragment);

    myRouter.navigate('');
    Backbone.history.loadUrl();

});