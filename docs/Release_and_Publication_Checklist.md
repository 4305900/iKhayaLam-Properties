# GitHub Publication Checklist

- [ ] Confirm group approval for repository ownership and public visibility.
- [ ] Confirm all five group members' names and roles against the agreed contribution record.
- [ ] Verify the public application link.
- [ ] Add the final approved system architecture and to-be BPMN, after removing confidential identifiers.
- [ ] Add the final group demo link and slide deck only after compilation and approval.
- [ ] Add only synthetic/redacted screenshots (no client phone, email, passwords or browser tokens).
- [ ] Keep the **lecturer-only folder/ZIP out of the repository**.
- [ ] Inspect CSS, scripts, exported APEX SQL, screenshots and Git history for secrets.
- [ ] Ensure `.gitignore` excludes local configs, credential exports and confidential documents.
- [ ] Run acceptance tests with synthetic records.
- [ ] Select a licence only after group/rights-holder approval.
- [ ] Archive the restricted assessor credential pack separately for grading.

## Publishing on GitHub

1. Create a repository under the approved group account, with suitable visibility.
2. Extract **only** `01_GitHub_Public/` into the repository folder.
3. Review `git status` and `git diff --cached` before every commit.
4. Add files and make a descriptive initial commit; push to the group repository.
5. Check the repository's web UI for mistakenly included files and sensitive history.
6. If a secret is accidentally committed: revoke/rotate the secret immediately; removing the current file alone does not clean history.
