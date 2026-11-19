/**
 * (c) Tony Scott. This code is provided as is and without warranty of any kind.
 *
 * This work by Tony Scott is licensed under a Creative Commons Attribution 3.0 Unported License.
 * http://creativecommons.org/licenses/by/3.0/deed.en_US
 */
({
    /**
     * load selected value in init 
     */
    
    init : function(cmp, event, helper){
        helper.showSelectedLabel(cmp, event);  
      
        helper.handleInItSelection(cmp, event);
        console.log('show acc boolean'+cmp.get("v.createNewAcc"))
     },
    
    /**
     * Search an SObject for a match
     */
	search : function(cmp, event, helper) {
        console.log('in search');
		helper.doSearch(cmp);        
    },

     removeSearch : function(cmp, event, helper) {
  
        var lookupList1 = cmp.find('lookuplist');
         $A.util.addClass(lookupList1, 'slds-hide');
            $A.util.removeClass(lookupList1, 'slds-show');
       var checkValue = event.getSource().get("v.value");
        if(checkValue == true){
            cmp.set("v.disabled", true);
            cmp.set("v.disableNew", false);
                  cmp.set("v.createNewAcc", true);
            console.log('in true condition');
   
        }
        else{
            cmp.set("v.disabled", false);
             cmp.set("v.disableNew", true);
                  cmp.set("v.createNewAcc", flase);
             console.log('in false condition');
        	
        }
          
    },
    
      blurred : function(cmp, event, helper) {
        var lookupList2 = cmp.find('lookuplist');
         $A.util.addClass(lookupList2, 'slds-hide');
            $A.util.removeClass(lookupList2, 'slds-show');
    },
    
    /**
     * Select an SObject from a list
     */
    select: function(cmp, event, helper) {
        console.log('in select');
    	helper.handleSelection(cmp, event);
    },
    
    /**
     * Clear the currently selected SObject
     */
    clear: function(cmp, event, helper) {
        console.log('in clear');
    	helper.clearSelection(cmp);    
    }
})