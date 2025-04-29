import os
import requests
from pathlib import Path

def download_file(url, filename):
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

def main():
    # Create directories if they don't exist
    model_dir = Path('public/models/yolov5_web_model')
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # Download model files
    model_url = 'https://github.com/ultralytics/yolov5/releases/download/v7.0/yolov5s.pt'
    model_path = model_dir / 'yolov5s.pt'
    
    print('Downloading YOLOv5 model...')
    download_file(model_url, model_path)
    print('Download complete!')
    
    # Convert model to TensorFlow.js format
    print('Converting model to TensorFlow.js format...')
    os.system(f'python -m pip install tensorflowjs')
    os.system(f'tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model --signature_name=serving_default --saved_model_tags=serve {model_path} {model_dir}')
    print('Conversion complete!')

if __name__ == '__main__':
    main() 