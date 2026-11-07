import os
import zipfile

def create_dist_zip(source_dir, output_zip):
    source_dir = os.path.abspath(source_dir)
    print(f"Packaging {source_dir} -> {output_zip}...")
    
    file_count = 0
    with zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, source_dir)
                # Ensure POSIX style forward slashes for Linux/cPanel compatibility
                archive_name = rel_path.replace(os.sep, '/')
                
                # Check for hidden files like .htaccess
                zipinfo = zipfile.ZipInfo(archive_name)
                zipinfo.external_attr = 0o644 << 16  # standard -rw-r--r-- permission
                
                with open(abs_path, 'rb') as f:
                    zipf.writestr(zipinfo, f.read(), compress_type=zipfile.ZIP_DEFLATED)
                file_count += 1
                
    print(f"Successfully packaged {file_count} files into {output_zip}")

if __name__ == '__main__':
    create_dist_zip('levitate/dist', 'dist.zip')
    import shutil
    shutil.copyfile('dist.zip', 'levitate/dist.zip')
    print("Copied to levitate/dist.zip")
