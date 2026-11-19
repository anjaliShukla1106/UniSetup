@isTest(SeeAllData=false)
Public class ConvertLead_Class_Test {

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
      
     public WrapperLeadController(String a,String ai,String u,String uName,String name1, List<String> convertedStatus){
        this.accDetails = a;
        this.accId = ai;
        this.userOwner = u;
         this.userName = uName;
        this.name = name1;
        this.statusValues = convertedStatus;
       
    }   
} 

static TestMethod void LeadTest()
    {
        Test.startTest();
        
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User']; 
        User u = new User(Alias = 'standt', Email='standarduser@testorg.com', 
            EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US', 
            LocaleSidKey='en_US', ProfileId = p.Id, 
            TimeZoneSidKey='America/Los_Angeles', UserName='standarduser@testorg.com');
           
           List<LeadStatus> leadSh =  [SELECT Id, ApiName,IsConverted FROM LeadStatus where IsConverted = true];
            Lead myLead = new Lead(LastName = 'Fry', Company='Fry And Sons');

            insert myLead;
           Lead l = [Select id from Lead where LastName = 'Fry' limit 1];
           
           Account a = new Account(Name='TestAccount');
           
           
           List<String> statusList = new List<String>();
           statusList.add('closed-converted');
          
                // ConvertLead_Class.WrapperLeadController wrap = new ConvertLead_Class.WrapperLeadController('test','test','test','test',statusList);
                 ConvertLead_Class.fetchDefaultDetails(l.id);
                String c =  ConvertLead_Class.convertLeadApex(l.id,leadSh[0].ApiName,u.id,a.id,true,true,'test');
             

        
        }

}