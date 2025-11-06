# chatbot/run_chatbot.py
import sys, json, re, torch
from transformers import T5ForConditionalGeneration, T5Tokenizer

# Load model once
model = T5ForConditionalGeneration.from_pretrained("./chatbot/chatbot_model")
tokenizer = T5Tokenizer.from_pretrained("./chatbot/chatbot_model")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

def clean_text(text):
    text = re.sub(r'\r\n', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'<.*?>', '', text)
    return text.strip().lower()

# ✅ Read JSON input line-by-line (compatible with python-shell send)
for line in sys.stdin:
    if not line.strip():
        continue

    try:
        data = json.loads(line)
        dialogue = clean_text(data.get("message", ""))
        if not dialogue:
            print(json.dumps({"response": "Please type something."}))
            sys.stdout.flush()
            continue

        inputs = tokenizer(dialogue, return_tensors="pt", truncation=True, padding="max_length", max_length=250)
        inputs = {k: v.to(device) for k, v in inputs.items()}

        outputs = model.generate(
            inputs["input_ids"],
            max_length=250,
            num_beams=4,
            early_stopping=True
        )

        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(json.dumps({"response": response}))
        sys.stdout.flush()

    except Exception as e:
        print(json.dumps({"response": f"Error: {str(e)}"}))
        sys.stdout.flush()
