# Repositorio hyperledger
echo "# hyperledger" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/luisdamo/hyperledger_practicas.git
git push -u origin main
# Actualizar repositorio remoto
git remote add origin https://github.com/luisdamo/hyperledger_jld.git
git add .
git commit -m "sincronización repositorio remoto"
git branch -M latest
git push -u origin latest
# Forzar a sincronización local
git push --force -u origin latest