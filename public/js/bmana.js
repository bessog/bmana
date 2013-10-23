var hideAll = function() {
    $('.trEdit').hide();
    $('.trEdit').css('background-color','transparent');
    $('.trTitle').css('background-color','transparent');
}

var toggleEdit = function(id) {
  if($('#tredit_'+id).css('display') == 'none') {
    hideAll();
    $('#trtitle_'+id).css('background-color','#afa');
    $('#tredit_'+id).css('background-color','#afa');
    $('#tredit_' + id).show();
  } else {
    hideAll();
  }
}

var saveBanner = function(id) {
  data = {'active': $('#active_'+id).val(), 'body': $('#body_'+id).val()};
  $.ajax({
    type: "PUT",
    url: '/banner/'+id,
    contentType: "application/json",
    data: data,
    success: function(ret) {
      $('#active_'+id).prop('checked', ret.record[0].active);
      $('#body_'+id).val(ret.record[0].body);
    }
  });
}

$(document).ready(function () {

  $('.fixedparams').hide();

  $.getJSON("/getdefaultstyles", function(data) {
    for(var i = 0; i < data.length; i++) {
      $("body").prepend(data[i].css);
    }
  });

  $.getJSON("/typeselect", function(data) {
    for(var i = 0; i < data.length; i++) {
      $("#typeselect").append('<option>' + data[i] + '</option>');
    }
  });

  $('#typeselect').change(function() {
    $("#customfields").empty();
    $("#bannerrecords").empty();
    $.getJSON("/customfields/" + $(this).val(), function(data) {
      for(var i = 0; i < data.length; i++) {
        $("#customfields").append('<tr><td>' + data[i] + '</td><td><input type="text" name="fields[' + data[i] + ']"></td></tr>');
      }
    });
    $('.fixedparams').show();
  });

  $('#search').click(function() {
    $("#bannerrecords").empty();
    $.getJSON("/list?" + $('#daForm').serialize(), function(data) {
      //alert(data);
      for(var i = 0; i < data.records.length; i++) {
        bid = data.records[i]._id.$oid;
        if(data.records[i].active) checked = 'checked'; else checked = '';
        $("#bannerrecords").append(
          '<tr class="trTitle" id="trtitle_' + bid + '">' +
            '<td>' + data.records[i].body + '</td>' +
            '<td><input type="button" onclick="javascript:toggleEdit(\''+bid+'\')"></td>' +
          '</tr>' +
          '<tr class="trEdit" id="tredit_' + bid + '"><td colspan="3">' +
            '<form id="form_' + bid + '">' +
              '<table class="formTable"><tr>' +
                '<td class="firstTd">active: <input type="checkbox" name="active" id="active_'+bid+'" ' + checked + '/></td>' +
                '<td class="secondTd"><textarea rows="10" style="width:100%" name="body" id="body_'+bid+'">' + data.records[i].body + '</textarea></td>' +
                '<td class="thirdTd"><input type="button" value="save" onclick="javascript:saveBanner(\'' + bid + '\')"></td>' +
              '</tr></table>' +
            '</form>' +
          '</td></tr>'
        );
      }
      $('.trEdit').hide();
    });

  });

});

