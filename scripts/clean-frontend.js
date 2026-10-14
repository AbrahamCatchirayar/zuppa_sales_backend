const fs = require('fs');
const path = require('path');

const frontendDir = path.resolve(__dirname, '../../zuppa_sales_frontend');
console.log('Target Frontend Directory:', frontendDir);

if (!fs.existsSync(frontendDir)) {
  console.error('Frontend directory not found at:', frontendDir);
  process.exit(1);
}

// 1. Delete legacy routes in app/[subdomain]/(auth)
const authRoutesDir = path.join(frontendDir, 'app', '[subdomain]', '(auth)');
const legacyRoutes = [
  'analytics',
  'dashboard',
  'data_cubes',
  'department_dashboard',
  'disclosure',
  'editor',
  'insights',
  'report',
  'tasks',
];

legacyRoutes.forEach((route) => {
  const target = path.join(authRoutesDir, route);
  if (fs.existsSync(target)) {
    console.log(`Deleting legacy route: ${route}`);
    fs.rmSync(target, { recursive: true, force: true });
  }
});

// 2. Update home/page.tsx to redirect to /users
const homePageFile = path.join(authRoutesDir, 'home', 'page.tsx');
if (fs.existsSync(homePageFile)) {
  console.log('Updating home/page.tsx to redirect to /users');
  const homeContent = `import { redirect } from 'next/navigation';

export default function page() {
  redirect('/users');
}
`;
  fs.writeFileSync(homePageFile, homeContent, 'utf8');
}

// 3. Update LandingLayout.tsx
const landingLayoutFile = path.join(frontendDir, 'components', 'Layout', 'LandingLayout.tsx');
if (fs.existsSync(landingLayoutFile)) {
  console.log('Updating LandingLayout.tsx');
  const landingContent = `'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineSetting } from 'react-icons/ai';
import { MdOutlineLogout } from 'react-icons/md';
import { useUser } from '../Context/userProvider';
import Header, { IMenuItem, IProfileItem } from '../Header/Header';

export default function LandingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = useUser();
  const pathname = usePathname();
  useEffect(() => {
    if (context) {
      context?.getCurrentUser();
    }
  }, []);

  const rootMenu: IMenuItem[] = [
    {
      label: 'Users',
      path: '/users',
    },
    {
      label: 'Roles & Access',
      path: '/settings/roles',
    },
  ];

  const profileMenu: IProfileItem[] = [
    {
      label: 'Settings',
      path: '/settings/profile',
      icon: <AiOutlineSetting size={20} />,
    },
    {
      label: 'Logout',
      path: '/sign_in',
      icon: <MdOutlineLogout size={20} />,
    },
  ];

  return (
    <div>
      <Header
        user={context?.currentUser}
        menuItems={rootMenu}
        profileMenu={profileMenu}
        pathname={pathname}
      />
      <div
        className="pb-5 px-3 px-md-5"
        style={{
          background: 'var(--bgColor)',
          minHeight: 'calc(100vh - 10.2vh)',
          maxHeight: 'calc(100% - 10.2%)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(landingLayoutFile, landingContent, 'utf8');
}

// 4. Update AuthLayout.tsx
const authLayoutFile = path.join(frontendDir, 'components', 'Layout', 'AuthLayout.tsx');
if (fs.existsSync(authLayoutFile)) {
  console.log('Updating AuthLayout.tsx');
  let authLayoutContent = fs.readFileSync(authLayoutFile, 'utf8');
  
  // Replace isLanding array
  const oldLandingRegex = /const isLanding = \[[^\]]*\]\.some\(/s;
  const newLanding = `const isLanding = [
    '/users',
    '/settings',
    '/home',
    '/access_denied',
  ].some(`;
  
  authLayoutContent = authLayoutContent.replace(oldLandingRegex, newLanding);
  fs.writeFileSync(authLayoutFile, authLayoutContent, 'utf8');
}

// 5. Update settings/[slug]/layout.tsx
const settingsLayoutFile = path.join(authRoutesDir, 'settings', '[slug]', 'layout.tsx');
if (fs.existsSync(settingsLayoutFile)) {
  console.log('Updating settings/[slug]/layout.tsx');
  const settingsLayoutContent = `import ChangeAvatar from '@/components/ChangeAvatar/ChangeAvatar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/PageHeaderWrapper';
import { SettingsNavBar } from '@/components/SettingsNavBar/SettingsNavBar';
import { auth } from '@/lib/auth';
import { IUser } from '@/lib/interface/IUser.interface';
import { RoleService, UserService } from '@/lib/service';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FaRegUserCircle } from 'react-icons/fa';
import { FaUsersGear } from 'react-icons/fa6';
import { RiBarChart2Line, RiLockPasswordLine } from 'react-icons/ri';

export default async function layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const session = await auth();
  if (!session) {
    return redirect('/sign_in');
  }
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  const accessToken = (session?.user as unknown as { accessToken: string })
    ?.accessToken;
  const userRes = await UserService.getCurrentUser(apiKey, accessToken);
  const res = await RoleService.getCurrentAccess(apiKey, accessToken);
  const { access } = (res?.data || {}) as {
    access: Record<string, string[]>;
  };

  const { user, success } = (userRes?.data || {}) as {
    user: IUser;
    success: boolean;
  };

  if (!success) {
    return redirect('/sign_in');
  }

  const menu = [
    {
      text: 'Profile',
      subText: 'Personal details',
      settingIcon: <FaRegUserCircle size={24} />,
    },
    {
      text: 'Change Password',
      subText: 'Password details',
      settingIcon: <RiLockPasswordLine size={24} />,
    },
  ];

  const additionalMenu = [
    {
      text: 'Company Profile',
      subText: 'Company details',
      settingIcon: <RiBarChart2Line size={24} />,
    },
    {
      text: 'Roles',
      subText: 'Roles details',
      settingIcon: <FaUsersGear size={24} />,
    },
  ];

  const hasAccess = (feature: string) => access?.SETTINGS?.includes(feature);
  const filteredItems = additionalMenu.filter((item) =>
    user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || hasAccess(item.text?.toLocaleUpperCase()?.replaceAll(' ', '_')),
  );

  return (
    <PageHeaderWrapper
      title="Settings"
      breadCrumbConfig={{
        parent: { label: 'Settings', path: '/settings/profile' },
        current: {
          label: params?.slug?.toLocaleUpperCase()?.replaceAll('_', ' '),
        },
      }}
    >
      <Row className="g-3">
        <Col md={3}>
          <div className="bg-white p-3 rounded-2">
            <ChangeAvatar
              apiKey={apiKey}
              user={user}
              userRole={user?.role}
              accessToken={accessToken}
            />
            <hr />
            <SettingsNavBar menu={menu} isRadius />
            {filteredItems.length > 0 && (
              <>
                <hr />
                <SettingsNavBar menu={filteredItems} isRadius />
              </>
            )}
          </div>
        </Col>
        <Col md={9}>
          <div className="bg-white rounded-2">{children}</div>
        </Col>
      </Row>
    </PageHeaderWrapper>
  );
}
`;
  fs.writeFileSync(settingsLayoutFile, settingsLayoutContent, 'utf8');
}

// 6. Update settings/[slug]/page.tsx
const settingsPageFile = path.join(authRoutesDir, 'settings', '[slug]', 'page.tsx');
if (fs.existsSync(settingsPageFile)) {
  console.log('Updating settings/[slug]/page.tsx');
  const settingsPageContent = `import AccessWrapper from '@/components/AccessWrapper/AccessWrapper';
