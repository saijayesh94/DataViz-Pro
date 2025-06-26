// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import axios from 'axios';
import { baseURL } from '../../baseurl.js';

const BASE_URL = baseURL;
console.log('baseurl', BASE_URL);

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  // return request<{
  //   data: API.CurrentUser;
  // }>('/api/currentUser', {
  //   method: 'GET',
  //   ...(options || {}),
  // });
  return {
    success: true,
    data: {
      name: 'Admin',
      avatar: '/genai_ui/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      email: 'waeez@deepnetlabs.com',
      signature: '海纳百川，有容乃大',
      title: '交互专家',
      group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
      tags: [
        {
          key: '0',
          label: '很有想法的',
        },
        {
          key: '1',
          label: '专注设计',
        },
        {
          key: '2',
          label: '辣~',
        },
        {
          key: '3',
          label: '大长腿',
        },
        {
          key: '4',
          label: '川妹子',
        },
        {
          key: '5',
          label: '海纳百川',
        },
      ],
      notifyCount: 12,
      unreadCount: 11,
      country: 'China',
      access: 'admin',
      geographic: {
        province: {
          label: '浙江省',
          key: '330000',
        },
        city: {
          label: '杭州市',
          key: '330100',
        },
      },
      address: '西湖区工专路 77 号',
      phone: '0752-268888888',
    },
  };
}

