
var userPanel = null;

function userController($scope){
	
	log("userController started");
		
	var self = $scope;	
    userPanel = self;
	self.user = {login: "", password: ""};
	
	self.error = "";
	self.result = "Для входа или регистрации - введите логин и пароль.";
	self.onlineCount = 0;
	self.logedCount = 0;	
	self.registeredCount = 0;	
	
	/** called from server */	
	self.refreshLogedUsers = function(logedUsersLogins){
		self.logedCount = logedUsersLogins.length;
	    self.logedUsersLogins=logedUsersLogins,  
	    self.$digest();
	}	
	
	self.setOnlineCount = function(count){self.onlineCount = count; self.$digest();}		
	self.setRegisteredCount = function(count){self.registeredCount = count; self.$digest();}
	
	/** This method will called at application initialization (see last string in this file). */
	
	self.checkServerSession = function(control){
		Server.call("userService", "getUsersData", null, 
		   function(data){			
			self.onlineCount = data.onlineCount;		    	        
	        self.registeredCount = data.registeredCount;
	        self.logedUsersLogins = data.logedUsersLogins;
	        //for(var i = 0; i < 1000; i++){self.logedUsersLogins.push("newuser"+i);}	        
	        self.logedCount = data.logedUsersLogins.length;	
	        var user = data.user;
	        if(user){	
				log("checkUser: user="+JSON.stringify(user));			
				self.user = user;
				root.loged = true;
				self.result = "You loged in with role: "+user.role;				
			}	
			self.$digest();			
			root.$digest();		
		}, self.onError, control);		
	}	
	
	
	/** common user methods */
	
	self.registerUser = function(control){
		Server.call("userService", "registerUser", self.user, 
		   function(id){
			self.user.id = id;			
			self.onSuccess("You registered with id: "+id);		
			setTimeout(function(){
				control.disabled = true;
				self.logIn(control);			
			}, 20);
		}, self.onError, control);		
	}
	
	self.logIn = function(control){//[self.user] , self.user.password, true
		self.loginControl = control;
		Server.call("userService", "logIn", [self.user.login, self.user.password], function(user){
			self.user = user;
			root.loged = true;
			root.$digest();	
			self.onSuccess("You loged in with role: "+user.role);	
			setTimeout(function(){control.disabled = true;}, 20);
		}, self.onError, control);		
	}
	
	
	self.logOut = function(control){		
		Server.call("userService", "logOut", {}, function(){
			self.user.role = "";
			self.user.city = "";
			root.loged = false;
			root.$digest();	
			self.onSuccess("You loged out");
			setTimeout(function(){
				control.disabled = true;
				if(self.loginControl){self.loginControl.disabled = false;}
			}, 20);
		}, self.onError, control);	
	}		
	
		
	self.changeCity = function(control){
		Server.call("userService", "changeCity", self.user.city, function(){
			self.onSuccess("users city changed to: "+self.user.city);			
		}, self.onError, control);			
	}		
	
	/** for chat functionality */
	self.selectUser = function(user){chatPanel.selectUser(user);}

	
	/** common callbacks */
	
	self.onError = function(error){
		self.error = error;		
		self.$digest();		
	}
	
	self.onSuccess = function(result){	
		self.result = result;
		self.error = "";
		self.$digest();		
	}		
	
	
	/** user initialization */
	Listeners.add("onConnect", function(){self.checkServerSession();});
	
}

