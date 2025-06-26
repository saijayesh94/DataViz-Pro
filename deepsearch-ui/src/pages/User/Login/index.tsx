import { Footer } from '@/components';
import { login, signup } from '@/services/ant-design-pro/api';
import { GlobalOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, Helmet, SelectLang, history, useIntl, useModel } from '@umijs/max';
import { Alert, Form, Tabs, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage: "url('/genai_ui/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr.png')",
      backgroundSize: '100% 100%',
    },
  };
});

// const ActionIcons = () => {
//   const { styles } = useStyles();

//   return (
//     <>
//       <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.action} />
//       <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.action} />
//       <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.action} />
//     </>
//   );
// };

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();

  const url = window.location.href;
  const queryString = url.split('?')[1];
  const params = new URLSearchParams(queryString);
  const tcBase64 = params.get('tc');
  const rtBase64 = params.get('rt');

  const showLoginForm: boolean = !(tcBase64 && rtBase64);

  const fetchUserInfo = async (email: string) => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo && email) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: {
            ...userInfo,
            email: email,
          },
        }));
      });
    }
  };
  console.log('Release date wework - 06-03-2025 4:00 PM');

  const handleSignup = async (values) => {
    try {
      const msg = await signup(values); // Replace with your signup API call
      if (msg.status === 'success') {
        message.success('Signup successful! Please login.');
        setType('account'); // Switch back to login tab
        form.resetFields();
      } else {
        message.error(msg.message || 'Signup failed!');
      }
    } catch (error) {
      console.error(error);
      message.error('Signup failed. Please try again.');
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    setLoading(true);
    try {
      if (type === 'account') {
        const msg = await login({ ...values, type });
        console.log('first msg', msg);
        if (msg.status === 'ok') {
          const defaultLoginSuccessMessage = intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          });
          localStorage.setItem('email', msg?.email);
          message.success(defaultLoginSuccessMessage);
          await fetchUserInfo(msg?.email);
          history.push('/');
          // return;
        } else {
          setUserLoginState(msg);
          console.log(msg);
        }
      } else if (type === 'signup') {
        // Handle Signup
        console.log('signup values', values);
        const emailverify = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        const email = values.email;
        if (!email.match(emailverify)) {
          return message.error('Please Enter a Valid Email');
        }
        if (values.password === values.confirm_password) {
          const payload = {
            name: values.username,
            mailid: values.email,
            password: values.password,
            orgName: values.orgnization_name,
          };
          handleSignup(payload);
        } else {
          message.error('Password Do Not Match');
        }
      }
    } catch (err) {
      message.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async (tc: string, rt: string) => {
    try {
      // Perform auto login
      const email = `${rt}_${tc}@digitalblanket.ai`;
      const password = 'admin@123';

      const msg = await login({ username: email, password, type });
      if (msg.status === 'ok') {
        localStorage.setItem('email', email);
        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          }),
        );
        await fetchUserInfo(email);
        history.push('/');
      } else {
        setUserLoginState(msg);
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        }),
      );
      console.error(error);
    }
  };

  useEffect(() => {
    if (tcBase64 && rtBase64) {
      const tc = atob(tcBase64);
      const rt = atob(rtBase64);
      handleAutoLogin(tc, rt);
    }
  }, []);

  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      {showLoginForm ? (
        <div
          style={{
            flex: '1',
            padding: '32px 0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
            <img alt="logo" src="/genai_ui/db_logo.svg" style={{ width: '250px' }} />
          </div>
          <LoginForm
            contentStyle={
              {
                // minWidth: 280,
                // maxWidth: '75vw',
              }
            }
            form={form}
            // logo={<img alt="logo" src="/logo.png" style={{  width: '200px'}} />}
            // title="DeepSearch"
            // subTitle="Conversational Co-Pilot on your Data"
            initialValues={{
              autoLogin: true,
            }}
            submitter={{
              searchConfig: {
                submitText: type === 'account' ? 'Login' : 'Sign Up',
              },
              loading,
            }}
            // actions={[
            //   <FormattedMessage
            //     key="loginWith"
            //     id="pages.login.loginWith"
            //     defaultMessage="其他登录方式"
            //   />,
            //   <ActionIcons key="icons" />,
            // ]}
            onFinish={async (values) => {
              await handleSubmit(values as API.LoginParams);
            }}
          >
            <Tabs
              activeKey={type}
              onChange={(e) => {
                setType(e);
                form.resetFields();
              }}
              centered
              items={[
                {
                  key: 'account',
                  label: 'Login',
                  // label: intl.formatMessage({
                  //   id: 'pages.login.accountLogin.tab',
                  //   defaultMessage: '账户密码登录',
                  // }),
                },
                {
                  key: 'signup',
                  label: 'Sign Up',
                  // label: intl.formatMessage({
                  //   id: 'pages.login.phoneLogin.tab',
                  //   defaultMessage: '手机号登录',
                  // }),
                },
              ]}
            />

            {status === 'error' && loginType === 'account' && (
              <LoginMessage
                content={intl.formatMessage({
                  id: 'pages.login.accountLogin.errorMessage',
                  defaultMessage: '账户或密码错误(admin/ant.design)',
                })}
              />
            )}
            {type === 'account' && (
              <>
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined />,
                  }}
                  placeholder={intl.formatMessage({
                    id: 'pages.login.username.placeholder',
                    defaultMessage: '用户名: admin or user',
                  })}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.login.username.required"
                          defaultMessage="请输入用户名!"
                        />
                      ),
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                  }}
                  placeholder={'Password'}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.login.password.required"
                          defaultMessage="请输入密码！"
                        />
                      ),
                    },
                  ]}
                />
              </>
            )}

            {status === 'error' && loginType === 'signup' && <LoginMessage content="验证码错误" />}
            {type === 'signup' && (
              // <>
              //   <ProFormText
              //     fieldProps={{
              //       size: 'large',
              //       prefix: <MobileOutlined />,
              //     }}
              //     name="mobile"
              //     placeholder={intl.formatMessage({
              //       id: 'pages.login.phoneNumber.placeholder',
              //       defaultMessage: '手机号',
              //     })}
              //     rules={[
              //       {
              //         required: true,
              //         message: (
              //           <FormattedMessage
              //             id="pages.login.phoneNumber.required"
              //             defaultMessage="请输入手机号！"
              //           />
              //         ),
              //       },
              //       {
              //         pattern: /^1\d{10}$/,
              //         message: (
              //           <FormattedMessage
              //             id="pages.login.phoneNumber.invalid"
              //             defaultMessage="手机号格式错误！"
              //           />
              //         ),
              //       },
              //     ]}
              //   />
              //   <ProFormCaptcha
              //     fieldProps={{
              //       size: 'large',
              //       prefix: <LockOutlined />,
              //     }}
              //     captchaProps={{
              //       size: 'large',
              //     }}
              //     placeholder={intl.formatMessage({
              //       id: 'pages.login.captcha.placeholder',
              //       defaultMessage: '请输入验证码',
              //     })}
              //     captchaTextRender={(timing, count) => {
              //       if (timing) {
              //         return `${count} ${intl.formatMessage({
              //           id: 'pages.getCaptchaSecondText',
              //           defaultMessage: '获取验证码',
              //         })}`;
              //       }
              //       return intl.formatMessage({
              //         id: 'pages.login.phoneLogin.getVerificationCode',
              //         defaultMessage: '获取验证码',
              //       });
              //     }}
              //     name="captcha"
              //     rules={[
              //       {
              //         required: true,
              //         message: (
              //           <FormattedMessage
              //             id="pages.login.captcha.required"
              //             defaultMessage="请输入验证码！"
              //           />
              //         ),
              //       },
              //     ]}
              //     onGetCaptcha={async (phone) => {
              //       const result = await getFakeCaptcha({
              //         phone,
              //       });
              //       if (!result) {
              //         return;
              //       }
              //       message.success('获取验证码成功！验证码为：1234');
              //     }}
              //   />
              // </>
              <>
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined />,
                  }}
                  placeholder="First Name"
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage id="1" defaultMessage="Please Enter Your Username" />
                      ),
                    },
                  ]}
                />

                <ProFormText
                  name="email"
                  fieldProps={{
                    size: 'large',
                    prefix: <MailOutlined />,
                  }}
                  placeholder="Email"
                  rules={[
                    {
                      required: true,
                      message: <FormattedMessage id="2" defaultMessage="Please Enter Your Email" />,
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                  }}
                  placeholder="Password"
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage id="3" defaultMessage="Please Enter Your Password" />
                      ),
                    },
                  ]}
                />

                <ProFormText.Password
                  name="confirm_password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                  }}
                  placeholder="Confirm Password"
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="4"
                          defaultMessage="Please Enter Your Confirm Password"
                        />
                      ),
                    },
                  ]}
                />

                <ProFormText
                  name="orgnization_name"
                  fieldProps={{
                    size: 'large',
                    prefix: <GlobalOutlined />,
                  }}
                  placeholder="Orgnization Name"
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="5"
                          defaultMessage="Please Enter Your orgnization name"
                        />
                      ),
                    },
                  ]}
                />
              </>
            )}
            {type === 'account' && (
              <div
                style={{
                  marginBottom: 24,
                }}
              >
                <ProFormCheckbox noStyle name="autoLogin">
                  <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
                </ProFormCheckbox>
                <a
                  style={{
                    float: 'right',
                  }}
                >
                  <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
                </a>
              </div>
            )}
          </LoginForm>
          <Footer />
        </div>
      ) : null}
    </div>
  );
};

export default Login;
