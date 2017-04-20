var templateView = Backbone.View.extend({

    initialize: function () {
        this.initData();
        this.render();
        this.showSolutionReference();

    },

    events: {

        /* Button events for all the templates starts*/
        "click #submitButton": "onSubmitButtonClicked",
        "click #resetButton": "onResetButtonClicked",
        "click #showSolution": "onShowSolButtonClicked",
        /* Button events for all the templates ends*/

        /* events for MCQ templates starts*/
        "change .options": "onOptionSelected",
        "click input:checkbox": "checkUserOptions",
        /* events for MCQ templates ends*/

        /* events for hot spot templates starts*/
        "click .options": "onHotSpotSelected",
        /* events for hot spot templates ends*/

        /* events for fill in the blanks templates starts*/
        "blur .fib-textbox": "onBlurEventOccur",
        "focus input": "clearValidation",
        /* events for Fill in the blanks templates ends*/

        /*events for open ended templates starts*/
        "click #startTimer": "startTimer",
        "click #pauseTimer": "pauseTimer",
        "click #modalAnswerButton": "showModalAnswer",
        "click #lightBoxOverlay": "hideLightBox",
        /*events for open ended templates ends*/

        /*events for drag drop starts*/
        "mousedown .dragOptions": "onMouseDown",
        /*events for drag drop templates ends*/

        /*zoom print zoom functionality start*/
        "click #zoomin": "zoomInImage",
        "click #zoomout": "zoomOutImage",
        "click #notepad": "showNotepad",
        "click #print": "printPage",
        "click #textAreaId": "focusArea",
        "click #notepadClose": "closeNotepad"
        /*zoom print zoom functionality end*/

    },

    initData: function () {

        this.noOfActivities = question.length;
        this.noOfAllowedAttempts = this.model.get("config").attempts;
        this.userSelectedOption = [];
        this.userAnswer = [];
        this.optionsList = [];

        this.attemptCount = 0;
        this.answerLength = 0;
        this.correctAnswerCount = 0;
        this.count = 0;
        this.correctAnswerCount = 0;
        this.wrongAnswerCount = 0;

        this.isHotSpotSequential = "";
        this.isHotSpotMultiSelect = "";
        this.isZoom = "";
        this.isPrint = "";
        this.isNotepad = "";
        this.allOptions = "";

        /* Timer variables initialised for the open ended template*/
        this.timeDuration = this.model.get('timeDuration');
        this.timeInMinutes = parseInt(this.timeDuration / 60);
        this.timeInSeconds = this.timeDuration % 60;
        this.timerStartCount = this.timeDuration;
        this.timerEndCount = 0;


        /*Variables for drag drop starts*/
        this.currentDraggableId = "";
        this.orgPos = 0;
        this.noOfAttempts = 0;

        this.parentPos = {left: 0, top: 0};
        this.parentSize = {width: 0, height: 0};
        this.dragObjectSize = {width: 0, height: 0};

        this.isDragging = null;
        this.totalDraggables = 0;
        this.isDropped = 0;
        this.droppedOn = 0;
        this.answerSubmitted = false;

        this.draggablesOriginalPosition = [];
        this.checkAssociativeArray = [];
        /*Variables for drag drop ends*/

        /* Bucket Variables starts*/

        this.isGoToHomeBucket = false;
        this.bucketObjectPosition = 0;
        this.totalElementsInBucket = [];
        this.bucketArray = [];
        this.bucketGoToHomePositionArray = [];
        this.showSolutionArray = {};
        this.showSolutionSingleDragDropArray = {};
        this.showSolutionFixedDragDropArray = {};
        this.bucketPosition = [];
        this.bucketAssociativeArray = [];
        this.bucketFixedElement = [];
        //this.showSolutionReference();
        this.dragMargin = this.model.get('bucketDragTopMargin');

        /* Bucket Variables ends*/

    },

    render: function () {

        var source = $("#activityTemplate").html();
        var template = Handlebars.compile(source);
        var html = template(this.model.toJSON());
        this.$el.html(html);

        _.defer(_.bind(function () {
            this.postRender();
        }, this));
        return this;
    },

    postRender: function () {

        if (this.model.get('config').isTimer) {
            this.initialiseMinutesAndSeconds();
        }
        if (this.model.get('config').isDragDrop) {
            this.setOriginalPositionOfDraggables("#drag-");

        }
        if (this.model.get('config').isBucketDragDrop) {
            this.initialiseBucketArray();
            this.setOriginalPositionOfDraggables("#bucketDraggables-");
        }

        if (this.model.get('config').isFillInTheBlank) {
            var $self = this;
            this.$el.find("input").keyup(function () {
                $self.disableSubmitButton(false);
                $self.disableResetButton(false);
            });
        }

    },

    initialiseBucketArray: function () {
        var bucketLength = this.model.get("bucketData").length;
        for (var i = 0; i < bucketLength; i++) {
            this.bucketArray.push({
                id: i + 1, 'name': 'bucketArray' + i, 'counter': 1, 'bucketArrayData': [], 'isBucketLimitReached':false
            });
        }
    },

    /*Methods for Open Ended Templates starts*/
    initialiseMinutesAndSeconds: function () {

        this.timeInMinutes = (this.timeInMinutes <= 9) ? "0" + this.timeInMinutes : this.timeInMinutes;
        this.timeInSeconds = (this.timeInSeconds <= 9) ? "0" + this.timeInSeconds : this.timeInSeconds;
        this.$el.find("#minutes").html(this.timeInMinutes);
        this.$el.find("#lightBoxMinutes").html(this.timeInMinutes);
        this.$el.find("#seconds").html(this.timeInSeconds);
        this.$el.find("#lightBoxSeconds").html(this.timeInSeconds);
    },
    startTimer: function (event) {
        this.hideModalAnswer();
        this.disableStartTimerButton(true);
        this.disablePauseTimerButton(false);
        this.disableShowSolutionButtonForDiscussion(true);
        var $self = this;
        this.intervalId = setTimeout(function () {
            $self.updateTimer();
        }, 1000);
    },
    pauseTimer: function () {
        clearInterval(this.intervalId);
        this.disableStartTimerButton(false);
        this.disablePauseTimerButton(true);
        this.disableShowSolutionButtonForDiscussion(false);
    },
    stopFrameworkTimer: function () {
        clearInterval(globalIntervalId);
    },
    updateTimer: function () {

        var $self = this;
        var minutes, seconds;
        this.timerStartCount--;

        if (seconds < 59) {
            seconds = this.updateTimer.timerStartCount;
        }
        else {
            minutes = this.getMinutes();
            seconds = this.getSeconds();
        }

        if (this.timerStartCount == this.timerEndCount) {
            this.pauseTimer();
            this.disableShowSolutionButtonForDiscussion(false);
            this.disableStartTimerButton(true);
        }
        else {
            this.intervalId = setTimeout(function () {
                $self.updateTimer();
            }, 1000);

        }
        this.updateMinutesAndSeconds(minutes, seconds);

    },
    updateMinutesAndSeconds: function (minutes, seconds) {

        seconds = (seconds <= 9) ? "0" + seconds : seconds;
        minutes = (minutes <= 9) ? "0" + minutes : minutes;

        this.$el.find("#minutes").html(minutes);
        this.$el.find("#lightBoxMinutes").html(minutes);
        this.$el.find("#seconds").html(seconds);
        this.$el.find("#lightBoxSeconds").html(seconds);
    },
    getMinutes: function () {
        this.timeInMinutes = Math.floor(this.timerStartCount / 60);
        return this.timeInMinutes;
    },
    getSeconds: function () {
        return this.timerStartCount - Math.round(this.timeInMinutes * 60);
    },
    showModalAnswer: function () {
        var modalAnswer = this.model.get('modelAnswer');
        this.$el.find('#modal').show().empty().append(modalAnswer);
        this.disableShowSolutionButtonForDiscussion(true);
    },
    hideModalAnswer: function () {
        this.$el.find('#modal').hide();
    },
    disableShowSolutionButtonForDiscussion: function (state) {
        if (state)this.$el.find("#modalAnswerButton").attr("disabled", true);
        else this.$el.find("#modalAnswerButton").attr("disabled", false);

    },
    disableStartTimerButton: function (state) {
        if (state)this.$el.find("#startTimer").attr("disabled", true);
        else this.$el.find("#startTimer").attr("disabled", false);
    },
    disablePauseTimerButton: function (state) {
        if (state)this.$el.find("#pauseTimer").attr("disabled", true);
        else this.$el.find("#pauseTimer").attr("disabled", false);
    },
    /*Methods for Open Ended Templates ends*/

    /*Methods for MCQ Templates starts*/
    onOptionSelected: function (e) {
        this.disableSubmitButton(false);
        this.disableResetButton(false);
    },
    checkUserOptions: function (event) {
        var selectedId = event.currentTarget.id.split('-')[1];
        if (event.currentTarget.checked) {
            this.userSelectedOption.push(selectedId);
        }
        else {
            var indexOfSelectedId = this.userSelectedOption.indexOf(selectedId);
            this.removeUncheckedOption(this.userSelectedOption, indexOfSelectedId)
        }
    },
    removeUncheckedOption: function (array, index) {
        array.splice(index, 1);
    },
    validateMultiSelectAnswer: function () {

        var correctAnswer = this.model.get('correctAnswer');

        for (var i = 0; i < this.userSelectedOption.length; i++) {
            for (var j = 0; j < correctAnswer.length; j++) {
                if (this.userSelectedOption[i] != correctAnswer[j]) {
                    this.isCorrect = false;
                    this.wrongAnswerCount++;
                }
                else {
                    this.isCorrect = true;
                    this.correctAnswerCount++;
                }
            }
        }

        this.showFeedbackForMultiSelect();
    },
    showFeedbackForMultiSelect: function () {

        var correctAnswer = this.model.get('correctAnswer');

        if (this.attemptCount < this.noOfAllowedAttempts) {

            if (this.correctAnswerCount == correctAnswer.length &&
                this.userSelectedOption.length == correctAnswer.length) {
                this.$el.find("#correct").show();
                this.disableSubmitButton(true);
                this.disableResetButton(true);
            }
            else if (!this.isCorrect && this.correctAnswerCount == 0) {
                this.$el.find("#incorrect").show();
                this.disableResetButton(false);
            }
            else {
                this.$el.find("#partial").show();
            }
        }
        else {
            this.disableResetButton(true);
            if (this.correctAnswerCount == correctAnswer.length &&
                this.userSelectedOption.length == correctAnswer.length) {
                this.$el.find("#finalCorrect").show();
                this.disableSubmitButton(true);
                this.disableResetButton(true);
                this.disableShowSolutionButton(true);
            }
            else if (!this.isCorrect && this.correctAnswerCount == 0) {
                this.$el.find("#finalIncorrect").show();
                this.disableShowSolutionButton(false);
            }
            else {
                this.$el.find("#finalPartial").show();
                this.disableShowSolutionButton(false);
            }
        }
    },
    showSolutionForMultiSelect: function (option) {
        for (var i = 0; i < option.length; i++) {
            if (option[i].isCorrect) {
                var correctSolId = option[i].optionId;
                this.$el.find("#checkbox-" + correctSolId).prop('checked', true);
                this.disableOptions(true);
                this.$el.find(".feedback").hide();
                this.$el.find(".finalFeedback").hide();
                var storeSolution = option[i].optionText;
                this.$el.find('#correctSolution').append(storeSolution + "      ");
            }
        }
    },
    validateSingleSelectAnswer: function () {
        var isCorrect = false;
        var index = this.$el.find('.options').index(this.$el.find('input[name=options]:checked'));
        var option = this.model.get('options');
        isCorrect = option ? option[index].isCorrect : false;
        this.showFeedbackForSingleSelect(isCorrect);
    },
    showFeedbackForSingleSelect: function (isCorrect) {

        if (this.attemptCount < this.noOfAllowedAttempts) {
            if (isCorrect) {
                this.$el.find("#correct").show();
                this.disableSubmitButton(true);
                this.disableResetButton(true);
                this.disableOptions(true);
            } else {
                this.$el.find("#incorrect").show();
                this.disableResetButton(false);
            }

        }
        else {
            if (isCorrect) {
                this.$el.find("#finalCorrect").show();
                this.disableResetButton(true);
                this.disableShowSolutionButton(true);
            }
            else {
                this.$el.find("#finalIncorrect").show();
                this.disableResetButton(true);
                this.disableShowSolutionButton(false);
            }
        }
    },
    showSolutionForSingleSelect: function (option) {

        for (var i = 0; i < option.length; i++) {
            if (option[i].isCorrect) {
                var correctSolId = option[i].optionId;
                var currentForm = this.$el.find('form');
                this.$el.find("#radio" + correctSolId).prop('checked', true);
                this.disableOptions(true);
                this.$el.find(".feedback").hide();
                this.$el.find(".finalFeedback").hide();
                var storeSolution = option[i].optionText;
                this.$el.find('#correctSolution').append(storeSolution + "      ");
            }
        }
    },
    /*Methods for MCQ Templates ends*/

    /*Methods For Fill in the blanks templates starts*/
    onBlurEventOccur: function () {

        this.answerLength = this.model.get('answerText').length;
        for (var i = 0; i < this.answerLength; i++) {
            var j = i + 1;
            if (this.$("#input" + j).val() != "") {
                this.userAnswer[i] = this.$("#input" + j).val();
                //this.disableSubmitButton(false);
                //this.disableResetButton(false);
            }
        }
    },
    validateFillInTheBlanksAnswer: function () {
        var correctAnswers = this.checkAnswer(this.userAnswer);
        if (this.attemptCount != parseInt(this.model.get("config").attempts)) {
            if (correctAnswers == this.userAnswer.length && correctAnswers == this.answerLength) {
                this.$el.find("#correct").show();
                this.disableResetButton(true);
                this.disableInputs(true);
            }
            else if (correctAnswers != 0 && correctAnswers != this.userAnswer.length || correctAnswers == this.userAnswer.length) {
                this.$el.find("#partial").show();
                this.disableResetButton(false);
                this.disableInputs(true);
            }
            else {
                this.$el.find("#incorrect").show();
                this.disableResetButton(false);
                this.disableInputs(true);
            }
            this.disableSubmitButton(true);
        }
        else {
            if (correctAnswers == this.userAnswer.length && correctAnswers == this.answerLength) {
                this.$el.find("#finalCorrect").show();
            }
            else if (correctAnswers != 0 && correctAnswers != this.userAnswer.length || correctAnswers == this.userAnswer.length) {
                this.disableShowSolutionButton(false);
                this.$el.find("#finalPartial").show();
            }
            else {
                this.disableShowSolutionButton(false);
                this.$el.find("#finalIncorrect").show();
            }
            this.disableInputs(true);
            this.disableSubmitButton(true);
            this.disableResetButton(true);
        }

    },
    checkAnswer: function (userAns) {
        var optionalAnswers = [];
        var trueCounter = 0;
        _.each(this.model.get('answerText'), function (answerArray, i) {
            optionalAnswers.push(_.filter(answerArray.answer,function (answer, index) {
                var answerExpected = $.trim(answer.ans);
                var userAnswer = $.trim(userAns[i]);

                if (userAnswer != "") {
                    return userAnswer.toLowerCase() == answerExpected.toLowerCase();
                }

            }, this).length > 0);
        }, this);

        for (var i = 0; i < userAns.length; i++) {
            if (optionalAnswers[i] == true) {
                trueCounter++;
            }
        }
        return trueCounter;
    },
    showSolutionForFillInTheBlanks: function () {
        _.each(this.model.get("answerText"), function (answerText, i) {
            var j = i + 1;            
            this.$el.find("#input" + j).val(answerText.answer[0].ans);
        }, this);
        this.$el.find(".finalFeedback").hide();
        this.disableShowSolutionButton(true);
    },
    /*Methods For Fill in the blanks templates ends*/


    /*Methods For Hot Spot templates starts*/
    onHotSpotSelected: function (evt) {
        if (this.$el.find(".options").hasClass("disabled")) return;
        var $element = $(evt.currentTarget);
        var currentId = $element.attr('id');
        console.log(currentId);
        this.isHotSpotSequential = this.model.get("config").isHotSpotSequential;
        this.isHotSpotMultiSelect = this.model.get("config").isHotSpotMultiSelect;
        if (this.isHotSpotSequential == true) {
            $element.css("border", "4px green solid");
            $element.addClass("selected");
            if (!this.$el.find('#' + currentId).hasClass("sequentialClass")) {
                this.$el.find('#' + currentId).addClass("sequentialClass");
            }
            var dropAreas = this.$el.find(".sequentialClass");
           if(dropAreas.length == this.model.get('options').length)
           {
               this.disableSubmitButton(false);
           }

            var id = evt.currentTarget.id;
            id = id.substring(11, 10);
            var optionSelected = _.filter(this.model.get("options"), function (item, index) {
                return item.id == id;
            });
            if (optionSelected != undefined) {
                if ($.inArray(optionSelected[0].order, this.optionsList) == -1) {
                    this.optionsList[this.count] = optionSelected[0].order;
                    this.count++;
                }
            }
        }
        else {
            if (this.isHotSpotMultiSelect == true) {
                if ($element.hasClass("selected")) {
                    $element.css("border", "none");
                    $element.removeClass("selected");
                }
                else {
                    $element.css("border", "4px green solid");
                    $element.addClass("selected");
                }

            }
            else {
                if (this.$el.find('.options').hasClass("selected")) {
                    this.$el.find('.options').removeClass("selected");
                }
                this.$el.find('.options').css("border", "none");
                //$element.css("border", "4px green solid");
                $element.addClass("selected");

            }

            this.disableSubmitButton(false);
            this.disableResetButton(false);
        }
    },
    validateAnswerForHotSpot: function () {
        this.allOptions = this.model.get("options");
        if (this.isHotSpotSequential) {
            var answer = this.checkAnswersForSequentialHotSpot(this.optionsList);
            this.showFeedbackForSequentialHotSpot(answer)
        }
        else {
            var correctCount = _.filter(this.$el.find('.options'), function (element, index) {
                return $(element).hasClass("selected");
            }, this);
            var totalCorrectCount = _.filter(this.model.get('options'), function (option, index) {
                return option.isCorrect;
            }, this);
            var count = this.getTotalCorrectAnswers(correctCount, totalCorrectCount);

            if (this.isHotSpotMultiSelect) {
                this.showFeedbackForNonSequentialMultiSelectHotSpot(count, totalCorrectCount, correctCount);
            }
            else {
                this.showFeedbackForNonSequentialSingleSelectHotSpot(count, totalCorrectCount);
            }

        }
        this.disableOptionsSequential(true);
        this.disableSubmitButton(true);
    },
    checkAnswersForSequentialHotSpot: function (userAns) {
        var correctAnswers = _.filter(this.model.get('options'),function (answer, i) {
            return userAns[i] == answer.id;
        }, this).length;

        return correctAnswers;
    },
    showFeedbackForSequentialHotSpot: function (answer) {
        if (this.attemptCount != this.noOfAllowedAttempts) {
            if (answer == 0) {
                this.$el.find("#incorrect").show();
                this.disableResetButton(false);
            }
            else if (answer > 0 && answer < this.allOptions.length) {
                this.$el.find("#partial").show();
                this.disableResetButton(false);
            }
            else {
                this.$el.find("#correct").show();
            }
        }
        else {
            if (answer == 0) {
                this.$el.find("#finalIncorrect").show();
                this.disableShowSolutionButton(false);
            }
            else if (answer > 0 && answer < this.allOptions.length) {
                this.$el.find("#finalPartial").show();
                this.disableShowSolutionButton(false);
            }
            else {
                this.$el.find("#finalCorrect").show();
            }
        }
    },
    getTotalCorrectAnswers: function (userAns, totalCorrectAns) {
        var counter = 0;
        for (var i = 0; i < userAns.length; i++) {
            for (var j = 0; j < totalCorrectAns.length; j++) {
                var userId = userAns[i].id;
                userId = userId.substring(17, 14);
                if (userId == totalCorrectAns[j].id) {
                    counter++;
                }
            }
        }
        return counter;
    },
    showFeedbackForNonSequentialMultiSelectHotSpot: function (count, totalCorrectCount, correctCount) {

        if (this.attemptCount != this.noOfAllowedAttempts) {
            if (count == totalCorrectCount.length && correctCount.length == totalCorrectCount.length) {
                this.$el.find("#correct").show();
            }
            else if (count < totalCorrectCount.length && count != 0) {
                this.$el.find("#partial").show();
                this.disableResetButton(false);
            }
            else {
                this.$el.find("#incorrect").show();
                this.disableResetButton(false);
            }
        }
        else {
            if (count == totalCorrectCount.length && correctCount.length == totalCorrectCount.length) {
                this.$el.find("#finalCorrect").show();
            }
            else if (count < totalCorrectCount.length && count != 0) {
                this.$el.find("#finalPartial").show();
                this.disableResetButton(true);
                this.disableShowSolutionButton(false);
            }
            else {
                this.$el.find("#finalIncorrect").show();
                this.disableResetButton(true);
                this.disableShowSolutionButton(false);
            }
        }
    },
    showFeedbackForNonSequentialSingleSelectHotSpot: function (count, totalCorrectCount) {

        if (this.attemptCount != this.noOfAllowedAttempts) {
            if (count == totalCorrectCount.length) {
                this.$el.find("#correct").show();
            }
            else {
                this.$el.find("#incorrect").show();
                this.disableResetButton(false);
            }
        }
        else {
            if (count == totalCorrectCount.length) {
                this.$el.find("#finalCorrect").show();
            }
            else {
                this.$el.find("#finalIncorrect").show();
                this.disableResetButton(true);
                this.disableShowSolutionButton(false);
            }
        }
    },
    /*Methods For Hot Spot templates ends*/



    /*Methods for Drag Drop Templates Starts*/

    setOriginalPositionOfDraggables: function (draggableRef) {
        var noOfDraggables = this.$el.find(".dragOptions").length;
        this.draggablesOriginalPosition = [];
        for (var i = 1; i <= noOfDraggables; i++) {
            var position = this.$el.find(draggableRef + i).position();
            this.draggablesOriginalPosition.push({
                'index': i, 'position': position
            });
        }
    },
    onMouseDown: function (evt) {

        if (evt && evt.preventDefault) evt.preventDefault();
        var $element = $(evt.currentTarget);

        if ($element.hasClass('dragClass'))return;

        if (this.model.get("config").isDragDrop || this.model.get('config').isBucketDragDrop) {
            if (this.answerSubmitted == true) return;
        }

        this.isDragging = true;
        this.currentDraggableId = evt.currentTarget.id;

        this.orgPos = this.$el.find("#" + this.currentDraggableId).position();
        this.parentPos = this.$el.find("#" + this.currentDraggableId).parent().position();
        //var parent = this.$el.find("#"+this.currentDraggableId).parents("#MainContainer3");
        this.parentSize = {width: this.$el.find("#" + this.currentDraggableId).parent().width(), height: this.$el.find("#" + this.currentDraggableId).parent().height()};
        //this.parentSize = {width:parent.width(), height:parent.height()};
        this.dragObjectSize = {width: this.$el.find("#" + this.currentDraggableId).width(), height: this.$el.find("#" + this.currentDraggableId).height()}

        this.orgleft = this.orgPos.left;
        this.orgtop = this.orgPos.top;

        this.diffX = (evt.pageX - this.orgleft);
        this.diffY = (evt.pageY - this.orgtop);

        if (this.model.get('config').isBucketDragDrop) {

            var splitBucketId = this.currentDraggableId.split("-")[1];
            this.bucketPosition[splitBucketId] = this.orgPos;
            var parentId = this.$el.find("#" + this.currentDraggableId).parent().attr('id');
            this.$el.find("#" + parentId).on('mousemove', _.bind(this.onMouseMove, this));
            this.$el.find("#" + parentId).on('mouseup', _.bind(this.onMouseUp, this));
        }
        if (this.model.get('config').isDragDrop) {
            var parentId = this.$el.find("#" + this.currentDraggableId).parent().attr('id');
            this.$el.find("#" + parentId).on('mousemove', _.bind(this.onMouseMove, this));
            this.$el.find("#" + parentId).on('mouseup', _.bind(this.onMouseUp, this));
        }

    },
    onMouseMove: function (e) {

        e.preventDefault();

        var pageX, pageY;
        if (this.isDragging) {
            pageX = e.pageX;
            pageY = e.pageY;
        }

        var left = (pageX - this.diffX) + this.parentPos.left;
        var top = (pageY - this.diffY);

        if (left < this.parentPos.left) {
            left = this.parentPos.left;
        }
        if (top < this.parentPos.top) {
            top = this.parentPos.top;
        }

        if ((left + this.dragObjectSize.width) > (this.parentPos.left + this.parentSize.width)) {
            left = (this.parentPos.left + this.parentSize.width) - this.dragObjectSize.width - 20;
        }

        if ((top + this.dragObjectSize.height) > (this.parentPos.top + this.parentSize.height)) {
            top = (this.parentPos.top + this.parentSize.height) - this.dragObjectSize.height - 10;
        }
        this.snapToPosition({left: left, top: top});
    },

    snapToPosition: function (position) {
        this.setStackOrder();
        this.$el.find("#" + this.currentDraggableId).css('left', position.left);
        this.$el.find("#" + this.currentDraggableId).css('top', position.top);

    },

    snapToPositionForBucketDragDrop: function (position, $dropArea) {

        for (var i = 0; i < this.bucketArray.length; i++) {
            this.bucketArray[i].counter = 1;
        }

        var bucketId = $dropArea.attr('id');
        var droppedId = bucketId.split("-")[1];
        var currentDraggableId = this.currentDraggableId.split("-")[1];

        for (var key in this.totalElementsInBucket) {
            for (var i = 0; i < this.bucketArray.length; i++) {
                if (this.totalElementsInBucket[key] == this.bucketArray[i].id) {
                    this.bucketArray[i].counter++;
                }
                if (currentDraggableId == key && droppedId == this.totalElementsInBucket[key]) {
                    if (this.totalElementsInBucket[key] == this.bucketArray[i].id) this.bucketArray[i].counter--;
                }
            }
        }

        this.totalElementsInBucket[currentDraggableId] = droppedId;
        this.getPositionForDraggables(currentDraggableId);
        this.pushDataInBucketArray(droppedId, currentDraggableId, bucketId);
        this.bucketGoToHomePositionArray[this.currentDraggableId] = {dragId: this.currentDraggableId, dropId: $dropArea.attr('id')};
    },//anisha changes

    getPositionForDraggables: function (currentDraggableId) {

        var temp = false;
        var elementToRemove;

        for (var i = 0; i < this.bucketArray.length; i++) {
            var bucketArray = this.bucketArray[i].bucketArrayData;
            for (var key in bucketArray) {
                if (temp) {
                    var currentHeight = this.$el.find("#bucketDraggables-" + bucketArray[key]).height();
                    var currentPosition = this.$el.find("#bucketDraggables-" + bucketArray[key]).position();
                    var offsetTop = currentPosition.top + currentHeight + this.dragMargin;
                    this.$el.find("#bucketDraggables-" + bucketArray[key]).css('top', offsetTop);
                }
                if (bucketArray[key] == currentDraggableId) {
                    elementToRemove = key;
                    temp = true;
                }
            }
            if (elementToRemove)this.bucketArray[i].bucketArrayData.splice(elementToRemove, 1);
            temp = false;
            elementToRemove = null;

        }
    },//anisha changes
    pushDataInBucketArray: function (droppedId, currentDraggableId, bucketId) {

        var bucketLength = this.model.get("bucketData").length;
        var bucketCounter , leftOffset, topOffset;
        for (var i = 0; i < bucketLength; i++) {

            if(this.model.get('config').isFixedDragDrop){
                if(droppedId == this.model.get("bucketData")[i].id && !this.bucketArray[i].isBucketLimitReached && this.bucketArray[i].bucketArrayData.length < this.model.get("bucketData")[i].bucketLimit ){
                    this.bucketArray[i].bucketArrayData.push(currentDraggableId);
                    bucketCounter = this.bucketArray[i].counter;
                }
                else if(this.bucketArray[i].bucketArrayData.length >= this.model.get("bucketData")[i].bucketLimit){
                    this.bucketArray[i].isBucketLimitReached = true;
                    this.bucketArray[i].bucketArrayData.pop();
                }
            }else{
                if (droppedId == this.model.get("bucketData")[i].id) {

                    console.log(this.bucketArray[i])
                    this.bucketArray[i].bucketArrayData.push(currentDraggableId);
                    bucketCounter = this.bucketArray[i].counter;
                }
            }
        }

        if (bucketCounter <= 1) {
            leftOffset = (this.$el.find("#" + bucketId).position().left) + (this.$el.find("#" + bucketId).width() - this.$el.find("#" + this.currentDraggableId).width()) / 2;
            topOffset = ((this.$el.find("#" + bucketId).height()) + (this.$el.find("#" + bucketId).position().top) - (this.$el.find("#" + this.currentDraggableId).height())) - this.dragMargin;
        }
        else {
            leftOffset = (this.$el.find("#" + bucketId).position().left) + (this.$el.find("#" + bucketId).width() - this.$el.find("#" + this.currentDraggableId).width()) / 2;
            topOffset = ((this.$el.find("#" + bucketId).height()) + (this.$el.find("#" + bucketId).position().top) - ((this.$el.find("#" + this.currentDraggableId).height()) * bucketCounter)) - (this.dragMargin * bucketCounter);
        }
        this.$el.find("#" + this.currentDraggableId).css('left', leftOffset);
        this.$el.find("#" + this.currentDraggableId).css('top', topOffset);


    },//anisha changes

    onMouseUp: function (e) {

        e.preventDefault();
        if (this.isDragging) {
            this.isDragging = false;
            if (this.model.get('config').isBucketDragDrop) {
                this.onBucketDragDropMouseUp();
            }
            if (this.model.get('config').isDragDrop) {
                this.onNonBucketDragDropMouseUp();
            }
        }
    },
    onBucketDragDropMouseUp: function () {

        var $self = this;
        var $dropArea = null;
        this.$el.find('.dropBucketOptions').each(function () {
            var $target = $(this);
            if ($self.hitTest($target)) {
                $dropArea = $target;
            }
        });

        if ($dropArea != null) {
            var bucketDropAreaId = $dropArea.attr('id').split("-")[1];
            this.bucketAssociativeArray[this.currentDraggableId] = bucketDropAreaId;

        }
        this.onDrop($dropArea);

    },
    onNonBucketDragDropMouseUp: function () {
        var $self = this;
        var $dropArea = null;
        this.$el.find('.dropOptions').each(function () {
            var $target = $(this);
            if ($self.hitTest($target)) {
                $dropArea = $target;
            }
        });
        this.onDrop($dropArea);
    },

    onDrop: function ($dropArea) {

        if (this.model.get('config').isBucketDragDrop ) {
            this.onDropOfBucketDragDrop($dropArea);
        }
        if (this.model.get('config').isDragDrop) {
            this.onDropOfNonBucketDragDrop($dropArea);
        }
        if (this.model.get('config').isBucketSingleDragDrop ) {
            this.onDropOfBucketDragDrop($dropArea);
        }

    },
    onDropOfBucketDragDrop: function ($dropArea) {

        if ($dropArea == null) {
            this.goToHomePosition();
        }
        else {
            if($dropArea.hasClass("dropClass")) {
                $dropArea.removeClass("dropClass");
            }else {
                $dropArea.addClass("dropClass");
            }
            this.snapToBucketObject($dropArea);

            if (!this.$el.find('#' + this.currentDraggableId).hasClass("dragClass")) {
                this.$el.find('#' + this.currentDraggableId).addClass("dragClass").css("cursor", 'default');
            }
            for(var i = 1;i<=this.model.get("draggables").length;i++)
            {
                if (!this.$el.find('#bucketDraggables-' + i).hasClass("disabled")) {
                    this.$el.find('#bucketDraggables-' + i).addClass("disabled");
                }
            }
            var droppedId = $dropArea.attr("id").split('-')[1];
            for (var i = 0; i < this.model.get("bucketData").length; i++) {
                if (this.model.get("bucketData")[i].bucketLimit != "") {
                    if(droppedId == this.bucketArray[i].id){
                        if (this.bucketArray[i].isBucketLimitReached == true) {
                            this.goToHomePosition();
                        }
                    }
                }
            }

            var dropAreas =this.$el.find(".dragClass");
            if (this.model.get('config').isBucketSingleDragDrop){
                if(dropAreas.length>0)this.disableSubmitButton(false);
            }//anisha changes
            else if(this.model.get('config').isFixedDragDrop){
                if(dropAreas.length == this.model.get('config').totalLimitOfBucket )
                    this.disableSubmitButton(false);
            }//anisha changes
            else if(this.model.get('config').isBucketDragDrop){
                this.totalDraggables = this.model.get("draggables").length;
                if (dropAreas.length == this.totalDraggables) {
                    this.disableSubmitButton(false);
                } else {
                    this.disableSubmitButton(true);
                }
            }
            this.disableResetButton(false);
        }

    },
    onDropOfNonBucketDragDrop: function ($dropArea) {

        if ($dropArea == null) {
            this.goToHomePosition();
            this.checkAssociativeArray[this.currentDraggableId] = "undefined";
        }
        else {
            if ($dropArea.attr('isempty') == 'true') {
                var dropAreaId = $dropArea.attr('id');
                if (!this.$el.find('#' + dropAreaId).hasClass("dropClass")) {
                    this.$el.find('#' + dropAreaId).addClass("dropClass");
                }
                this.snapToObject($dropArea);
            }
            else {
                this.goToHomePosition();
                this.checkAssociativeArray[this.currentDraggableId] = "undefined";
            }
        }

        this.totalDraggables = this.model.get("dropArea").length;
        var dropAreas = this.$el.find(".dropClass");
        if (dropAreas.length == this.totalDraggables) {
            this.disableSubmitButton(false);
            //this.disableResetButton(false);
        }else if(dropAreas.length==0){
            this.disableResetButton(true);
        }else {
            this.disableSubmitButton(true);
            this.disableResetButton(false);
        }
    },

    snapToBucketObject: function ($dropArea) {
        this.bucketObjectPosition = $dropArea.position();
        var currentDraggableId = this.currentDraggableId.split("-")[1];
        var droppedOn = $dropArea.attr('id');
        var droppedId = droppedOn.split("-")[1];
        this.checkAssociativeArray[currentDraggableId] = droppedId;
        this.snapToPositionForBucketDragDrop({left: this.bucketObjectPosition.left, top: this.bucketObjectPosition.top}, $dropArea);
    },
    snapToObject: function ($dropArea) {

        var position = $dropArea.position();
        this.snapToPosition({left: position.left, top: position.top});
        this.isDropped = true;
        this.droppedOn = $dropArea.attr('id');
        if (this.checkAssociativeArray[this.currentDraggableId] != undefined) {
            var length = Object.keys(this.checkAssociativeArray).length;
            if (this.checkAssociativeArray[this.currentDraggableId].droppedOn != $dropArea) {
                var droppedId = this.checkAssociativeArray[this.currentDraggableId].droppedOn;
                this.$el.find("#" + droppedId).attr('isempty', 'true').removeClass("dropClass");
            }
        }

        this.setAssociativeArray(this.currentDraggableId, $dropArea);
        var droppedId = this.checkAssociativeArray[this.currentDraggableId].droppedOn;

        if (this.$el.find("#" + droppedId).hasClass("dropClass")) {
            this.$el.find("#" + droppedId).attr('isempty', 'false');
        }else {
            this.$el.find("#" + droppedId).attr('isempty', 'false').addClass("dropClass");
        }
    },

    setAssociativeArray: function ($currentDraggableId, $dropArea) {

        var dropId = $dropArea.attr('id');
        var checkDropId = dropId.substring(5, 4);
        this.checkAssociativeArray[$currentDraggableId] = {
            'draggable': $currentDraggableId, 'droppedOn': dropId
        };

    },
    hitTest: function ($target) {

        var targetPos = $target.position();
        var getObjectPos = this.$el.find("#" + this.currentDraggableId).position();
        var tar = targetPos.top;

        var srcLeft = getObjectPos.left;
        var srcRight = getObjectPos.left + (this.$el.find("#" + this.currentDraggableId).width());
        var srcTop = getObjectPos.top;
        var srcBottom = getObjectPos.top + (this.$el.find("#" + this.currentDraggableId).height());

        var targetLeft = targetPos.left;
        var targetRight = targetPos.left + $target.width();
        var targetTop = targetPos.top;
        var targetBottom = targetPos.top + $target.height();


        return !( targetLeft > srcRight
            || targetRight < srcLeft
            || targetTop > srcBottom
            || targetBottom < srcTop
            );
    },

    goToHomePositionOnResetClick: function () {

        if (this.model.get('config').isBucketDragDrop) {

            $(".drag").css("cursor", "pointer");
            for (var i = 0; i < this.draggablesOriginalPosition.length; i++) {
                var position = this.draggablesOriginalPosition[i].position;
                var $self = this;
                var index = (i + 1);
                this.$el.find("#bucketDraggables-" + index).animate({
                    left: position.left,
                    top: position.top
                }, 600);
            }
            for (var i = 1; i <= this.model.get('draggables').length; i++) {
                if (this.$el.find("#bucketDraggables-" + i).hasClass("dragClass")) {
                    this.$el.find("#bucketDraggables-" + i).removeClass("dragClass");
                }
            }
            for (var i = 1; i <= this.model.get('draggables').length; i++) {
                if (this.$el.find("#bucketDraggables-" + i).hasClass("disabled")) {
                    this.$el.find("#bucketDraggables-" + i).removeClass("disabled");
                }
            }
            for (var i = 0; i < this.bucketArray.length; i++) {
                this.bucketArray[i].bucketArrayData = [];
                this.bucketArray[i].counter = 1;
            }
        }
        if (this.model.get('config').isDragDrop) {
            for (var i = 0; i < this.draggablesOriginalPosition.length; i++) {
                var index = (i + 1);
                var position = this.draggablesOriginalPosition[i].position;
                var $self = this;
                this.$el.find("#drag-" + index).animate({
                    left: position.left,
                    top: position.top
                }, 600, function () {
                    $self.resetStackOrder();
                });
            }

            var length = this.model.get("draggables").length;
            for (i = 1; i <= length; i++) {
                if (this.checkAssociativeArray["drag-" + i] != undefined) {
                    var droppedOn = this.checkAssociativeArray["drag-" + i].droppedOn;
                    this.$el.find("#" + droppedOn).attr('isempty', 'true').removeClass("dropClass");
                }
            }
        }

        this.disableResetButton(true);

    },
    goToHomePosition: function () {

        if (this.model.get('config').isBucketDragDrop) {
            this.goToHomePositionForBucketDragDrop();
        }
        if (this.model.get('config').isDragDrop) {
            this.goToHomePositionForNonBucketDragDrop();
        }

    },
    goToHomePositionForBucketDragDrop:function(){

        var currentDraggableId = this.currentDraggableId.split("-")[1];
        if(this.bucketGoToHomePositionArray[this.currentDraggableId]!="undefined" && this.bucketGoToHomePositionArray.length>0){

            var bucketId = this.bucketGoToHomePositionArray[this.currentDraggableId].dropId;
            var droppedId = bucketId.split("-")[1];

            var dropKey = droppedId-1;
            for(var i=0;i<this.bucketArray.length;i++){
                this.bucketArray[i].counter = 1;
            }

            if(!this.$el.find("#"+this.currentDraggableId).hasClass(bucketId)){
                this.$el.find("#"+this.currentDraggableId).addClass(bucketId);
            }

            for(var key in this.totalElementsInBucket){
                var dropKey = droppedId-1;
                if(this.totalElementsInBucket[key] == droppedId)this.bucketArray[dropKey].counter++;
            }

            this.getPositionForDraggables(currentDraggableId);
        }

        var position = this.draggablesOriginalPosition[currentDraggableId-1].position;
        var $self = this;
        this.$el.find("#bucketDraggables-"+currentDraggableId).animate({
            left: position.left,
            top: position.top
        },400);

        if(this.$el.find("#bucketDraggables-"+currentDraggableId).hasClass("dragClass")){
            this.$el.find("#bucketDraggables-"+currentDraggableId).removeClass("dragClass");
        }
    },
    goToHomePositionForNonBucketDragDrop: function () {
        var currentDraggableId = this.currentDraggableId.split('-')[1];
        var position = this.draggablesOriginalPosition[currentDraggableId - 1].position;

        var $self = this;
        this.$el.find("#drag-" + currentDraggableId).animate({
            left: position.left,
            top: position.top
        }, 600, function () {
            $self.resetStackOrder();
        });
        if (this.checkAssociativeArray[this.currentDraggableId] != undefined) {
            var droppedId = this.checkAssociativeArray[this.currentDraggableId].droppedOn;
            this.$el.find("#" + droppedId).attr('isempty', 'true').removeClass("dropClass");
        }
        this.isDropped = false;
       /* var dropAreas = this.$el.find(".dropClass").length;
        console.log("dropareas : " +dropAreas);
        this.disableResetButton(true);*/

    },


    validateAnswersForDragDrop: function () {
        this.answerSubmitted = true;
        var optionSelected = this.validateAnswers();
        this.showFeedbackForDragDrop(optionSelected);
    },
    validateAnswersForBucketDragDrop: function () {
        this.answerSubmitted = true;
        var optionSelected = this.validateAnswers();
        if (this.model.get('config').isBucketSingleDragDrop) {
            this.showFeedbackForBucketSingleDragDrop(optionSelected);
        }else {
            this.showFeedbackForBucketDragDrop(optionSelected);
        }
    },
    validateAnswers: function () {

        if (this.model.get('config').isBucketDragDrop) {
            var optionSelected = _.filter(this.model.get("draggables"), function (item, index) {
                var i = index + 1;
                var dragId = "bucketDraggables-" + i;
                return item.targetArea == this.bucketAssociativeArray[dragId];
            }, this);
        }
        if (this.model.get('config').isDragDrop) {
            var optionSelected = _.filter(this.model.get("draggables"), function (item, index) {
                var i = index + 1;
                var dragId = "drag-" + i;
                if (this.checkAssociativeArray[dragId]) {
                    var dropArea = this.checkAssociativeArray[dragId].droppedOn.substring(5, 4);
                }
                return item.targetArea == dropArea;
            }, this);
        }
        return optionSelected;
    },

    showFeedbackForDragDrop: function (optionSelected) {
        if (this.attemptCount < this.noOfAllowedAttempts || this.noOfAllowedAttempts==1) {
            if (optionSelected.length == 0) {
                this.disableResetButton(false);
                this.$el.find('#incorrect').show();

            }
            else if (optionSelected.length < this.model.get('dropArea').length) {
                this.disableResetButton(false);
                this.$el.find("#partial").show();
            }
            else {
                this.disableResetButton(true);
                this.$el.find("#correct").show();
                this.disableSubmitButton(true);
            }
        }
        else {
            if (optionSelected.length == 0) {
                this.$el.find('#finalIncorrect').show();
                this.disableResetButton(true);
                this.disableShowSolutionButton(false);
                this.disableSubmitButton(true);
            }
            else if (optionSelected.length < this.model.get('dropArea').length) {
                this.$el.find("#finalPartial").show();
                this.disableShowSolutionButton(false);
                this.disableResetButton(true);
                this.disableSubmitButton(true);
            }
            else {
                this.disableResetButton(true);
                this.$el.find("#finalCorrect").show();
                this.disableSubmitButton(true);
            }
        }
        this.disableSubmitButton(true);
    },
    showFeedbackForBucketDragDrop: function (optionSelected) {
        if(this.model.get('config').isFixedDragDrop){
            this.showFeedbackForFixedDragDrop(optionSelected);
        }
        else if(this.model.get('config').isBucketDragDrop){

            if (this.attemptCount < this.noOfAllowedAttempts || this.noOfAllowedAttempts==1) {
                if (optionSelected.length == 0) {
                    this.disableResetButton(false);
                    this.$el.find('#incorrect').show();
                    this.highlightOptionsForBucketDragDrop(optionSelected);
                }else if (optionSelected.length < this.model.get('draggables').length) {
                    this.disableResetButton(false);
                    this.$el.find("#partial").show();
                    this.highlightOptionsForBucketDragDrop(optionSelected);
                }else {
                    this.disableResetButton(true);
                    this.$el.find("#correct").show();
                    this.disableSubmitButton(true);
                    this.highlightOptionsForBucketDragDrop(optionSelected);
                }
            }
            else {
                if (optionSelected.length == 0) {
                    this.$el.find('#finalIncorrect').show();
                    this.disableResetButton(true);
                    this.disableShowSolutionButton(false);
                    this.disableSubmitButton(true);
                    this.highlightOptionsForBucketDragDrop(optionSelected);
                }else if (optionSelected.length < this.model.get('draggables').length) {
                    this.$el.find("#finalPartial").show();
                    this.disableShowSolutionButton(false);
                    this.disableResetButton(true);
                    this.disableSubmitButton(true);
                    this.highlightOptionsForBucketDragDrop(optionSelected);
                }else {
                    this.disableResetButton(true);
                    this.$el.find("#finalCorrect").show();
                    this.disableSubmitButton(true);
                    this.highlightOptionsForBucketDragDrop(optionSelected);
                }
            }
            this.disableSubmitButton(true);
        }
    },
    //changes by preeti
    showFeedbackForBucketSingleDragDrop: function (optionSelected) {

        var noOfDraggable = Object.keys(this.bucketAssociativeArray).length;
        if (this.attemptCount < this.noOfAllowedAttempts || this.noOfAllowedAttempts==1) {
            if (optionSelected.length == 0) {
                this.disableResetButton(false);
                this.$el.find('#incorrect').show();
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }else if (optionSelected.length < this.model.get('config').bucketCorrectAnsLength || noOfDraggable != optionSelected.length) {
                this.disableResetButton(false);
                this.$el.find("#partial").show();
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }else {
                this.disableResetButton(true);
                this.$el.find("#correct").show();
                this.disableSubmitButton(true);
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }
        }
        else {
            if (optionSelected.length == 0) {
                this.$el.find('#finalIncorrect').show();
                this.disableResetButton(true);
                this.disableShowSolutionButton(false);
                this.disableSubmitButton(true);
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }else if (optionSelected.length < this.model.get('config').bucketCorrectAnsLength || noOfDraggable != optionSelected.length) {
                this.$el.find("#finalPartial").show();
                this.disableShowSolutionButton(false);
                this.disableResetButton(true);
                this.disableSubmitButton(true);
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }else {
                this.disableResetButton(true);
                this.$el.find("#finalCorrect").show();
                this.disableSubmitButton(true);
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }
        }
        this.disableSubmitButton(true);
    },
    //end of changes by preeti

    showFeedbackForFixedDragDrop : function(optionSelected){

        if (this.attemptCount < this.noOfAllowedAttempts || this.noOfAllowedAttempts==1) {

            if (optionSelected.length == 0) {
                this.disableResetButton(false);
                this.$el.find('#incorrect').show();
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }
            else if (optionSelected.length < this.model.get('config').totalLimitOfBucket) {
                this.disableResetButton(false);
                this.$el.find("#partial").show();
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }
            else {
                this.disableResetButton(true);
                this.$el.find("#correct").show();
                this.disableSubmitButton(true);
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }
        }
        else {
            if (optionSelected.length == 0) {
                this.$el.find('#finalIncorrect').show();
                this.disableResetButton(true);
                this.disableShowSolutionButton(false);
                this.disableSubmitButton(true);
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }
            else if (optionSelected.length < this.model.get('config').totalLimitOfBucket) {
                this.$el.find("#finalPartial").show();
                this.disableShowSolutionButton(false);
                this.disableResetButton(true);
                this.disableSubmitButton(true);
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }
            else {
                this.disableResetButton(true);
                this.$el.find("#finalCorrect").show();
                this.disableSubmitButton(true);
                this.highlightOptionsForBucketDragDrop(optionSelected);
            }
        }
        this.disableSubmitButton(true);

    },
    highlightOptionsForBucketDragDrop: function (optionSelected) {

        var tempArray = [];

        if (optionSelected.length != 0) {

            for (var i = 0; i < optionSelected.length; i++) {
                var id = optionSelected[i].id;
                tempArray[i] = id;
                this.$el.find("#bucketDraggables-" + id).css("border", "5px solid green");
            }

            var arr = [];
            for (var i = 0; i < this.model.get('draggables').length; i++) {
                arr[i] = this.model.get('draggables')[i].id;
            }
            for (var i = 0; i < arr.length; i++) {

                for (var j = 0; j < tempArray.length; j++) {
                    if (arr[i] == tempArray[j]) {
                        arr.splice(i, 1);
                    }
                }
            }
            for (var j = 0; j < arr.length; j++) {
                this.$el.find("#bucketDraggables-" + (arr[j])).css("border", "5px solid red");
            }

        }
        else {
            for (var i = 1; i <= this.model.get('draggables').length; i++) {
                this.$el.find("#bucketDraggables-" + i).css("border", "2px solid red");
            }
        }

    },

    showSolutionForDragDrop: function () {

        var draggables = this.model.get("draggables");
        var dropAreaPositions = [];

        if (this.model.get('draggables').length != this.model.get('dropArea').length) {
            this.goToHomePositionOnResetClick();
        }
        for (var i = 0; i < draggables.length; i++) {
            var dragId = draggables[i].id;
            var targetDropArea = draggables[i].targetArea;
            var targetDropAreaPosition = this.$el.find("#drop" + targetDropArea).position();
            if (targetDropAreaPosition != undefined) {
                dropAreaPositions.push(targetDropAreaPosition);
            }
        }
        for (var i = 0; i < dropAreaPositions.length; i++) {
            var index = i + 1;
            this.$el.find("#drag-" + index).animate({
                top: dropAreaPositions[i].top,
                left: dropAreaPositions[i].left
            }, 600);
        }
    },


//changes by preeti
    showSolutionForBucketDragDrop: function () {

        this.goToHomePositionOnResetClick();
        if (this.model.get('config').isBucketSingleDragDrop) {
            this.showSolutionForBucketSingleDragDrop();
            this.answerSubmitted = true;
        }

        if (this.model.get('config').isFixedDragDrop) {
            this.showSolutionForFixedDragDrop();
            this.answerSubmitted = true;
        }
        else{

            this.$el.find('.dragOptions').css('border', 'none');
            this.$el.find(".dragBucketOptions").css('z-index', 1000);
            this.disableShowSolutionButton(true);
            var dragBucketItem = this.model.get("draggables");
            var dropBucketItems = this.model.get("bucketData");
            var leftBucket = 0;
            var topBucket = 0;
            var counter = 0, dropPosition;

            var bucketCounter = 1;
            for (key in this.showSolutionArray){
                var bucketCounter = 1;
                if (this.showSolutionArray[key] != "undefined") {

                    for(var i=0;i<this.showSolutionArray[key].length;i++){
                        var dragId = this.showSolutionArray[key][i].item.id;
                        var targetPosition = this.showSolutionArray[key][i].item.targetArea;
                        dropPosition = this.$el.find("#bucketDropArea-" + targetPosition).position();
                        leftBucket = (this.$el.find("#bucketDropArea-" + targetPosition).position().left) + (this.$el.find("#bucketDropArea-" +targetPosition).width() - this.$el.find("#bucketDraggables-" + dragId).width()) / 2;
                        topBucket=((this.$el.find("#bucketDropArea-" + targetPosition).height()) + (this.$el.find("#bucketDropArea-" + targetPosition).position().top) - ((this.$el.find("#bucketDraggables-" + dragId).height()) * bucketCounter)) - (this.dragMargin * bucketCounter);

                        this.$el.find("#bucketDraggables-" + dragId).animate({
                            top: topBucket,
                            left: leftBucket
                        }, 600);
                        bucketCounter++;
                    }
                }
            }
        }

    },
    //new method added by preeti
    showSolutionForBucketSingleDragDrop: function () {

        this.goToHomePositionOnResetClick();
        this.$el.find('.dragOptions').css('border', 'none');
        this.$el.find(".dragBucketOptions").css('z-index', 1000);
        this.disableShowSolutionButton(true);
        var dragBucketItem = this.model.get("draggables");
        var dropBucketItems = this.model.get("bucketData");

        var leftBucket = 0;
        var topBucket = 0;
        var counter = 1, dropPosition;

        for (var i = 1; i <= dropBucketItems.length; i++) {
            counter = 1;

            for (var j = 0; j < this.model.get('config').bucketCorrectAnsLength; j++) {

                if (this.showSolutionArray[i][j] != "undefined") {
                    var dragId = this.showSolutionArray[i][j].item.id;
                    var targetPosition = this.showSolutionArray[i][j].item.targetArea;
                    dropPosition = this.$el.find("#bucketDropArea-" + targetPosition).position();
                    leftBucket = (this.$el.find("#bucketDropArea-" + targetPosition).position().left) + (this.$el.find("#bucketDropArea-" + targetPosition).width() - this.$el.find("#bucketDraggables-" + dragId).width()) / 2;
                    topBucket=((this.$el.find("#bucketDropArea-" + targetPosition).height()) + (this.$el.find("#bucketDropArea-" + targetPosition).position().top) - ((this.$el.find("#bucketDraggables-" + dragId).height()) * counter)) - (this.dragMargin * counter);
                    this.$el.find("#bucketDraggables-" + dragId).animate({
                        top: topBucket,
                        left: leftBucket
                    }, 600);
                    counter++;
                }
            }
        }
    },

    showSolutionForFixedDragDrop : function(){

        this.goToHomePositionOnResetClick();
        this.$el.find('.dragOptions').css('border', 'none');
        this.$el.find(".dragBucketOptions").css('z-index', 1000);

        this.disableShowSolutionButton(true);

        var dragBucketItem = this.model.get("draggables");
        var dropBucketItems = this.model.get("bucketData");

        var leftBucket = 0;
        var topBucket = 0;
        var counter = 0, dropPosition;

        var bucketCounter = 1;
        for (key in this.showSolutionFixedDragDropArray){
            var bucketCounter = 1;
            if (this.showSolutionFixedDragDropArray[key] != "undefined") {

                for(var i=0;i<this.showSolutionFixedDragDropArray[key].length;i++){

                    var dragId = this.showSolutionFixedDragDropArray[key][i].item.id;
                    var targetPosition = this.showSolutionFixedDragDropArray[key][i].item.targetArea;
                    dropPosition = this.$el.find("#bucketDropArea-" + targetPosition).position();
                    leftBucket = (this.$el.find("#bucketDropArea-" + targetPosition).position().left) + (this.$el.find("#bucketDropArea-" +targetPosition).width() - this.$el.find("#bucketDraggables-" + dragId).width()) / 2;
                    topBucket=((this.$el.find("#bucketDropArea-" + targetPosition).height()) + (this.$el.find("#bucketDropArea-" + targetPosition).position().top) - ((this.$el.find("#bucketDraggables-" + dragId).height()) * bucketCounter)) - (this.dragMargin * bucketCounter);

                    this.$el.find("#bucketDraggables-" + dragId).animate({
                        top: topBucket,
                        left: leftBucket
                    }, 600);

                    bucketCounter++;
                }
            }
        }

    },
    //End of method
    showSolutionReference: function () {

        var items = this.model.get('draggables');
        if(this.model.get('config').isBucketDragDrop){
            _.each(items, function (item) {
                if (this.showSolutionArray[item.targetArea] == undefined) {
                    this.showSolutionArray[item.targetArea] = [];
                }
                this.showSolutionArray[item.targetArea].push({
                    item: item
                });
            }, this);
        }
        if(this.model.get('config').isFixedDragDrop ){
            _.each(items, function (item) {
                if (this.showSolutionFixedDragDropArray[item.targetArea] == undefined) {
                    this.showSolutionFixedDragDropArray[item.targetArea] = [];
                }
                if(item.targetArea !=0)
                {
                    this.showSolutionFixedDragDropArray[item.targetArea].push({
                        item: item
                    });
                }
            }, this);
        }
    },

    setStackOrder: function () {
        this.$el.find("#" + this.currentDraggableId).css('z-index', 1000);
    },
    resetStackOrder: function () {
        this.$el.find("#" + this.currentDraggableId).css('z-index', '');

    },


    /*Methods for Drag Drop Templates Ends*/

    /*Methods to disable the options starts*/
    disableInputs: function (state) {
        if (state)this.$el.find('input').attr('disabled', 'disabled');
        else this.$el.find('input').removeAttr('disabled');
    },
    disableOptionsSequential: function (state) {
        if (state)this.$el.find('.options').addClass('disabled');
        else this.$el.find('.options').removeClass('disabled');
    },
    disableOptions: function (state) {
        if (state)this.$el.find(".options").attr("disabled", true);
        else this.$el.find(".options").attr("disabled", false);
    },
    /*Methods to disable the options ends */

    /* Action button methods starts*/
    onSubmitButtonClicked: function () {

        this.attemptCount++;

        this.disableSubmitButton(true);
        this.disableResetButton(true);
        this.$el.find("#correct, #incorrect , #partial").hide();
        this.disableOptions(true);

        if (this.model.get('config').isMultiSelect) {
            this.validateMultiSelectAnswer();
        }
        else if (this.model.get('config').isSingleSelect) {
            this.validateSingleSelectAnswer();
        }
        else if (this.model.get('config').isFillInTheBlank) {
            this.validateFillInTheBlanksAnswer();
        }
        else if (this.model.get('config').isHotSpot) {
            this.validateAnswerForHotSpot();
        }
        else if (this.model.get('config').isDragDrop) {
            this.validateAnswersForDragDrop();
        }
        else if (this.model.get('config').isBucketDragDrop) {
            this.validateAnswersForBucketDragDrop();
        }
        else if (this.model.get('config').isBucketSingleDragDrop) {
            this.validateAnswersForBucketDragDrop();
        }

    },
    onResetButtonClicked: function () {

        this.disableResetButton(true);
        this.disableSubmitButton(true);
        this.$el.find("#incorrect").hide();
        this.$el.find("#partial").hide();
        this.userSelectedOption = [];
        this.userSelectedOption.length = 0;
        this.answerSubmitted = false;
        this.correctAnswerCount = 0;
        this.wrongAnswerCount = 0;

        if (this.model.get('config').isHotSpotSequential){
            for(var i=1;i<=this.model.get('options').length;i++)
            {
                if (this.$el.find("#sequential" + i ).hasClass("sequentialClass")) {
                    this.$el.find("#sequential" + i ).removeClass("sequentialClass");
                }
            }
        }

        if (this.model.get('config').isDragDrop || this.model.get('config').isBucketDragDrop) {
            if(this.model.get('config').isFixedDragDrop){
                this.bucketArray =[];
                this.initialiseBucketArray();
            }
            this.goToHomePositionOnResetClick();
            this.checkAssociativeArray = [];
            this.bucketOneArray = [];
            this.bucketTwoArray = [];
            this.bucketPosition = [];
            this.totalElementsInBucket = [];
            this.bucketTop = 0;
            this.bucketAssociativeArray = [];
        }
        else {
            this.$el.find("#optionContainer").empty();
            this.render();
        }

    },
    onShowSolButtonClicked: function () {

        this.disableShowSolutionButton(true);
        var option = this.model.get('options');
        if (this.model.get('config').isFillInTheBlank) {
            this.showSolutionForFillInTheBlanks();
        }
        else if (this.model.get('config').isMultiSelect) {

            this.$el.find("#optionContainer").empty();
            this.render();
            this.showSolutionForMultiSelect(option);
        }
        else if (this.model.get('config').isSingleSelect) {
            this.$el.find("#optionContainer").empty();
            this.render();
            this.showSolutionForSingleSelect(option)
        }
        else if (this.model.get('config').isDragDrop) {
            this.showSolutionForDragDrop();
            this.answerSubmitted = true;
        }
        else if (this.model.get('config').isBucketDragDrop) {
            this.showSolutionForBucketDragDrop();
            this.answerSubmitted = true;
        }

        this.$el.find(".feedback").hide();
        this.$el.find(".finalFeedback").hide();
        this.$el.find(".options").removeClass('selected');
        if (this.isHotSpotSequential) {
            this.$el.find(".showSolutionSeq").show();
        }
        else {
            for (var i = 0; i < this.allOptions.length; i++) {
                if (this.allOptions[i].isCorrect == true) {
                    var id = this.allOptions[i].id;
                    this.$el.find("#non-sequential" + id).addClass('selected');
                }
            }
        }
    },


    /* Action button methods ends*/

    /*Button Disabling Methods*/
    disableSubmitButton: function (state) {
        if (state)this.$el.find("#submitButton").attr("disabled", true);
        else this.$el.find("#submitButton").attr("disabled", false);
    },
    disableResetButton: function (state) {
        if (state)this.$el.find("#resetButton").attr("disabled", true);
        else this.$el.find("#resetButton").attr("disabled", false);
    },
    disableShowSolutionButton: function (state) {
        if (state)this.$el.find("#showSolution").attr("disabled", true);
        else this.$el.find("#showSolution").attr("disabled", false);
    },
    /*Button Disabling Methods*/

    /*zoom print zoom functionality start*/
    zoomInImage: function () {
        var id = this.model.get("questionId");
        this.$el.find("#zoomin").hide();
        this.$el.find("#zoomout").show();

        if (this.model.get('config').isDragDrop) {
            this.$el.find("#dragDropImage" + id).addpowerzoom({defaultpower: 2, powerrange: [2, 2], largeimage: null, magnifiersize: [120, 120]});
            ddpowerzoomer.$magnifier.outer.css({visibility: "visible"});
        }
        if (this.model.get('config').isBucketDragDrop) {
            this.$el.find("#dragDropImage" + id).addpowerzoom({defaultpower: 2, powerrange: [2, 2], largeimage: null, magnifiersize: [120, 120]});
            ddpowerzoomer.$magnifier.outer.css({visibility: "visible"});
        }
        if (this.model.get('config').isHotSpot) {
            if (this.model.get("config").isHotSpotSequential) {
                var length = this.$el.find('.images-sequential').length;

                for (var i = 1; i <= length; i++) {
                    this.$el.find("#sequentialImg" + i).addpowerzoom({defaultpower: 2, powerrange: [2, 2], largeimage: null, magnifiersize: [120, 120]});
                    ddpowerzoomer.$magnifier.outer.css({visibility: "visible"});
                }

            }
            else {

                var length = this.$el.find('.images').length;
                for (var i = 1; i <= length; i++) {
                    this.$el.find("#nonSequentialImg" + i).addpowerzoom({defaultpower: 2, powerrange: [2, 2], largeimage: null, magnifiersize: [120, 120]});
                    ddpowerzoomer.$magnifier.outer.css({visibility: "visible"});
                }
                /*this.$el.find('.options').addpowerzoom({defaultpower: 2 , powerrange: [2,2], largeimage: null,magnifiersize: [120,120]});
                 ddpowerzoomer.$magnifier.outer.css({visibility: "visible"});*/

            }
        }
    },

    zoomOutImage: function () {

        this.$el.find("#zoomin").show();
        this.$el.find("#zoomout").hide();
        ddpowerzoomer.$magnifier.outer.css({visibility: "hidden"});

    },

    printPage: function () {

        var id = this.model.get("questionId");

        if ($(".commonActivityClass").hasClass('yesPrint')) {
            $(".commonActivityClass").removeClass('yesPrint');
            $(".commonActivityClass").addClass('noPrint');
        }
        if ($(".commonQuestionClass").hasClass('yesPrint')) {
            $(".commonQuestionClass").removeClass('yesPrint');
            $(".commonQuestionClass").addClass('noPrint');
        }
        //var maincontainerId="dragDropContainer"+id;
        if (this.$el.find(".commonActivityClass").hasClass('noPrint')) {
            this.$el.find(".commonActivityClass").removeClass('noPrint');
            this.$el.find(".commonActivityClass").addClass('yesPrint');
        }
        var mainQuestionContainer = "allQuestion" + id;
        if (this.$el.find("#" + mainQuestionContainer).hasClass('noPrint')) {
            this.$el.find("#" + mainQuestionContainer).removeClass('noPrint');
            this.$el.find("#" + mainQuestionContainer).addClass('yesPrint');
        }
        if (this.toPrint == true) {
            this.$el.find(".notepad-text-content").show();
            this.$el.find("#notepadContainer").hide();
        }
        else {
            this.$el.find("#notepadContainer").hide();
        }
        window.print();
        $(".notepad-text-content").hide();
    },
    dragDropPrintPage: function () {

    },
    focusArea: function () {
        this.$el.find("#textAreaId").focus();
    },
    closeNotepad: function () {
        //this.$el.find("#notepadContainer").empty();
        this.$el.find("#notepadContainer").hide();
        this.$el.find("#notepad").on('click', _.bind(this.showNotepad, this));
        $('.notepadCheckboxClass').attr('checked', false);
    },

    showNotepad: function () {
        var id = this.model.get('questionId');
        this.$el.find("#notepad").off("click");
        this.$el.find("#notepadContainer").show();

        var $self = this;
        this.$el.find("#notepadCheckbox").change(function (e) {
            var isChecked = $('#notepadCheckbox:checked').val() ? true : false;

            if (isChecked == true) {

                $self.toPrint = true;
                var data = $self.$el.find("#textAreaId").val();
                $self.$el.find(".notepad-text-content").empty();
                $self.$el.find(".notepad-text-content").append("Notes: " + data);
            }
            else {
                $self.toPrint = false;
            }
        });

    }


    /*zoom print zoom functionality end*/

});