import AddorEditUser from '@/components/AddorEditUser/AddorEditUser';
import ChangePassword from '@/components/ChangePassword/ChangePassword';
import CompanyInformationForm from '@/components/CompanyInformationForm/CompanyInformationForm';
import PageNotFound from '@/components/PageNotFound/PageNotFound';
import RolesAndAccess from '@/components/RolesAndAccess/RolesAndAccess';
import { auth } from '@/lib/auth';
import { IUser } from '@/lib/interface/IUser.interface';
import { RoleService, UserService } from '@/lib/service';
import { redirect } from 'next/navigation';
import './SettingsLayout.css';

export default async function page({ params }: { params: { slug?: string } }) {
  const session = await auth();
  if (!session) {
    return redirect('/sign_in');
  }
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  const accessToken = (session?.user as unknown as { accessToken: string })
    ?.accessToken;
  const id = (session?.user as IUser)?.id;
  const userRes = await UserService.getCurrentUser(apiKey, accessToken);

  const { user } = (userRes?.data || {}) as {
    user: IUser;
    success: boolean;
  };

  const ReRender = async () => {
    switch (params.slug) {
      case 'profile':
        return {
          title: 'My Profile',
          subTitle: 'Edit your Profile here',
          components: (
            <AddorEditUser apiKey={apiKey} isCurrentUser user={user} id={id} />
          ),
        };
      case 'change_password':
        return {
          title: 'Change Password',
          subTitle: 'Change your Password',
          components: <ChangePassword slug={apiKey} />,
        };
      case 'company_profile':
        return {
          title: 'Company Details',
          subTitle: 'Edit your Company details here',
          components: (
            <AccessWrapper module="ORGANIZATION" feature="READ">
              <CompanyInformationForm slug={apiKey} account={user?.account} />
            </AccessWrapper>
          ),
        };
      case 'roles': {
        const resp = await RoleService.getRoleConfig(apiKey, accessToken);
        return {
          title: 'Roles And Access',
          subTitle: 'Edit Roles and Access here',
          components: (
            <AccessWrapper module="SETTINGS" feature="ROLES">
              <RolesAndAccess roleAccess={resp?.data} slug={apiKey} />
            </AccessWrapper>
          ),
        };
      }
      default:
        return {
          title: '',
          components: <PageNotFound isAccessDenied />,
        };
    }
  };

  const getComponent = async (role: string, slug: string) => {
    const component = (await ReRender())?.components;

    if (role === 'ADMIN' || role === 'SUPERADMIN') {
      return component;
    }

    if (['company_profile', 'roles'].includes(slug)) {
      return (
        <AccessWrapper module="SETTINGS" feature={slug.toUpperCase()}>
          {component}
        </AccessWrapper>
      );
    }

    return component;
  };

  return (
    <div className="p-3 p-md-4">
      {params?.slug !== 'roles' && (
        <div className=" pb-5">
          <span className="settings-subtitle">
            {(await ReRender())?.subTitle}
          </span>
          <h4 className="fw-700 mb-0">{(await ReRender())?.title}</h4>
        </div>
      )}
      {await getComponent(user?.role, params?.slug as string)}
    </div>
  );
}
`;
  fs.writeFileSync(settingsPageFile, settingsPageContent, 'utf8');
}

console.log('✓ Frontend cleanup script finished successfully.');
