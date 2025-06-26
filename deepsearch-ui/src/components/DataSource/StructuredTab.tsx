import React from 'react'
import StructuredContent from '@/components/DataSource/SturcturedContent';
import { Tabs } from 'antd';
import mysql from '../../images/mysql.png';
import postgress from '../../images/postgress.png';
import snowflake from '../../images/snowflak.png';



function StructuredTab({mode,data}) {
  return (
    <Tabs
        defaultActiveKey="1"
        tabPosition={'left'}
        items={[
          {
            label: 'MySQL',
            key: '1',
            children: <StructuredContent mode={mode} data={data} />,
            icon: <img src={mysql} width={20} />,
          },

          {
            label: 'PostgreSQL',
            key: '2',
            children: <StructuredContent mode={mode} data={data} />,
            icon: <img src={postgress} width={20} />,
          },
          {
            label: 'Snowflake',
            key: '3',
            children: <StructuredContent mode={mode} data={data} />,
            icon: <img src={snowflake} width={20} />,
          },
          // {
          //   label: 'BigQuery',
          //   key: '4',
          //   children: <StructuredContent />,
          //   icon: <AppleOutlined />,
          // },
          // {
          //   label: 'MySQL',
          //   key: '5',
          //   children: <StructuredContent />,
          //   icon: <AppleOutlined />,
          // },
          // {
          //   label: 'Supabase',
          //   key: '6',
          //   children: <StructuredContent />,
          //   icon: <AppleOutlined />,
          // },
          // {
          //   label: 'MariaDB',
          //   key: '7',
          //   children: <StructuredContent />,
          //   icon: <AppleOutlined />,
          // },
          // {
          //   label: 'Redshift',
          //   key: '8',
          //   children: <StructuredContent />,
          //   icon: <AppleOutlined />,
          // },
          // {
          //   label: 'SQL Server',
          //   key: '9',
          //   children: <StructuredContent />,
          //   icon: <AppleOutlined />,
          // },
          // {
          //   label: 'DataBricks',
          //   key: '10',
          //   children: <StructuredContent />,
          //   icon: <AppleOutlined />,
          // },
        ]}
      />
  )
}

export default StructuredTab