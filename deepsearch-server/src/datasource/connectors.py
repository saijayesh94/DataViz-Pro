import mysql.connector
from mysql.connector import pooling

from dotenv import load_dotenv
from utils.logger import CustomLogger

load_dotenv()

class DataSourceConnector:

    @staticmethod
    def connect(db_params):
        try:
            if isinstance(db_params, dict):
                # Extract connection parameters from the dictionary
                host = db_params['host']
                username = db_params['username']
                password = db_params['password']
            else:
                # Extract connection parameters from an object with credentials attribute
                host = db_params.credentials.host
                username = db_params.credentials.username
                password = db_params.credentials.password

            connection_pool = pooling.MySQLConnectionPool(
                pool_name="mypool",
                pool_size=1,
                host=host,
                user=username,
                password=password
            )
            
            return connection_pool

        except mysql.connector.Error as e:
            CustomLogger.error(f"Error connecting to the datasource: {e}")
            return {"status": "fail", "message": "Error connecting to the datasource", "error": e}
        
    @staticmethod
    def test_connection(ins_ds):
        '''
        Tests if a connection to a MySQL database can be established using the given datasource credentials.
        '''
        try:
            # Attempt to establish a connection using the given datasource credentials
            conn_obj = DataSourceConnector.connect(ins_ds)  

            CustomLogger.info(f"Test Connection to Datasource: {ins_ds.ds_name} successfull!")
            conn_obj.get_connection().close()  # Close the connection
            return True

        except Exception as e:
            CustomLogger.error(f"Test Connection to Datasource: {ins_ds.ds_name} failed!: {e}")
            return False

# --------------------------------------------------------------------------------------------------------

    # @staticmethod
    # def connect_ds(conn_ds):
    #     try:
    #         conn_obj = DataSourceConnector.connection(conn_ds)
    #         CustomLogger.info(f"Connection to Datasource: {conn_ds.db_name} successfull!")
    #         return {"ds_conn_obj": conn_obj}
                    
    #     except Exception as e:
    #         CustomLogger.error(f"Connection to Datasource: {conn_ds.db_name} failed!: {e}")

    # @staticmethod
    # def connection(conn_ds):
    #     try:
    #         connection = pooling.MySQLConnectionPool(
    #             pool_name="my_pool",
    #             pool_size=1,
    #             user=conn_ds.credentials.username,
    #             password=conn_ds.credentials.password,
    #             host=conn_ds.credentials.host,
    #         )
            
    #         if connection is not None:
    #             return connection
        
    #     except mysql.connector.Error as e:
    #         CustomLogger.error(f"Connection to Datasource: {conn_ds.datasource_name} failed!: {e}")


        # def connect(db_params):
        # try:
        #     if isinstance(db_params, dict):
        #         connection_pool = pooling.MySQLConnectionPool(
        #                                         pool_name="mypool",
        #                                         pool_size=1,
        #                                         host=db_params['host'],
        #                                         user=db_params['username'],
        #                                         password=db_params['password']
        #                                     )
                
        #         return connection_pool
            
        #     else:
        #         connection = pooling.MySQLConnectionPool(
        #                                         pool_name="my_pool",
        #                                         pool_size=1,
        #                                         user=db_params.credentials.username,
        #                                         password=db_params.credentials.password,
        #                                         host=db_params.credentials.host,
        #                                     )
            
        #         if connection is not None:
        #             return connection