$.validator.setDefaults({
	submitHandler: function() {
		alert("Sign up Successful!");
	}
});

$().ready(function() {

	$("#signup").validate({
		rules: {
			username: {
				required: true,
				minlength: 2
			},
			email: {
				required: true,
				email: true
			},
			password: {
				required: true,
				minlength: 6
			},
			confirm_password: {
				required:true,
				minlength: 6,
				equalTo: "#password"
			}
		},
		messages:{
			name: {
				required: "Please enter a username",
				minlength: "Your username must consist of at least 2 characters"
			},
			email:{
				required:"Please enter a email",
				email: "Please enter a valid email address "
			},
			password:{
				required:"Please enter a password",
				minlength:"Your password must be at least 6 characters long"
			},
			confirm_password:{
				required:"Please re-enter the password",
				minlength:"Your password must be at least 6 characters long",
				equalTo: "Please enter the same password as above"
			}
		}
	});
});