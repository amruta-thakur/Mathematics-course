var activityRouter = Backbone.Router.extend({

    initialize: function () {
    },

    routes: {
        "": "routeHomeView",
        "activity/:activityId": "routeActivityView"
    },

    routeActivityView: function (activityId) {

        console.log("inside route activity view");

        var activityModel = new mainActivityModel(practiceConfig[activityId - 1]);
        if (this.activityView) {
            this.activityView.remove();
            $("body").append($("<div id='mainActivityContainer'></div>"));
        }
        this.activityView = new mainActivityView({model: activityModel, el: $("#mainActivityContainer")});
    },

    routeHomeView: function () {
        Backbone.history.navigate("", {trigger: true});
    }

});

myRouter = new activityRouter();

