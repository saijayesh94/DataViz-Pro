from utils.logger import CustomLogger
from database.manager import DataBaseManager

class SchemaDescription:

    @staticmethod
    def get_datasource_schema(ds_conn_obj, ds_req):
        '''
         Retrieves the schema of a MySQL database including tables, columns, and foreign key relationships.
    
        Parameters:
        ds_conn_obj (object): An object that provides a method to get a connection to the MySQL database.
        ds_req (object): An object that contains necessary details of the datasource like ds_name.
        
        Returns:
        dict: A dictionary containing the database name and its schema description.
        '''
        connection = ds_conn_obj.get_connection()
        with connection.cursor() as cursor:
            cursor.execute("USE {}".format(ds_req.ds_name))
            schema = {"tables": []}
            cursor.execute("SHOW FULL TABLES WHERE Table_Type = 'VIEW'")
            # cursor.execute("SHOW TABLES")

            tables = [table[0] for table in cursor.fetchall()]
            CustomLogger.info(f"Checking tables: {tables}")

            for table_name in tables:
                table_schema = {
                    "table_name": table_name,
                    "schema": ds_req.ds_name, 
                    "synonyms": "",  
                    "description": "",  
                    "columns": [],
                    "join": "null"  
                }

                # Retrieve column information
                cursor.execute(f"DESCRIBE {table_name}")
                columns = cursor.fetchall()
                for column_info in columns:
                    column_name = column_info[0]
                    data_type = column_info[1]
                    display_name = ""
                    description = ""

                    column_schema = {
                        "column_name": column_name,
                        "data_type": data_type,
                        "display_name": display_name,
                        "description": description,
                        "enable": None
                    }

                    table_schema["columns"].append(column_schema)

                #Retrieve foreign key relationships to build join dynamically
                cursor.execute(f"""
                    SELECT
                        COLUMN_NAME,  # name of the column in the current table that is a foreign key.
                        REFERENCED_TABLE_NAME,  # The name of the table referenced by the foreign key.
                        REFERENCED_COLUMN_NAME  # name of the column in the referenced table that is the primary key or a unique key.
                    FROM
                        information_schema.KEY_COLUMN_USAGE # This part specifies the table from which the data will be retrieved. 
                    WHERE
                        TABLE_NAME = '{table_name}'
                        AND REFERENCED_TABLE_NAME IS NOT NULL
                """)

                join_info = cursor.fetchall()

                if join_info:
                    table_schema["join"] = []
                    for info in join_info:
                        table_schema["join"].append({
                            "primary_table": table_name,
                            "primary_column": info[0],
                            "foreign_table": info[1],
                            "foreign_column": info[2]
                            }) 

                schema["tables"].append(table_schema)

            cursor.close()

            CustomLogger.info(f"Datasource schema for {ds_req.ds_name} fetched successfully!")
            return {"ds_name": ds_req.ds_name, "schema_description": schema}

    # @staticmethod
    # def fetch_datasource(ds_req):
    #     mong_schema = DataBaseManager.find_ds_schema(ds_req)

    #     if ds_req.type=="mysql" and mong_schema:
    #         CustomLogger.info(f"Schema details fetched from mongoDB: {ds_req.db_name}")
    #         return {"db_name": ds_req.db_name, "schema_description": mong_schema}
        
    #     elif ds_req.type=="text_source":
    #         return {"ds_name": ds_req.ds_name, "all_documents": mong_schema}


    @staticmethod
    def generate_database_description(schema):
        table_descriptions = {}

        tables = schema.get("schema_description", {}).get("tables", [])
        for table_info in tables:
            if table_info.get("enable", True):
                table_name = table_info.get("table_name")
                description = table_info.get("description", "No description available")
                table_description = f"{table_name} - {description}\n"
                columns_description = "column name, data type, display name, description of column\n"

                for column in table_info.get("columns", []):
                    if column.get("enable", True):
                        column_description = f"{column['column_name']}, {column['data_type']}, {column['display_name']}"
                        column_description += f", {column['description']}" if column.get('description') else ""
                        column_description += "\n"
                        columns_description += column_description

                table_descriptions[table_name] = columns_description.strip()

        return table_descriptions








    # @staticmethod     # Phase 1 Code
    # def generate_database_description(schema):
    #     output = ""
    #     table_groups = {}
    #     tables = schema.get("schema_description", {}).get("tables", [])
        
    #     for table_info in tables:
    #         prefix = "_".join(table_info.get("table_name", "").split("_")[:2])
    #         table_groups.setdefault(prefix, []).append(table_info) # . Tables with the same prefix will be grouped together

    #     for prefix, tables in table_groups.items():  # loop over each prefix(table) 
    #         for idx, table_info in enumerate(tables): # loop over each table information
    #             output += f"{table_info['table_name']} - {table_info.get('description', 'No description available')}\n"
    #             if idx == 0:
    #                 output += "column name, data type, display name, description of column(optional)\n"
    #                 for column in table_info.get("columns", []):
    #                     if column.get("enable", True) is not False:
    #                         output += f"{column['column_name']}, {column['data_type']}, {column['display_name']}"
    #                         output += f", {column['description']}" if column.get('description') else ""
    #                         output += "\n"
    #                 if len(tables) > 1: # Multiple tables
    #                     output += "\n"
    #             else:
    #                 output += "The column schema is the same as the previous table.\n\n"

    #     return output