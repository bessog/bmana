var saveStyle = function() {
	data = {'css': $('#css').val()};
	$.ajax({
		type: "PUT",
		url: '/style/'+ $('#siteselect').val() + '/'+ $('#typeselect').val(),
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

var getStyle = function(site, type) {
	$.getJSON("/style/" + site + "/" + type, function(data) {
		$("style").remove();
		$("body").prepend("<style>"+data.records+"</style>");
		$("#css").empty();
		$("#css").val(data.records);
		$('#savebutton').prop('disabled', '');
		$('#css').prop('disabled', '');
	});
}

$(document).ready(function () {

	if(document.location.host == 'bmanadev.cfapps.io') {
		$('#envspan').html('DEV/STAGE INSTANCE');
	} else if(document.location.host == 'bmana.cfapps.io') {
		$('#envspan').html('!!!!!!!!!!!!!!!! LIVE INSTANCE !!!!!!!!!!!!!!!!!!');
	} else if(document.location.host == '192.168.152.129:9292') {
		$('#envspan').html('LOCAL DEV INSTANCE');
	}

	$('#typeselect').prop('disabled', 'disabled');
	$('#savebutton').prop('disabled', 'disabled');
	$('#css').prop('disabled', 'disabled');
	
	$.getJSON("/siteselect", function(data) {
		for(var i = 0; i < data.records.length; i++) {
			$("#siteselect").append('<option>' + data.records[i].site + '</option>');
		}
	});

	$('#siteselect').change(function() {
		$("#typeselect").empty();
		$("#typeselect").append('<option>...select</option>');
		$.getJSON("/typeselect/"+$(this).val(), function(data) {
			for(var i = 0; i < data.records.length; i++) {
				$("#typeselect").append('<option>' + data.records[i] + '</option>');
			}
		});
		$('#typeselect').prop('disabled', '');
	});

	$('#typeselect').change(function() {
		$.getJSON("/banner/" +	$(this).val(), function(data) {
			$(".banner").html(data.body);
		});
		getStyle($('#siteselect').val(), $(this).val());
		$('.banner').css('background-color','');
	});
	
	$("#css").keyup(function() {
		$("style").remove();
		$("body").prepend("<style>"+$("#css").val()+"</style>");
		$('.banner').css('background-color','#faa');
	});

});
