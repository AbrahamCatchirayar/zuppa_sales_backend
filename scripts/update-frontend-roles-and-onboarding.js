const fs = require('fs');
const path = require('path');

const frontendDir = path.resolve(__dirname, '../../zuppa_sales_frontend');
console.log('Target Frontend Directory:', frontendDir);

// 1. Update components/types.ts
const typesFile = path.join(frontendDir, 'components', 'types.ts');
if (fs.existsSync(typesFile)) {
  console.log('Updating components/types.ts...');
  let content = fs.readFileSync(typesFile, 'utf8');

  // Replace IUserRole
  const oldUserRoleRegex = /export type IUserRole = 'GUEST'[\s\S]*?\| 'DATA_PROVIDER'/;
  const newUserRole = `export type IUserRole = 'ADMIN'\n  | 'SALES'\n  | 'ENGINEERING'\n  | string`;
  content = content.replace(oldUserRoleRegex, newUserRole);

  // Replace Roles array
  const oldRolesRegex = /export const Roles = \[[^\]]*\];/;
  const newRoles = `export const Roles = [\n  'ADMIN',\n  'SALES',\n  'ENGINEERING',\n];`;
  content = content.replace(oldRolesRegex, newRoles);

  fs.writeFileSync(typesFile, content, 'utf8');
  console.log('✓ components/types.ts updated.');
}

// 2. Update SignInForm.tsx
const signInFile = path.join(frontendDir, 'components', 'SignInForm', 'SignInForm.tsx');
if (fs.existsSync(signInFile)) {
  console.log('Updating SignInForm.tsx...');
  let content = fs.readFileSync(signInFile, 'utf8');

  // Replace onboarding redirection with direct /users redirect
  const oldOnboardRegex = /const session = await getSession\(\);[\s\S]*?router\.push\(targetPath\);/;
  const newRedirect = `toast.success('Signed In');\n  router.push('/users');`;
  
  if (oldOnboardRegex.test(content)) {
    content = content.replace(oldOnboardRegex, newRedirect);
    // remove duplicate toast if present
    content = content.replace(/toast\.success\('Signed In'\);\s*toast\.success\('Signed In'\);/, "toast.success('Signed In');");
  } else {
    // fallback replace targetPath
    content = content.replace(/router\.push\(targetPath\);/, "router.push('/users');");
  }

  fs.writeFileSync(signInFile, content, 'utf8');
  console.log('✓ SignInForm.tsx updated.');
}

// 3. Update middleware.ts
const middlewareFile = path.join(frontendDir, 'middleware.ts');
if (fs.existsSync(middlewareFile)) {
  console.log('Updating middleware.ts...');
  let content = fs.readFileSync(middlewareFile, 'utf8');

  content = content.replace(
    "buildUrlWithQueryParams('/company_profile/company_information')",
    "buildUrlWithQueryParams('/users')"
  );

  fs.writeFileSync(middlewareFile, content, 'utf8');
  console.log('✓ middleware.ts updated.');
}

// 4. Update users/page.tsx
const usersPageFile = path.join(frontendDir, 'app', '[subdomain]', '(auth)', 'users', 'page.tsx');
if (fs.existsSync(usersPageFile)) {
  console.log('Updating users/page.tsx...');
  let content = fs.readFileSync(usersPageFile, 'utf8');

  const oldSwitchRegex = /if \(session !== null\) \{\s*switch \(user\?\.account\?\.current_onboarding_stage\) \{[\s\S]*?\}\s*\}/;
  content = content.replace(oldSwitchRegex, '// Onboarding bypassed: direct access to users');

  fs.writeFileSync(usersPageFile, content, 'utf8');
  console.log('✓ users/page.tsx updated.');
}

// 5. Update settings/[slug]/layout.tsx
const settingsLayoutFile = path.join(frontendDir, 'app', '[subdomain]', '(auth)', 'settings', '[slug]', 'layout.tsx');
if (fs.existsSync(settingsLayoutFile)) {
  console.log('Updating settings/[slug]/layout.tsx...');
  let content = fs.readFileSync(settingsLayoutFile, 'utf8');

  const oldSwitchRegex = /if \(session !== null\) \{\s*switch \(user\?\.account\?\.current_onboarding_stage\) \{[\s\S]*?\}\s*\}/;
  content = content.replace(oldSwitchRegex, '// Onboarding bypassed: direct access to settings');

  fs.writeFileSync(settingsLayoutFile, content, 'utf8');
  console.log('✓ settings/[slug]/layout.tsx updated.');
}

// 6. Update UserInviteForm.tsx
const userInviteFile = path.join(frontendDir, 'components', 'UserInviteForm', 'UserInviteForm.tsx');
if (fs.existsSync(userInviteFile)) {
  console.log('Updating UserInviteForm.tsx...');
  let content = fs.readFileSync(userInviteFile, 'utf8');

  content = content.replace(/role:\s*'SUSTAINABILITY_MANAGER'/g, "role: 'ADMIN'");
  content = content.replace(/role:\s*'DATA_PROVIDER'/g, "role: 'SALES'");
  content = content.replace(/role:\s*'DATA_REVIEWER'/g, "role: 'ENGINEERING'");

  fs.writeFileSync(userInviteFile, content, 'utf8');
  console.log('✓ UserInviteForm.tsx updated.');
}

// 7. Update AddorEditUser.tsx
const addEditUserFile = path.join(frontendDir, 'components', 'AddorEditUser', 'AddorEditUser.tsx');
if (fs.existsSync(addEditUserFile)) {
  console.log('Updating AddorEditUser.tsx...');
  let content = fs.readFileSync(addEditUserFile, 'utf8');

  content = content.replace(/role:\s*user\?\.role\s*\?\?\s*'SUSTAINABILITY_MANAGER'/g, "role: user?.role ?? 'ADMIN'");

  fs.writeFileSync(addEditUserFile, content, 'utf8');
  console.log('✓ AddorEditUser.tsx updated.');
}

console.log('\n🎉 Frontend updates applied successfully!');
