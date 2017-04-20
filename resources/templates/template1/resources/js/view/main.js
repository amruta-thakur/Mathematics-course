
$(function()
{
    var length=$('#allContainers').children().length;
    for(var i=0;i<length;i++){
        var mainContainerId = $('#allContainers').children()[i].id;
        var modelForTemplate =new templateModel(question[i]);
        var viewForTemplate = new templateView({model:modelForTemplate, el:$("#"+mainContainerId)});
    }

});
