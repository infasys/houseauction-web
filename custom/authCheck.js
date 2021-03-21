
const authCheck = (req, res, nxt) => {
    res.locals.mysel =0;
    res.locals.menusel =0;
    var full_address = req.protocol + "://" + req.headers.host + req.originalUrl;
    if(req.session.userid){
        
      req.user = {id:req.session.userid,orgid:req.session.orgid,username:req.session.username,orgname:req.session.orgname};
      res.locals.username = req.user.username;
      res.locals.orgname = req.user.orgname;
      res.locals.darktheme = req.session.themeid;
      res.locals.p = 200;
      res.locals.pageno = res.locals.p;
      res.locals.m = 250;
      console.log(res.locals.username)
      nxt();
    }else{
    res.redirect('/account/log-in');
    }
}

const authCheckNoLogIn = (req, res, nxt) => {
    var full_address = req.protocol + "://" + req.headers.host + req.originalUrl;
    if(req.session.userid){
        res.redirect('/portal/dashboard');
    }else{
        nxt();
    }
}

module.exports = authCheck;
module.exports.authCheckNoLogIn = authCheckNoLogIn;