/** 退出登录接口 POST /api/login/outLogin */
// export async function outLogin(options?: { [key: string]: any }) {
//   return request<Record<string, any>>('/api/login/outLogin', {
//     method: 'POST',
//     ...(options || {}),
//   });
// }
export async function outLogin() {
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/api/login/outLogin',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.request(config);
    console.log('api response data', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/** 登录接口 POST /api/login/account */
// export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
//   return request<API.LoginResult>('/api/login/account', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: body,
//     ...(options || {}),
//   });
// }

export async function login(payload: Object) {
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/api/login/account',
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    };

    const response = await axios.request(config);
    console.log('api response data', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function signup(payload: Object) {
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/signup_user',
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    };

    const response = await axios.request(config);
    console.log('api response data', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

// export async function getConversations(conversationId: string = '', user_id: any) {
//   try {
//     let data = JSON.stringify({
//       user_id: user_id,
//       conversation_id: conversationId,
//     });

//     let config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: BASE_URL + '/get_conversations',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       data: data,
//     };
//     const response = await axios.request(config);
//     return response.data
//   } catch (error) {
//     throw error;
//   }

// }

export async function getConversations(
  conversationId: string = '',
  user_id: any,
  cache_data: boolean = true,
) {
  try {
    // Prepare the request data
    const data = JSON.stringify({
      user_id: user_id,
      conversation_id: conversationId,
      cache_data: cache_data,
    });

    // Configure the request
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/get_conversations',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    const response = await axios.request(config);

    if (conversationId === '' || cache_data !== true) {
      return response.data;
    }

    const { resp_obj } = response.data;
    if (resp_obj && resp_obj.conversation) {
      const updatedConversation = resp_obj.conversation.map((item: any) => {
        if (item.role === 'user') {
          return item;
        } else if (item.role === 'assistant') {
          try {
            // Parse cache_data from assistant role
            // return JSON.parse(item.cache_data);
            return item.cache_data;
          } catch (error) {
            console.error('Error parsing cache_data:', error);
            return item; // Fallback to original item if parsing fails
          }
        }
        return item;
      });

      // Return the entire response with the modified conversation
      return {
        ...response.data,
        resp_obj: {
          ...resp_obj,
          conversation: updatedConversation,
        },
      };
    } else {
      // Return the response with an empty conversation if none found
      return {
        ...response.data,
        resp_obj: {
          ...resp_obj,
          conversation: [],
        },
      };
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

export async function chat(payload: any, user_id: any) {
  try {
    let data = JSON.stringify({
      user_id: user_id,
      // db_name: 'prohance_operations_view',
      // model_name: 'gpt-35-turbo-16k',
      ...payload,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/chat',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    console.log('api response data', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteConversation(conversationId: string = '') {
  try {
    let data = JSON.stringify({
      conversation_id: conversationId,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/delete_chat',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function UpdateConversationTitle(payload: any) {
  try {
    let data = JSON.stringify({
      // ds_name: 'prohance_operations_view', // can comment
      ...payload,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/update_title',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getDashBoard(
  dashboard_id = null,
  user_id: any,
  cache_data: boolean = true,
  signal = null,
) {
  try {
    let data = JSON.stringify({
      dashboard_id: dashboard_id,
      // ds_name: 'prohance_operations_view', // can comment
      user_id: user_id,
      cache_data: cache_data,
    });

    let config = {
      method: 'post',
      signal: signal,
      maxBodyLength: Infinity,
      url: BASE_URL + '/dashboards/fetch',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function addDashboardAndGroups(
  dashboard_name: string,
  group_name: string | null = null,
  dashboard_id: string | null = null,
  user_id: any,
) {
  try {
    let data = JSON.stringify({
      // ds_name: null,
      user_id: user_id,
      dashboard_id: dashboard_id,
      dashboard_name: dashboard_name,
      group_name: group_name,
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/dashboards/add',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function saveItems(
  conversation_id: string,
  conversation_index: string,
  column_data: any,
  chart_rec: any,
  dashboard_id: string,
  group_id: string,
  item_title: string,
  user_id: any,
  schemaName: any,
  custom_style: any | null = null,
) {
  try {
    let data = JSON.stringify({
      ds_name: schemaName,
      user_id: user_id,
      conversation_id: conversation_id,
      conversation_index: conversation_index,
      column_data: column_data,
      chart_rec: chart_rec,
      dashboard_id: dashboard_id,
      group_id: group_id,
      item_title: item_title,
      custom_style: custom_style,
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/dashboards/save_item',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateData(
  dashboard_id: string,
  dashboard_name: string | null = null,
  groups: any | null = null,
  user_id: any,
) {
  try {
    let data = JSON.stringify({
      // ds_name: 'prohance_operations_view', // can comment
      user_id: user_id,
      dashboard_id: dashboard_id,
      dashboard_name: dashboard_name,
      groups: groups,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/dashboards/update',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteDashBoard(dashboard_id: string, user_id: any) {
  try {
    let data = JSON.stringify({
      // ds_name: null, // can comment
      user_id: user_id,
      dashboard_id: dashboard_id,
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/dashboards/delete',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}
export async function getAllAgents() {
  try {
    const response = await axios.post(BASE_URL + '/fetch_all_agents', null, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // axios automatically parses JSON
  } catch (error) {
    console.error('Error in getAllAgents:', error); // Log the actual error
    throw error;
  }
}

export async function getAllDataSources() {
  try {
    let data = JSON.stringify({
      datasource_id: '',
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/get_datasources',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function saveFewShot(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/save_to_prompt',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function insertDataSource(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/insert_datasource',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function insertAgent(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/insert_agent',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getDataSourceDetails(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/get_data_source_details',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function modifyTextSource(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/get_data_source_details/modify_text_source',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function generateInsight(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/generate_insight',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function generatePrompt(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/generate_prompt',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// export async function SyncConversations(payload: any) {
//   try {
//     let data = JSON.stringify(payload);

//     let config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: BASE_URL + '/sync_conversations',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       data: data,
//     };

//     const response = await axios.request(config);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

export async function SyncMessage(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/sync_message',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function likeDisLike(payload: any) {
  const data = JSON.stringify(payload);
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/feedback',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function AddUser(payload: any) {
  const data = JSON.stringify(payload);
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/insert_user',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function FetchUser(payload: any) {
  const data = JSON.stringify(payload);
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/fetch_users',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function testPreview(payload: any) {
  const data = JSON.stringify(payload);
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/testpreview',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }

}

export async function updateTimestampsInQuery(payload: any) {
  const data = JSON.stringify(payload);
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/updatetimestampsinquery',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function AutoFill(payload: any) {
  try {
    let data = JSON.stringify(payload);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BASE_URL + '/autofilltextsource',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios.request(config);
    console.log(response.headers);
    return response.data;
  } catch (error) {
    throw error;
  }
}
