var hideAll = function() {
	$('.trEdit').hide();
	if($('#tredit_'+bid).css('background-color') != '#faa') {
		//alert($('#tredit_'+bid).css('background-color'));
		$('.trEdit').css('background-color','transparent');
		$('.trTitle').css('background-color','transparent');
	}
}

var toggleEdit = function(bid) {
	if($('#tredit_'+bid).css('display') == 'none') {
		hideAll();
		if($('#tredit_'+bid).css('background-color') != '#FFAAAA') {
			//alert($('#tredit_'+bid).css('background-color'));
			$('#trtitle_'+bid).css('background-color','#afa');
			$('#tredit_'+bid).css('background-color','#afa');
		}
		$('#tredit_'+bid).show();
	} else {
		hideAll();
	}
}

var saveBanner = function(bid) {
	data = {'active': $('#active_'+bid).is(':checked'), 'body': $('#banbody_'+bid).val()};
	$.ajax({
		type: "PUT",
		url: '/banner/'+bid,
		contentType: "application/json",
		data: data,
		success: function(ret) {
			$('#active_'+bid).prop('checked', ret.records[0].active);
			$('#banbody_'+bid).val(ret.records[0].body);
			$('#trtitle_'+bid).css('background-color','#afa');
			$('#tredit_'+bid).css('background-color','#afa');
		}
	});
}

var refreshBanner = function(bid) {
	$('#tdbanner_'+bid).html($('#banbody_'+bid).val());
	$('#trtitle_'+bid).css('background-color','#faa');
	$('#tredit_'+bid).css('background-color','#faa');
}

var clickActive = function(bid) {
	$('#trtitle_'+bid).css('background-color','#faa');
	$('#tredit_'+bid).css('background-color','#faa');
}

var getStyle = function(site, type) {
	$.getJSON("/style/" + site + "/" + type, function(data) {
		$("style").remove();
		$("body").prepend("<style>"+data.records+"</style>");
	});
}

$(document).ready(function () {

	if(document.location.host == 'bmanadev.cfapps.io') {
		$('#envspan').html('DEV/STAGE INSTANCE');
	} else if(document.location.host == 'bmana.cfapps.io') {
		$('#envspan').html('!!!!!!!!!!!!!!!! LIVE INSTANCE !!!!!!!!!!!!!!!!!!');
	} else if(document.location.host == '192.168.152.129:9292' || document.location.host == 'localhost:9292') {
		$('#envspan').html('LOCAL DEV INSTANCE');
	}

	getStyle("spring.io","Training%20Classes");

	$('.fixedparams').hide();
	$('#styleselect').prop('disabled', 'disabled');
	$('#typeselect').prop('disabled', 'disabled');

	$.getJSON("/siteselect", function(data) {
		for(var i = 0; i < data.records.length; i++) {
			$("#siteselect").append('<option>' + data.records[i].site + '</option>');
		}
	});

	$('#siteselect').change(function() {
		$("#customfields").empty();
        $("#bannerrecords").empty();
		$("#typeselect").empty();
		$("#typeselect").append('<option>... select</option>');
		$.getJSON("/typeselect/"+$(this).val(), function(data) {
            var selected ='';
			for(var i = 0; i < data.records.length; i++) {
         		$("#typeselect").append('<option>' + data.records[i] + '</option>');
			}
		});
		$('#typeselect').prop('disabled', '');
	});

  $('#typeselect').change(function() {
    $("#customfields").empty();
    $("#bannerrecords").empty();
    getStyle($('#siteselect').val(),$(this).val());

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
      for(var i = 0; i < data.records.length; i++) {
        bid = data.records[i]._id.$oid;
        if(data.records[i].active) checked = 'checked'; else checked = '';
        $("#bannerrecords").append(
          '<tr class="trTitle" id="trtitle_' + bid + '">' +
            '<td><input type="button" onclick="javascript:toggleEdit(\''+bid+'\')"></td>' +
            '<td id="tdbanner_'+bid+'">' + data.records[i].body + '</td>' +
          '</tr>' +
          '<tr class="trEdit" id="tredit_' + bid + '"><td colspan="3">' +
            '<form id="form_' + bid + '">' +
              '<table class="formTable"><tr>' +
                '<td class="firstTd">active: <input type="checkbox" name="active" id="active_'+bid+'" ' + checked + ' onclick="clickActive(\''+bid+'\')"/></td>' +
                '<td class="secondTd"><textarea rows="10" style="width:100%" class="banbody" id="banbody_'+bid+'" onkeyup="refreshBanner(\''+bid+'\')">' + data.records[i].body + '</textarea></td>' +
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

