# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Salesforce DX project (source API version 68.0, single package dir `force-app`), retrieved from a dev org ("Initial retrieve from dev org"). The only package directory is `force-app/main/default/`. `manifest/package.xml` limits retrieves to: ApexClass, ApexComponent, ApexPage, ApexTestSuite, ApexTrigger, AuraDefinitionBundle, LightningComponentBundle, StaticResource. No objects, layouts, flexipages, or permission sets are in source, so code that references custom objects/fields depends on them already existing in the target org.

## Commands

- Deploy / retrieve: `sf project deploy start`, `sf project retrieve start -x manifest/package.xml`
- Apex tests: `sf apex run test --test-level RunLocalTests --wait 10` (single class: `--class-names BatchLeadConvertTest`, single method: `--tests Class.method`)
- Run anonymous Apex / SOQL: `sf apex run -f scripts/apex/hello.apex`, `sf data query -f scripts/soql/account.soql`
- LWC Jest tests: `npm test` (watch: `npm run test:unit:watch`; single file: `npx sfdx-lwc-jest -- path/to/file.test.js`). Note `force-app/main/default/lwc` is currently empty.
- Lint: `npm run lint` (ESLint on `aura`/`lwc` JS only)
- Format: `npm run prettier` / `npm run prettier:verify` (covers Apex via prettier-plugin-apex, XML, etc.)
- Husky pre-commit runs `lint-staged` (prettier on staged files, eslint on aura/lwc JS, and related LWC Jest tests).

## Architecture

Mostly legacy Apex + Aura + Visualforce; each piece is a set of files that must be read together:

- **Apex classes** (`classes/`, each with a `*Test.cls` sibling): 
  - Lead conversion: `ConvertLead_Class`, `BatchLeadConvert`, and trigger `LeadConvertValidation` (tested by `LeadConvertValidationTest`), surfaced in the `ConvertLead` Aura bundle.
  - Opportunities: `Opportunity_Trigger` / `Opportunity_Handler` (handler pattern).
  - Tower map: `TowerMapController` + `TowerMapUtilClass` back the `Towermap` Aura bundle.
  - Lookup: `LookupSObjectController` backs the `LookupSObject` Aura bundle, with helper events/bundles `ClearLookupId`, `UpdateLookupId`.
  - Community/site auth: `Communities*Controller`, `Lightning*Controller`, `SiteLoginController`, `SiteRegisterController`, `ChangePasswordController`, `ForgotPasswordController`, `MicrobatchSelfRegController`, `MyProfilePageController` — Salesforce-standard Experience Cloud/Site templates paired with the `loginForm`, `selfRegister`, `forgotPassword`, `setStartUrl`, `setExpId` Aura bundles and the ~50 Visualforce `pages/` plus 8 `components/`.
  - Misc: `SecureApexRest`, `QueryContact`, `OpenCases`, `UtilityClass`, `MyIterable`, `Symptom_check_code_server`, `DataGenerationTest`.
- **Trigger** `BatchApexErrorTrigger` writes `BatchApexErrorEvent` failures into the `BatchLeadConvertErrors__c` custom object (used with `BatchLeadConvert`).
- **Static resources**: `slds202` (SLDS) and `SiteSamples` — vendored; avoid editing.

## Notes

- `.sf/` and `.sfdx/` hold CLI state and downloaded Apex stdlib stubs for the org; don't edit them.
- Apex files need their `-meta.xml` alongside; keep both when creating, renaming, or deleting.

## Coding Rules (from Salesforce's Agentforce Vibes library)

Condensed from the official skills in https://github.com/forcedotcom/afv-library (`platform-apex-generate`, `platform-apex-test-generate`, `platform-soql-query`, `experience-lwc-generate`, `experience-lwc-security-validate`). Apply them to new or changed code; don't refactor existing legacy classes to match unless asked.

### Apex: hard stops (stop and explain instead of writing code that breaks these)

- No SOQL or DML inside loops (limits: 100 queries, 150 DML statements per transaction).
- Every class declares a sharing keyword. Default to `with sharing`; justify `without sharing` / `inherited sharing` in a comment and keep elevated logic in a small dedicated helper.
- No hardcoded record IDs or secrets: use Custom Metadata, Custom Labels, describe calls, and Named Credentials.
- Always handle exceptions (log, rethrow, or recover); never swallow them.
- Dynamic SOQL with user input uses bind variables; validate dynamic field/operator names against `Schema.describe` or an allowlist.
- Don't use `@future` in new code; use Queueable (plus `System.Finalizer` for cleanup).
- Avoid `System.debug()` in main code paths.

