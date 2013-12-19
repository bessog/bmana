$(document).ready(function () {

  $.getJSON("/styleselect", function(data) {
    for(var i = 0; i < data.length; i++) {
      $("#styleselect").append('<option>' + data[i] + '</option>');
    }
  });

  $.getJSON("/style/default", function(data) {
    $("body").prepend("<style>"+data.css+"</style>");
    $("#css").val(data.css);
  });

  $.getJSON("/banner", function(data) {
    $(".banner").html(data.body);
  });

  $('#styleselect').change(function() {
    $.getJSON("/style/" + $(this).val(), function(data) {
      $("style").remove();
      $("body").prepend("<style>"+data.css+"</style>");
      $("#css").empty();
      $("#css").val(data.css);
    });
  });

  $("#css").keyup(function() {
    $("style").remove();
    $("body").prepend("<style>"+$("#css").val()+"</style>");
  });

});
