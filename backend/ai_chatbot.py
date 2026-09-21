from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv



def define_retriever():
    load_dotenv()
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    loader = TextLoader("typhoon-tracker-guide.md")
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=300,
    chunk_overlap=50)
    splits = text_splitter.split_documents(documents)
    vectorstore = Chroma.from_documents(documents=splits,embedding=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
    return retriever

def chatbot(retriever, question):
    docs = retriever.invoke(question)
    template = """Answer the question based only on the following context:
        {context}

        Question: {question}
        """
    prompt = ChatPromptTemplate.from_template(template)
    llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash",temperature=0)
    chain = prompt | llm | StrOutputParser()
    answer = chain.invoke({"context":docs, "question": question})
    return answer
