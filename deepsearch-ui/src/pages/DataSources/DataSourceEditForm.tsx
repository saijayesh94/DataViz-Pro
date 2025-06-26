import MySqlContent from '@/components/DataSource/MySqlContent';
import { useLocation } from '@umijs/max';
import TextSourceEditor from '../../components/DataSource/TextSourceEditor';

function DataSourceEditForm() {
  const location = useLocation();
  const type = location?.state?.type;
  const ds_name = location?.state?.data;
  const Agenytype = location?.state?.Agenytype;

  return (
    <>
      {type === 'text_source' ? (
        <TextSourceEditor db_name={ds_name} type={type} />
      ) : (
        <MySqlContent db_name={ds_name} type={type} Agenytype={Agenytype} />
      )}
    </>
  );
}

export default DataSourceEditForm;
