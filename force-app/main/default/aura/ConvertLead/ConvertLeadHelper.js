({
   
    fetchDetails : function(component, event, helper) {
        console.log('in fetch account');
        var opts = [];
    	var leadId  = component.get("v.recordId");
        console.log('in fectch lead'+leadId);
        var action = component.get("c.fetchDefaultDetails");
        action.setParams({ 
            "leadId" : leadId
        });
        action.setCallback(this, function(response) {
             var state = response.getState();
            console.log(state);
             if (response.getState() == "SUCCESS") {
                var wrapperValues = response.getReturnValue();
               
	                if (wrapperValues.statusValues != undefined && wrapperValues.statusValues.length > 0) {
                    opts.push({
                        label: "--- None ---",
                        value: ""
                    });
                }
                for (var i = 0; i < wrapperValues.statusValues.length; i++) {
                    opts.push({
                        label: wrapperValues.statusValues[i],
                        value: wrapperValues.statusValues[i]
                    });
                }
                component.find('leadStatus').set("v.options", opts);
                 console.log('checking');
                 if(wrapperValues.accDetails != undefined && wrapperValues.accDetails.length > 0){
                 component.set("v.selectedacc", wrapperValues.accDetails);
                    // component.set("v.selectedAccId", wrapperValues.accId);
                     component.set("v.selectedAccLabel", wrapperValues.accDetails);
                     
                 }
                  if(wrapperValues.userOwner != undefined && wrapperValues.userOwner.length > 0){
                 component.set("v.selecteduser", wrapperValues.userName);
               // component.set("v.selectedUserLabel", wrapperValues.userName);
                      component.set("v.selectedUserId", wrapperValues.userOwner);
                 }
                  if(wrapperValues.name != undefined && wrapperValues.name.length > 0){
                 component.set("v.contactDetails", wrapperValues.name);
                      component.set("v.OptyName", wrapperValues.name);
                 }
            }
            console.log('%%%%% acc'+component.set("v.selectedAccId"));

          });
        $A.enqueueAction(action);
    },
    
    leadConvert : function(component, event, helper){
        var leadId  = component.get("v.recordId");
        var leadStatus = component.get("v.selectedStatus");
        var userId = component.get("v.selectedUserId");
        var accId = component.get("v.selectedAccId");
        var optyCheck = component.get("v.createOpty");
        var emailCheck = component.get("v.emailCheck");
        var opty = component.get("v.OptyName");
        var newAcc = component.get("v.newAccButton");
        var aName = component.get("v.selectedAccLabel");
         console.log('account name check'+newAcc);
        console.log('%%% account id'+accId);
         var action = component.get("c.convertLeadApex");
        action.setParams({ 
            "leadId" : leadId,
            "status" : leadStatus,
            "userDetail" : userId,
            "acc" : accId,
            "opty" : optyCheck,
            "sendEmail" : emailCheck,
            "OpName" : opty,
            "a" : newAcc,
            "accName" : aName
         
        });
        action.setCallback(this, function(response) {
             var state = response.getState();
            console.log(state);
             if (response.getState() == "SUCCESS") {
                var c = response.getReturnValue();
                 component.set("v.isOpen", true);
                 component.set("v.contactCreated", c);
             }
             });
        $A.enqueueAction(action);
        
    }
})