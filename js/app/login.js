
var resetForm = function(){
	dijit.byId("txtLogin").set("value","");
	dijit.byId("txtPassword").set("value","");
};

var doLogin = function(evt){
	var content = dojo.formToQuery("frmLogin");
	evt.preventDefault();
	resetForm();
	dojo.xhrPost({
		postData:content,
		url:"processLogin.php",
		handleAs: "text",
		load: function(response){
			if(response.status=="success"){
				window.location=response.action;
			}else{
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
	dojo.connect(dijit.byId("butSubmit"),"onClick", doLogin);
};

dojo.ready(init);

	

