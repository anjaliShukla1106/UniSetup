public class Symptom_check_code_server {
@AuraEnabled
public static String checkSymptoms(Id caseId) {

        return ('Hello from the server, '+ caseId);

    }
}