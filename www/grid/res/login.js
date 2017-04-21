// by 6Harmonics Qige @ 2017.02.22 - 2017.04.21

$(document).ready(function(){
	$('.modal').modal();
	$('.qz-doing').hide();

	$('#qz-form-login').submit(function() {
		$('.qz-doing').show();

		var user = $('#username').val();
		var pass = $('#password').val();

		if (user.length < 5 || pass.length < 5) {
			$('.qz-doing').hide();
			var $toastContent = $('<span>Please check your USERNAME & PASSWORD</span>');
			Materialize.toast($toastContent, 3000);
			return false;
		}
		$('.qz-doing').hide();
	});

	$('#qz-owner').click(function() {
		$('#username').val('admin');
		$('#password').val('admin');
		$('#qz-form-login').trigger('submit');
	});
});
