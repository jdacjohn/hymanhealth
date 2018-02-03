<%@ Application Language="C#" %>

<script RunAt="server">

    void Application_Start(object sender, EventArgs e)
    {
        // Code that runs on application startup

    }

    void Application_End(object sender, EventArgs e)
    {
        Session["UserName"] = null;
        Session.Abandon();
        Response.Cookies.Clear();
        Response.Clear();
        FormsAuthentication.SignOut();
        Response.Redirect(FormsAuthentication.DefaultUrl);
        //FormsAuthentication.RedirectFromLoginPage("", false);
    }

    void Application_Error(object sender, EventArgs e)
    {
        // Code that runs when an unhandled error occurs

    }

    void Session_Start(object sender, EventArgs e)
    {
        // Code that runs when a new session is started

    }

    void Session_End(object sender, EventArgs e)
    {
        Session["UserName"] = null;
        Session.Abandon();
        Response.Cookies.Clear();
        Response.Clear();
        FormsAuthentication.SignOut();
        Response.Redirect(FormsAuthentication.DefaultUrl);
    }
       
</script>

