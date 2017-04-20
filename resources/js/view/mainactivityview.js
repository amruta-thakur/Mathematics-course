var globalIntervalId;

var mainActivityView = Backbone.View.extend({

    initialize: function () {
        this.render();
        this.initData();
        this.loadTemplates(this.templateSource);
        this.updateMinutesAndSecondsInHTML(this.timeInMinutes, this.timeInSeconds);
        this.updateActivityTitle(this.activityTitle);
        this.updateCarousel();
    },

    events: {
        "click #nextButton": "onNextButtonClicked",
        "click #backButton": "onBackButtonClicked",
        "click #startActivity": "onStartActivityClicked",
        "slid.bs.carousel #instructionCarousel":"onCarouselSliding",
        "click #carouselPreviousButton":"onCarouselPreviousButtonClick",
        "click #carouselNextButton":"onCarouselNextButtonClick"
        /*"click .item":"showImageInLightBox"*/
    },

    render: function () {
        console.log("render of main activity...");
        var source = $("#mainActivityTemplate").html();
        var template = Handlebars.compile(source);
        var html = template(this.model.toJSON());
        this.$el.html(html);
    },

    initData: function () {

        var timeDuration = this.model.get('timeDuration');
        this.initializeTimerVariables(timeDuration);

        this.noOfActivities = practiceConfig.length;
        this.activityNo = this.model.get('activityNo');
        this.activityTitle = "Activity "+this.activityNo;
        this.nextButtonCounter = this.activityNo;

        this.templateSource = 'resources/templates/template' + this.nextButtonCounter + '/template' + this.nextButtonCounter + '.html';

        this.$backButton = $("#backButton");
        this.$nextButton = $("#nextButton");
        this.$activityTitle = $("#activityTitle");

        this.$templateContainer = $("#templateContainer");
        this.$startActivityContainer = $("#startActivityContainer");
        this.$instructionContainer = $("#instructionContainer");

        this.$minutes = $("#minutesForActivity");
        this.$seconds = $("#secondsForActivity");

        if(this.activityNo == this.noOfActivities)this.enableNextButton(false);

    },

    initializeTimerVariables:function(timeDuration){

        this.timeDuration = timeDuration;
        this.timeInMinutes = parseInt(this.timeDuration / 60);
        this.timeInSeconds = this.timeDuration % 60;
        this.timerStartCount = this.timeDuration;
        this.timerEndCount = 0;
    },

    loadTemplates: function (templateSource) {
        this.$templateContainer.load(templateSource);
    },

    updateActivityTitle : function(activityTitle){
        this.$activityTitle.html(activityTitle);
    },

    updateMinutesAndSecondsInHTML: function (minutes, seconds) {

        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        this.$minutes.html(minutes);
        this.$seconds.html(seconds);

    },

    updateInstructionForQuestion:function(instructionText){
        this.$instructionContainer.html(instructionText);
    },

    updateCarousel:function(){


        var questionInstructions = this.model.get("questionInstructions");
        var hasImage = questionInstructions[0].hasImage;
        var hasVideo = questionInstructions[0].hasVideo;
        var instructionText = questionInstructions[0].instructionText;

        if(!hasImage && !hasVideo) $("#carouselContainer").hide();
        else  $("#carouselContainer").show();

        if(instructionText==""|| instructionText=='undefined')$("#carouselInstruction").hide();
        else $("#carouselInstruction").show();

        if(!hasImage && !hasVideo && instructionText==""|| instructionText=='undefined'){
            $("#carouselColumn").hide();
            this.$el.find("#mainTemplateColumn").removeClass('col-md-8').addClass('col-md-12');
        }
        else {
            $("#carouselColumn").show();
            this.$el.find("#mainTemplateColumn").removeClass('col-md-12').addClass('col-md-8')
        }

        this.$el.find('.carousel-inner div').first().addClass('active');

        var totalItems = $('.item').length;
        if(totalItems==1 || totalItems==0){
            $('#carouselNextButton').addClass('carousel-control-disabled');
            $('#carouselPreviousButton').addClass('carousel-control-disabled');
        }

        this.updateInstructionForQuestion(instructionText);

    },

    onNextButtonClicked: function () {

        this.stopTimer();
        this.nextButtonCounter++;
        if (this.nextButtonCounter == this.noOfActivities) this.enableNextButton(false);
        this.enableBackButton(true);
        var routeUrl = 'activity/'+this.nextButtonCounter;
        myRouter.navigate(routeUrl,{trigger: true, replace: true});
    },

    onBackButtonClicked: function () {

        this.nextButtonCounter = parseInt(Backbone.history.location.hash.slice(-1));

        this.stopTimer();
        if (this.nextButtonCounter < 1) {
            $('#mainActivityContainer').hide();
            $('#activitiesMenuContainer').show();
        }
        else {
            this.nextButtonCounter--;
            if (this.nextButtonCounter < 1) {
                $('#mainActivityContainer').hide();
                $('#activitiesMenuContainer').show();
            }

            var routeUrl = 'activity/' + this.nextButtonCounter;
            if (this.nextButtonCounter == 0) {
                routeUrl = "";
                myRouter.navigate(routeUrl, true);
            }
            myRouter.navigate(routeUrl, true);
        }

    },

    enableBackButton: function (state) {
        if (state) {
            this.$backButton.removeAttr("disabled");
        } else {
            this.$backButton.attr("disabled", true);
        }
    },

    enableNextButton: function (state) {
        if (state) {
            this.$nextButton.removeAttr("disabled");
        } else {
            this.$nextButton.attr("disabled", true);
        }
    },

    onStartActivityClicked: function () {
        this.$startActivityContainer.hide();
        this.startTimerForActivity();
    },

    startTimerForActivity: function () {
        var $self = this;
        globalIntervalId = setTimeout(function () {
            $self.updateTimer();
        }, 1000);
    },

    stopTimer : function(){
        clearInterval(globalIntervalId);
    },

    updateTimer: function () {

        var $self = this;
        var minutes, seconds;
        this.timerStartCount--;

        if (seconds < 59) {
            seconds = this.timerStartCount;
        }
        else {
            minutes = this.getMinutes();
            seconds = this.getSeconds();
        }

        if (this.timerStartCount <= this.timerEndCount) {
            clearInterval(globalIntervalId);
        }
        else {
            globalIntervalId = setTimeout(function () {
                $self.updateTimer();
            }, 1000);
        }

        this.updateMinutesAndSecondsInHTML(minutes, seconds);
    },

    getMinutes: function () {
        this.timeInMinutes = Math.floor(this.timerStartCount / 60);
        return this.timeInMinutes;
    },

    getSeconds: function () {
        return this.timerStartCount - Math.round(this.timeInMinutes * 60);
    },

    onCarouselSliding:function(event){

        var currentSlideId = (event.relatedTarget.id).split("-")[1];
        var questionInstructions = this.model.get("questionInstructions");
        var hasImage = questionInstructions[currentSlideId].hasImage;
        var hasVideo = questionInstructions[currentSlideId].hasVideo;
        var instructionText = questionInstructions[currentSlideId].instructionText;


        var videoPause=document.getElementsByTagName('video');
        for(var i=0;i<videoPause.length;i++){
            videoPause[i].pause();
        }



        if(!hasImage && !hasVideo) $("#carouselContainer").hide();
        else  $("#carouselContainer").show();

        if(instructionText==""|| instructionText=='undefined')$("#carouselInstruction").hide();
        else $("#carouselInstruction").show();

        if(!hasImage && !hasVideo && instructionText==""|| instructionText=='undefined'){
            $("#carouselColumn").hide();
            this.$el.find("#mainTemplateColumn").removeClass('col-md-8').addClass('col-md-12');
        }
        else {
            $("#carouselColumn").show();
            this.$el.find("#mainTemplateColumn").removeClass('col-md-12').addClass('col-md-8');
        }

        this.updateInstructionForQuestion(instructionText);
    }

});
