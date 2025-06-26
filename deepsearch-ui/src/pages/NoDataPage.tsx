import { useModel, useNavigate } from '@umijs/max';
import { Result } from 'antd';
import { useEffect } from 'react';

function NoDataPage() {
  const { initialState } = useModel('@@initialState');
  const dashboard = initialState?.currentUser?.dashBoardMenuData;
  const navigate = useNavigate();

  useEffect(() => {
    if (dashboard?.length > 0) {
      const firstdashboard = dashboard[0];
      const id = firstdashboard._id;
      console.log('id', id);
      console.log('fisrtdashboard', firstdashboard);
      navigate(`/dashboard/${id}`);
    }
  }, [dashboard, navigate]);

  if (dashboard?.length > 0) {
    return null;
  }

  return (
    <Result
      // status="404"
      title="No Dashboard"
      subTitle="Sorry, no dashboard saved"
    />
  );
}

export default NoDataPage;
