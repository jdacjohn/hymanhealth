
var doForm = function(evt){
	var content = dojo.formToQuery("frmForgotPassword");
	evt.preventDefault();
	resetForm();
	dojo.xhrPost({
		postData:content,
		url:"processForgotPassword.php",
		handleAs: "text",
		load: function(response){
			if(response.status=="success"){
				dojo.byId("statusText").innerHTML=response.message;
			}
			},
		error: function(error){
			console.log(error);
			dojo.byId("statusText").innerHTML=error.message;
			resetForm();
		}
	});
};

var init = function(){
	dojo.connect(dijit.byId("butSubmit"),"onClick",doForm);
};

dojo.ready(init);

