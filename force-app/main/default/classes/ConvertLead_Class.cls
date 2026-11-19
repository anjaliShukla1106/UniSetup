Global class ConvertLead_Class {

    public class WrapperLeadController{
        
        @AuraEnabled
        public String accDetails{get;set;}
        @AuraEnabled
        public String accId{get;set;}
        @AuraEnabled
        public String userOwner{get;set;}
        @AuraEnabled
        public String userName{get;set;}
        @AuraEnabled
        public String name{get;set;}
        @AuraEnabled
        public List<String> statusValues{get;set;}
      
     public WrapperLeadController(String a,String u,String uName,String name1, List<String> convertedStatus){
        this.accDetails = a;

        this.userOwner = u;
         this.userName = uName;
        this.name = name1;
        this.statusValues = convertedStatus;
       
    }   
} 
    
    @AuraEnabled
 	public static WrapperLeadController fetchDefaultDetails(String leadId) {
     List <String> allOpts = new list < String > ();
        String accId;
        String accName;
    	List<LeadStatus> leadSh =  [SELECT Id, ApiName,IsConverted FROM LeadStatus where IsConverted = true];
    	for (LeadStatus l: leadSh) {
   			allOpts.add(l.ApiName);
  		}	
     Lead l = [Select Company, Name, OwnerId from Lead where ID =:leadId];
     system.debug('lead '+ l);
        accName = l.Company;
       // List<Account> acc = [Select Id, Name from Account where Name =:l.Company];
       // if(acc!= null && acc.size()>0){
         //   accId = acc[0].Id;
          //  accName = acc[0].Name;
           // system.debug('in acc found');
       // }
       // else{
         //   accId = null;
           // accName = l.Company;
           //  system.debug('in no acc');
        //}
           
    user userOwner = [Select Id, Name, Username from User where Id =: l.OwnerId];
     WrapperLeadController leadDetails = new WrapperLeadController(accName, userOwner.Id, userOwner.Name, l.Name, allOpts);
   system.debug('wrapper'+leadDetails);
  return leadDetails;
 }
    @AuraEnabled
   
    public static String convertLeadApex(String leadId,String status,String userDetail,String acc,Boolean opty,Boolean sendEmail, String OpName, Boolean a, String accName ){
        system.debug('lead Id'+leadId);
        Database.LeadConvert lc = new Database.LeadConvert();
		lc.setLeadId(leadId);
		//LeadStatus convertStatus = [SELECT Id, MasterLabel FROM LeadStatus WHERE IsConverted=true LIMIT 1];
		lc.setConvertedStatus(status);
        lc.setOwnerId(userDetail);
        system.debug('user id '+userDetail);
        if(!a){
        lc.setAccountId(acc);
        system.debug('account id '+acc);
        }
        lc.setSendNotificationEmail(sendEmail);
        system.debug('email'+sendEmail);
		lc.setDoNotCreateOpportunity(!opty);
        if(opty){
            system.debug('In opty'+OpName);
            lc.setOpportunityName(OpName);
        }
        Database.LeadConvertResult lcr = Database.convertLead(lc);
        String contactIDreturned = lcr.getContactId();
        if(a){
        	String aId = lcr.getAccountId();
        	Account ac = [Select Id, Name from Account where id =:aId];
        		if(ac.Name != accName){
        		ac.Name = accName;
        		update ac;
        	}
        }
        system.debug('contact created'+contactIDreturned);
	return contactIDreturned;
    }
   
}