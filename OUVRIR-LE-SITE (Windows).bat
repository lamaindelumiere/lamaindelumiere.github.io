@echo off
chcp 65001 >nul
title La Main de Lumiere - site en local
cd /d "%~dp0site-html"
echo.
echo   La Main de Lumiere - lancement du site en local...
echo.
py --version >nul 2>nul && goto avecpy
python --version >nul 2>nul && goto avecpython
echo   Python n'est pas installe : ouverture directe du site dans le navigateur.
start "" "%~dp0site-html\index.html"
timeout /t 4 >nul
goto :eof
:avecpy
echo   Site disponible sur : http://localhost:8000/
echo   Laissez cette fenetre ouverte. Fermez-la pour arreter le site.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8000/"
py -m http.server 8000
goto :eof
:avecpython
echo   Site disponible sur : http://localhost:8000/
echo   Laissez cette fenetre ouverte. Fermez-la pour arreter le site.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8000/"
python -m http.server 8000