### Apex: bulkification and SOQL

- Public methods accept collections; single-record overloads delegate to the bulk method.
- Use `Map<Id, SObject>`, `Map<Id, List<SObject>>` and `Set<Id>` for lookups, grouping and membership checks.
- Query only the fields you need, filter on indexed fields where possible, add `LIMIT` / `ORDER BY` when results should be bounded or deterministic.
- Use relationship subqueries instead of separate parent/child queries, and `AggregateResult` + `GROUP BY` for counts and rollups.
- Only DML records that actually changed (compare with `Trigger.oldMap`). In batch/bulk flows prefer `Database.update(records, false)` and handle `SaveResult` errors.
- Read Custom Metadata (`__mdt`) with `getAll()` / `getInstance()`, not SOQL.

### Apex: security

- Use `WITH USER_MODE` in SOQL and `AccessLevel.USER_MODE` for `Database` DML. This project is on API 68.0, where user mode is the default and queries in `without sharing` classes throw when the user lacks object/field access.
- `@AuraEnabled` methods: `with sharing`, `cacheable=true` only for read-only methods, and catch exceptions and rethrow as `AuraHandledException` with a user-friendly message (no internal details or PII).
- Never put PII in logs, error messages or API responses.

### Apex: structure and naming

- Layers: triggers only route events to a handler (one trigger per object); handlers/services coordinate; domain classes hold business rules; selectors/data classes own SOQL, DML and HTTP. Don't mix these in one method.
- One responsibility per class, max ~500 lines; extract private helpers for methods over ~40 lines; validate inputs and return early.
- Null safety: guard clauses at the top of public methods, return empty collections instead of `null`, use `?.` and `??`, use `String.isBlank()`, don't dereference `map.get(key)` without checking.
- Naming: classes `PascalCase` (`AccountService`, `AccountSelector`, `AccountDeduplicationBatch`, `ExternalSyncQueueable`, `AccountTrigger`, `{Name}Exception`); methods `camelCase` starting with a verb; lists plural (`accounts`), maps `accountsById`, sets `accountIds`; constants and enum values `UPPER_SNAKE_CASE`; no abbreviations like `acc` or `rec`.
- Use enums or `private static final` constants instead of repeated literals, and `Label.` custom labels for user-facing text.
- ApexDoc on every class and every `public`/`global` method (`@param`, `@return`, `@throws`).
- Catch specific exceptions before generic `Exception`, and keep the cause: `new MyException('message', cause)`.
- Async: Queueable for normal async work, Batch Apex for very large data sets, Schedulable only to kick off Batch/Queueable.
- `@RestResource`: `global with sharing`, versioned URL (`/resource/v1/*`), correct HTTP status codes, logic delegated to a service class.

### Apex tests

- Every class gets a `{ClassName}Test.cls` (+ `-meta.xml`). Minimum 75% coverage to deploy, aim for 90%+.
- One behavior per test method; name them `should<Result>_When<Scenario>`; use Given / When / Then comments.
- Test bulk behavior with 251+ records (crosses the 200-record trigger chunk). For Batch Apex, set batch size >= test record count.
- Create data through a `TestDataFactory` class (create one if missing); never `SeeAllData=true` or hardcoded IDs.
- Use the `Assert` class (`Assert.areEqual`, `Assert.isTrue`, `Assert.fail`) with exact expected values and failure messages, not `System.assert*`.
- Wrap the code under test in `Test.startTest()` / `Test.stopTest()`; mock callouts with `HttpCalloutMock`; cover negative and exception paths.

### LWC (if components are added under `lwc/`)

- Prefer Lightning base components and Lightning Data Service (`getRecord`, record forms); use Apex `@AuraEnabled(cacheable=true)` via `@wire` for read-only queries and imperative Apex calls for actions/DML.
- No hardcoded colors; use SLDS 2 styling hooks. Keep components accessible (keyboard access, labels, alt text).
- Avoid rerender loops in `renderedCallback()`; keep component events explicit and minimal.
- Lightning Web Security: no `eval`, `new Function`, `document.write`, `innerHTML` with untrusted data, injected `<script>` elements, globals on `window`, or `javascript:` URLs; sandbox any `<iframe>`.

### Before saying a change is done

- Run Salesforce Code Analyzer on changed files (`sf code-analyzer run --target <path>`) and fix sev0–sev2 findings.
- Run the related Apex tests (`sf apex run test --class-names <Name>Test --code-coverage --result-format human`) and report pass/fail and coverage.
