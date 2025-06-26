import React from 'react'
import { Tabs } from 'antd';
import UnStructuredContent from './UnStructuredContent';

function UnStructuredTab() {
  return (
    <Tabs
        defaultActiveKey="1"
        tabPosition={'left'}
        items={[
          {
            label: 'Text',
            key: '1',
            children: <UnStructuredContent />,
     
          },
          {
            label: 'Pdf',
            key: '2',
            children: <UnStructuredContent  />,
            
          }  
        ]}
      />
  )
}

export default UnStructuredTab