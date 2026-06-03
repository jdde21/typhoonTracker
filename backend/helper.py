import pandas as pd 

def agencyIdentifier(agency):

    match agency:
        case "JMA":
            database = pd.read_csv('cleaned/cleaned_japan.csv', encoding = 'latin-1')
        case "JTWC":
            database = pd.read_csv('cleaned/cleaned_usa.csv', encoding = 'latin-1')
        case "CMA":
            database = pd.read_csv('cleaned/cleaned_china.csv', encoding = 'latin-1')
        case "HKO":
            database = pd.read_csv('cleaned/cleaned_hongkong.csv', encoding = 'latin-1')
        case "IMD":
            database = pd.read_csv('cleaned/cleaned_india.csv', encoding = 'latin-1')
        case "KMA":
            database = pd.read_csv('cleaned/cleaned_korea.csv', encoding = 'latin-1')
        case _:
            database = pd.read_csv('new_data.csv', encoding = 'latin-1')
    
    return database


            
            


        
        
        