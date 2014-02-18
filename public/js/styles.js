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

var newStyle = function(site) {
  data = {'css': $('#css').val(), 'typeselect': $('#').val()};
  $.ajax({
    type: "POST",
    url: '/style/'+ $('#newcsssite').val(),
    contentType: "application/json",
    data: data,
    success: function(ret) {
      $("style").remove();
      $("body").prepend("<style>"+data.css+"</style>");
      $("#css").empty();
      $("#css").val(data.css);
      $("#typeselect").append('<option selected>' + $('#newcsssite').val() + '</option>');
      $('.banner').css('background-color','');
    }
  });
}

var checkDupe = function() {
  var newcss = true;
  $('#styleselect option').each(function(){
    if (this.value == $('#newcsssite').val()) {
        newcss = false;
    }
  });
  return newcss;
}

$(document).ready(function () {

  if(document.location.host == 'bmanadev.cfapps.io') {
    $('#envspan').html('DEV/STAGE INSTANCE');
  } else if(document.location.host == 'bmana.cfapps.io') {
    $('#envspan').html('!!!!!!!!!!!!!!!! LIVE INSTANCE !!!!!!!!!!!!!!!!!!');
  } else if(document.location.host == '192.168.152.129:9292') {
    $('#envspan').html('LOCAL DEV INSTANCE');
  }

  $.getJSON("/typeselect/Sites", function(data) {
    for(var i = 0; i < data.length; i++) {
      $("#typeselect").append('<option>' + data[i] + '</option>');
    }
  });

  $('#typeselect').change(function() {
    $.getJSON("/styleselect/" + $(this).val(), function(data) {
      $("#styleselect").empty();
      for(var i = 0; i < data.records.length; i++) {
        $("#styleselect").append('<option>' + data.records[i]['site'] + '</option>');
      }
      $('.banner').css('background-color','');
    });
  });


  $.getJSON("/styleselect/default", function(data) {
    $("#styleselect").empty();
    for(var i = 0; i < data.records.length; i++) {
      $("#styleselect").append('<option>' + data.records[i]['site'] + '</option>');
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
