import os
import re

def migrate_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace ::github{repo="owner/repo"} or repo=owner/repo
    # Updated regex to handle optional quotes
    content = re.sub(r'::github\{repo=["\']?([^"\'}]+)["\']?\}', r'[\1](https://github.com/\1)', content)

    # Replace ::url{href="url"} or href=url
    # Updated regex to handle optional quotes
    content = re.sub(r'::url\{href=["\']?([^"\'}]+)["\']?\}', r'[\1](\1)', content)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    target_dir = r'c:\Users\af\Desktop\zola\content\blog'
    if not os.path.exists(target_dir):
        print(f"Directory not found: {target_dir}")
        return

    modified_files = []
    print(f"Scanning directory: {target_dir}")
    
    for filename in os.listdir(target_dir):
        if filename.endswith('.md'):
            file_path = os.path.join(target_dir, filename)
            try:
                if migrate_file(file_path):
                    modified_files.append(filename)
            except Exception as e:
                print(f"Error processing {filename}: {e}")

    if modified_files:
        print(f"Successfully migrated {len(modified_files)} files:")
        for f in modified_files:
            print(f"- {f}")
    else:
        print("No files needed migration.")

if __name__ == '__main__':
    main()
