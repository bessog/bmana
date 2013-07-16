$(document).ready(function () {

  $.getJSON("/typeselect", function(data) {
    for(var i = 0; i < data.length; i++) {
      $("#typeselect").append('<option>' + data[i] + '</option>');
    }
  });

  $('#typeselect').change(function() {
    $.getJSON("/customfields/" + $(this).val(), function(data) {
      for(var i = 0; i < data.length; i++) {
        $("#customfields").append('<tr><td>' + data[i] + '</td><td><input type="text" name="fields[' + data[i] + ']"></td></tr>');
      }
    });
  });

  $('#search').click(function() {
    $.getJSON("/list?" + $('#daForm').serialize(), function(data) {
      alert(data);
      //for(var i = 0; i < data.length; i++) {
        //$("#customfields").append('<tr><td>' + data[i] + '</td><td><input type="text" name="field[' + data[i] + ']"></td></tr>');
      //}
    });

    //alert($('#daForm').serialize());
  });

});
