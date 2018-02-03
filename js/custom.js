jQuery.noConflict();

jQuery(document).ready(function()
{	

		jQuery(" #nav ul ").css({display: "none"}); // Opera Fix
		jQuery(" #nav li").hover(function(){
		jQuery(this).find('ul:first').css({visibility: "visible",display: "none"}).slideDown(400);
		},function(){
		jQuery(this).find('ul:first').css({visibility: "hidden"});
		});
	
});

var manageUsers = function(){
	window.location="../articles/AdminUsers.aspx";
};

