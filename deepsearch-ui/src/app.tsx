import { AvatarDropdown, AvatarName, Footer, Question, SelectLang } from '@/components';
import {
  getConversations,
  getDashBoard,
  outLogin,
  currentUser as queryCurrentUser,
} from '@/services/ant-design-pro/api';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
const isDev = false; //process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
// const allowed_emails = ['jayesh1@flamencotech.com'];
const allowed_domains = ['deepnetlabs.com'];
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      console.log('msg', msg);
      if (!localStorage.getItem('email')) await outLogin();
      else msg.data.email = localStorage.getItem('email');
      // msg.data.superAdmin = msg.data.email.endsWith('deepnetlabs.com');
      msg.data.superAdmin = allowed_domains.some((domain) => msg.data.email.endsWith(domain));
      const conversationMenuData = await getConversations('', localStorage.getItem('email'));
      const dashBoardMenuData = await getDashBoard(null, localStorage.getItem('email'));

      msg.data.conversationMenuData = conversationMenuData.resp_obj;
      msg.data.dashBoardMenuData = dashBoardMenuData.resp_obj;
      return msg.data;
    } catch (error) {
      const url = window.location.href;
      console.log('url', url);
      // Create a URLSearchParams object
      // const params = new URLSearchParams(url);
      const queryString = url.split('?')[1]; // Splits the URL and takes the part after '?'
      history.push(loginPath + '?' + queryString);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<Question key="doc" />, <SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        const url = window.location.href;
        console.log('url', url);
        // Create a URLSearchParams object
        // const params = new URLSearchParams(url);
        const queryString = url.split('?')[1]; // Splits the URL and takes the part after '?'
        history.push(loginPath + '?' + queryString);
      }
    },
    bgLayoutImgList: [
      {
        src: '/genai_ui/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr.webp',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: '/genai_ui/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr.webp',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: '/genai_ui/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr.webp',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    // links: isDev
    //   ? [
    //       <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //     ]
    //   : [],
    // menuHeaderRender: undefined,
    menu: {
      // Re-execute request whenever initialState?.currentUser?.userid is modified
      params: {
        userId: initialState?.currentUser?.userid,
        conversationMenuData: initialState?.currentUser?.conversationMenuData,
        dashBoardMenuData: initialState?.currentUser?.dashBoardMenuData,
      },
      request: async (params, defaultMenuData) => {
        // initialState.currentUser contains all user information
        // const menuData = { status: "success", message: "", resp_obj: [{ title: "Title1", _id: "dsfdsf" }, { title: "Title2", _id: "dsfdsffdf" }] }//await getConversations()
        // const menuData = await getConversations();
      
        const conversationMenuData = params.conversationMenuData;
        const dashBoardMenuData = params.dashBoardMenuData;
        // if (menuData.status === "success" && menuData.resp_obj.length > 0) {
        console.log('conversationMenu',conversationMenuData)
        console.log('dashboardMenuData',dashBoardMenuData)
        console.log('defaultMenuData',defaultMenuData)


        for (let key in defaultMenuData) {
          console.log('key',key)
          if (defaultMenuData.hasOwnProperty(key)) {
            if (defaultMenuData[key].name === 'conversations') {
              
              let convList = [
                {
                  path: '/conversations',
                  redirect: '/conversations/new',
                },
                {
                  path: '/conversations/new',
                  name: 'new-chat',
                  // component: './Welcome',
                },
              ];
              for (const conv of conversationMenuData) {
                convList.push({
                  path: `/conversations/${conv?._id}`,
                  name: `${conv?.title}`,
                  // component: './Welcome',
                });
              }
              defaultMenuData[key].children = convList;
            }
            if (defaultMenuData[key].name === 'dashboard') {            
              let dashBoardList = [];
              for (const dash of dashBoardMenuData) {    
                dashBoardList.push({
                  path: `/dashboard/${dash?._id}`,
                  name: `${dash?.name}`,
                  // component: './Dashboard',
                });
              }
              console.log('dashboardList',dashBoardList)
              defaultMenuData[key].children = dashBoardList;
            }
            
            const menuItem = defaultMenuData[key];
            console.log('defaukt menu data', menuItem);
            const userEmail = initialState?.currentUser?.email;
            const isSuperAdmin = initialState?.currentUser?.superAdmin;
            const isAdministrator = userEmail?.startsWith('ADMINISTRATOR')
            console.log('is administrartion',isAdministrator)


            // let data = localStorage.getItem('accesslist');
            // const accessList = JSON.parse(data);
            // console.log('accessList',accessList)

            // if (accessList.length > 0) {
            //   console.log('accesslist')
            //   if (!accessList.includes(menuItem.name)) {
            //     delete defaultMenuData[key];
            //   }
            // }

            if(!(isSuperAdmin || isAdministrator)){
              if (['Data Sources', 'Agents','Settings'].includes(menuItem.name)) {
                    delete defaultMenuData[key];
              }          
            }

            // if (allowed_emails.includes(userEmail)) {
            //   if (['Data Sources', 'Agents', 'conversations'].includes(menuItem.name)) {
            //     delete defaultMenuData[key];
            //   }
            // } else if (!isSuperAdmin) {
            //   if (['Data Sources', 'Agents'].includes(menuItem.name)) {
            //     delete defaultMenuData[key];
            //   }
            // }

            // if (userEmail?.startsWith('ADMINISTRATOR')) {
            //   if (menuItem.name === 'Agents') {
            //     delete defaultMenuData[key];
            //   }
            // } else if (allowed_emails.includes(userEmail)) {
            //   if (['Data Sources', 'Agents', 'conversations'].includes(menuItem.name)) {
            //     delete defaultMenuData[key];
            //   }
            // } else if (!isSuperAdmin) {
            //   if (['Data Sources', 'Agents'].includes(menuItem.name)) {
            //     delete defaultMenuData[key];
            //   }
            // }
          }
          // }
        }

        console.log('MENU DATA:', defaultMenuData);
        console.log('defaultMenuData after for loop',defaultMenuData)

        return defaultMenuData;
      },

    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};

// New routes
// let extraRoutes: any = false;

// export async function render(oldRender: any) {
//   getConversations()
//     .then((data) => {
//       extraRoutes = data;
//       console.log("ALLLung", JSON.stringify(data));
//       oldRender();
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }

// export function patchRoutes(routes: any) {
//   if (extraRoutes) {
//     routes.routes.test = extraRoutes
//     console.log("ROUTIN", routes)
//   }
// }

// export async function render(oldRender: any) {
//   extraRoutes = { name: 'list.table-list1s', icon: 'smile', path: '/list123', parentId: 'ant-design-pro-layout', id: '6' };
//   setTimeout(oldRender, 1000);
//   getConversations()
//   .then((data) => {
//     extraRoutes = { name: 'list.table-list1s', icon: 'smile', path: '/list123', parentId: 'ant-design-pro-layout', id: '6' };
//     console.log("ALLLung", JSON.stringify(data));
//     console.log("PATCH", extraRoutes)
//     oldRender();
//   })
//   .catch((error) => {
//     console.log(error);
//   });
// }
