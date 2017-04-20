Handlebars.registerHelper("increment", function(index, offset) {
    return parseInt(index) + parseInt(offset);
});