var saveStyle = function(site) {
  data = {'css': $('#css').val()};
  $.ajax({
    type: "PUT",
    url: '/style/'+ $('#styleselect').val(),
    contentType: "application/json",
    data: data,
    success: function(ret) {
      $("style").remove();
      $("body").prepend("<style>"+data.css+"</style>");
      $("#css").empty();
      $("#css").val(data.css);
      $('.banner').css('background-color','');
    }
  });
}

$(document).ready(function () {

  $.getJSON("/styleselect", function(data) {
    for(var i = 0; i < data.length; i++) {
      $("#styleselect").append('<option>' + data[i] + '</option>');
    }
    $('.banner').css('background-color','');
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
      $('.banner').css('background-color','');
    });
  });

  $("#css").keyup(function() {
    $("style").remove();
    $("body").prepend("<style>"+$("#css").val()+"</style>");
    $('.banner').css('background-color','#faa');
  });

});
