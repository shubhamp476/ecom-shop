"""Create a shareable source archive without local credentials or generated caches."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
ROOT=Path(__file__).resolve().parent.parent
FILES=['AGENTS.md','README.md','package.json','package-lock.json','next.config.ts','tsconfig.json','postcss.config.mjs','netlify.toml','render.yaml','requirements.txt','.env.example','.gitignore','Final_Project_Report.docx']
files=[ROOT/name for name in FILES if (ROOT/name).exists()]
for directory in ['src','public','backend','docs','scripts']:
    for p in (ROOT/directory).rglob('*'):
        if p.is_file() and not any(part in ['__pycache__','.pytest_cache','node_modules'] for part in p.parts) and not p.name.startswith('.env'):
            files.append(p)
output=ROOT/'ECOM-SHOP-Updated.zip'
with ZipFile(output,'w',ZIP_DEFLATED) as archive:
    for p in sorted(files): archive.write(p,Path('ECOM-SHOP')/p.relative_to(ROOT))
print(f'{output}: {len(files)} files, {output.stat().st_size:,} bytes')
