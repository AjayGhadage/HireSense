import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
    TEXT = WORD_NAMESPACE + 't'
    PARA = WORD_NAMESPACE + 'p'
    
    with zipfile.ZipFile(path) as docx:
        tree = ET.fromstring(docx.read('word/document.xml'))
        paragraphs = []
        for paragraph in tree.iter(PARA):
            texts = [node.text for node in paragraph.iter(TEXT) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        return '\n'.join(paragraphs)

def write_docx_to_txt(docx_path, txt_path):
    try:
        text = get_docx_text(docx_path)
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Wrote {txt_path}")
    except Exception as e:
        print(f"Error processing {docx_path}: {e}")

write_docx_to_txt(r"c:\Users\AJAY GHADAGE\OneDrive\Desktop\redrob\India_runs_data_and_ai_challenge\job_description.docx",
                  r"c:\Users\AJAY GHADAGE\OneDrive\Desktop\redrob\India_runs_data_and_ai_challenge\job_description.txt")

write_docx_to_txt(r"c:\Users\AJAY GHADAGE\OneDrive\Desktop\redrob\India_runs_data_and_ai_challenge\redrob_signals_doc.docx",
                  r"c:\Users\AJAY GHADAGE\OneDrive\Desktop\redrob\India_runs_data_and_ai_challenge\redrob_signals_doc.txt")

write_docx_to_txt(r"c:\Users\AJAY GHADAGE\OneDrive\Desktop\redrob\India_runs_data_and_ai_challenge\README.docx",
                  r"c:\Users\AJAY GHADAGE\OneDrive\Desktop\redrob\India_runs_data_and_ai_challenge\README.txt")

write_docx_to_txt(r"c:\Users\AJAY GHADAGE\OneDrive\Desktop\redrob\India_runs_data_and_ai_challenge\submission_spec.docx",
                  r"c:\Users\AJAY GHADAGE\OneDrive\Desktop\redrob\India_runs_data_and_ai_challenge\submission_spec.txt")

