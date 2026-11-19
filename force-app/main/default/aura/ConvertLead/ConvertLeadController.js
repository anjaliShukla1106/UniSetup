({
	doInit: function(component, event, helper) {
        console.log('in controller'+component.get("v.selectedUserId"));
        component.set("v.userCheck", false);
         component.set("v.newAccButton", false);
        component.set("v.statusCheck", false);
        
         helper.fetchDetails(component, event, helper);
  
    },
    convertLead: function(component, event, helper) {
        var showConvert = 'false';
        console.log('user id'+component.get("v.selectedUserId"));
        console.log('acc id'+component.get("v.selectedAccId"));
        console.log('usstatus id'+component.get("v.selectedStatus"));
        console.log('new acc string'+component.get("v.newAccButton"));
      //  var inputElemen = cmp.find('lookup');
        var u = component.get("v.selectedUserId");
          var a = component.get("v.selectedAccId");
        var s = component.get("v.selectedStatus");
         var ac = component.get("v.selectedacc");
        var newA = component.get("v.newAccButton");
        
        if(u == null || u == undefined){
             component.set("v.userCheck", true);
            showConvert = 'true';
        }
       
        if(newA == false && (a == null || a == undefined)){
             component.set("v.accError", true);
            showConvert = 'true';
        }
        
       if(s == null || s == ''){
            component.set("v.statusCheck", true);
            showConvert = 'true';
        }
        
        if(showConvert == 'false'){
        helper.leadConvert(component, event, helper);
            console.log('calling convert');
        }
           console.log(component.get("v.selectedStatus"));
        
    },
    
    checkboxSelect : function(component, event, helper) {
    var checkValue = event.getSource().get("v.value");
        if(checkValue == true){
            component.set("v.createOpty", true);
            component.set("v.disableOpty", false);
        }
        else{
            component.set("v.createOpty", false);
        	component.set("v.disableOpty", true);
        }
    },
    checkboxSelect2 : function(component, event, helper) {
        var checkValue = event.getSource().get("v.value");
        if(checkValue == true){
           component.set("v.emailCheck", true); 
              }
            else
                component.set("v.emailCheck", false);
        console.log('checking opty name in controller'+component.get("v.OptyName"));
      
    },
    
     closeModel: function(component, event, helper) {
         console.log('in close modal');
         component.set("v.isOpen", false);
     	var navEvt = $A.get("e.force:navigateToSObject");
   		 navEvt.setParams({
      		"recordId":component.get("v.contactCreated"),
      		"slideDevName": "related"
    	});
    	navEvt.fire();
   },
      closeStatusModel: function(component, event, helper) {
         console.log('in close modal');
      component.set("v.statusCheck", false);
   },
      closeUserModel: function(component, event, helper) {
         console.log('in close modal');
      component.set("v.userCheck", false);
   },
   closeAccModel: function(component, event, helper) {
         console.log('in close modal');
      component.set("v.accError", false);
   }
})