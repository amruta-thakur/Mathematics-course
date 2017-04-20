var activityMenuView = Backbone.View.extend({

    initialize: function () {
        this.initData();
        this.render();
    },

    events: {
        "click .activity-name": "onActivityNameClick"
    },
    render: function () {
        console.log("render of activity menu...");
        var source = $("#activityMenuTemplate").html();
        var template = Handlebars.compile(source);
        var html = template(this.model.toJSON());
        this.$el.html(html);
    },
    initData: function () {
        this.activities = this.model.get("activities");
        $('#mainActivityContainer').hide();

    },

    onActivityNameClick: function () {
        $("#activitiesMenuContainer").hide();
        $('#mainActivityContainer').show();
    }

});
